# ============================
# ENHANCED MUSIC RECOMMENDATION API (STABLE VERSION)
# ============================

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.neighbors import NearestNeighbors
from sklearn.decomposition import PCA
from sklearn.cluster import MiniBatchKMeans
import pickle
import os
import logging
from datetime import datetime

# ============================
# LOGGING
# ============================
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# ============================
# MODEL
# ============================
class EnhancedMusicRecommendationModel:

    def __init__(self, n_components=10, diversity_weight=0.3):
        self.scaler = StandardScaler()
        self.emotion_encoder = LabelEncoder()
        self.genre_encoder = LabelEncoder()
        self.key_encoder = LabelEncoder()
        self.pca = PCA(n_components=n_components, random_state=42)
        self.nn = None
        self.kmeans = None
        self.df = None
        self.features_scaled = None
        self.diversity_weight = diversity_weight

        self.feature_columns = [
            "emotion_encoded",
            "genre_encoded",
            "key_pitch_encoded",
            "key_mode",
            "Tempo",
            "Loudness",
            "Popularity",
            "Energy",
            "Danceability",
            "Positiveness",
            "Speechiness",
            "Liveness",
            "Acousticness",
            "Instrumentalness",
            "variance",
            "Explicit"
        ]

    # ============================
    # PREPROCESS
    # ============================
    def preprocess_data(self, df: pd.DataFrame):
        self.df = df.copy()

        # Normalize emotion
        self.df["emotion"] = self.df["emotion"].str.strip().str.lower()

        # Explicit -> numeric
        self.df["Explicit"] = (
            self.df["Explicit"]
            .astype(str)
            .str.lower()
            .map({"yes": 1, "true": 1, "1": 1, "no": 0, "false": 0, "0": 0})
            .fillna(0)
            .astype(int)
        )

        # Key engineering
        self.df["key_pitch"] = self.df["Key"].str.extract(r"([A-G]#?)")[0].fillna("C")
        self.df["key_mode"] = self.df["Key"].str.contains("Maj").astype(int)

        # Encode categoricals
        self.df["emotion_encoded"] = self.emotion_encoder.fit_transform(self.df["emotion"])
        self.df["genre_encoded"] = self.genre_encoder.fit_transform(self.df["Genre"])
        self.df["key_pitch_encoded"] = self.key_encoder.fit_transform(self.df["key_pitch"])

        # Scale
        features = self.df[self.feature_columns]
        self.features_scaled = self.scaler.fit_transform(features)

        # PCA (SAFE)
        max_components = min(
            self.features_scaled.shape[0] - 1,
            self.features_scaled.shape[1],
            self.pca.n_components
        )
        self.pca = PCA(n_components=max_components, random_state=42)
        self.features_scaled = self.pca.fit_transform(self.features_scaled)

        # Nearest Neighbors
        self.nn = NearestNeighbors(metric="cosine", algorithm="brute")
        self.nn.fit(self.features_scaled)

        # Clustering (SAFE)
        n_clusters = max(2, min(10, len(self.df) // 5))
        self.kmeans = MiniBatchKMeans(n_clusters=n_clusters, random_state=42)
        self.df["cluster"] = self.kmeans.fit_predict(self.features_scaled)

        logger.info("Model preprocessing completed successfully")
        return self

    # ============================
    # RECOMMENDATION
    # ============================
    def recommend_by_emotion(self, emotion, n=10):
        emotion = emotion.lower().strip()

        if emotion not in self.df["emotion"].unique():
            return {"error": f"Emotion '{emotion}' not found"}

        ref_songs = self.df[self.df["emotion"] == emotion]
        ref_idx = ref_songs.sample(1).index[0]
        idx = self.df.index.get_loc(ref_idx)

        distances, indices = self.nn.kneighbors(
            [self.features_scaled[idx]],
            n_neighbors=min(n + 1, len(self.df))
        )

        results = []
        for i in indices[0][1:]:
            song = self.df.iloc[i]
            if song["emotion"] != emotion:
                continue
            results.append({
                "artist": song["artist"],
                "song": song["song"],
                "emotion": song["emotion"],
                "genre": song["Genre"],
                "popularity": int(song["Popularity"]),
                "energy": int(song["Energy"]),
                "danceability": int(song["Danceability"],
                )
            })

            if len(results) >= n:
                break

        return {
            "emotion": emotion,
            "count": len(results),
            "recommendations": results,
            "pca_variance_explained": round(float(self.pca.explained_variance_ratio_.sum()), 3)
        }

    # ============================
    # INFO
    # ============================
    def model_info(self):
        return {
            "songs": len(self.df),
            "emotions": self.df["emotion"].nunique(),
            "genres": self.df["Genre"].nunique(),
            "pca_components": self.pca.n_components_,
            "variance_explained": round(float(self.pca.explained_variance_ratio_.sum()), 3),
            "clusters": self.kmeans.n_clusters
        }

    # ============================
    # SAVE / LOAD
    # ============================
    def save(self, path="model.pkl"):
        with open(path, "wb") as f:
            pickle.dump(self, f)

    @staticmethod
    def load(path="model.pkl"):
        with open(path, "rb") as f:
            return pickle.load(f)

# ============================
# FLASK API
# ============================
app = Flask(__name__)
CORS(app)

model = None

@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
        "time": datetime.now().isoformat()
    })

@app.route("/api/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    emotion = data.get("emotion")
    n = min(int(data.get("num_recommendations", 10)), 20)

    if not emotion:
        return jsonify({"error": "emotion required"}), 400

    return jsonify(model.recommend_by_emotion(emotion, n))

@app.route("/api/model-info")
def info():
    return jsonify(model.model_info())

# ============================
# STARTUP
# ============================
def init():
    global model

    if os.path.exists("model.pkl"):
        model = EnhancedMusicRecommendationModel.load("model.pkl")
        logger.info("Loaded existing model")
        return

    df = pd.read_csv("light_spotify_dataset.csv")
    model = EnhancedMusicRecommendationModel()
    model.preprocess_data(df)
    model.save("model.pkl")
    logger.info("Trained and saved new model")

@app.route("/api/options", methods=["GET"])
def api_options():
    if model is None or model.df is None:
        return jsonify({"error": "Model not initialized"}), 500

    df = model.df

    return jsonify({
        "emotions": sorted(df["emotion"].unique().tolist()),
        "genres": sorted(df["Genre"].unique().tolist()),
        "keys": sorted(df["Key"].unique().tolist()),
        "tempo_range": {
            "min": int(df["Tempo"].min()),
            "max": int(df["Tempo"].max())
        },
        "energy_range": {
            "min": int(df["Energy"].min()),
            "max": int(df["Energy"].max())
        },
        "danceability_range": {
            "min": int(df["Danceability"].min()),
            "max": int(df["Danceability"].max())
        },
        "total_songs": len(df),
        "pca_components": model.pca.n_components_,
        "total_clusters": model.kmeans.n_clusters,
        "pca_variance_explained": round(
            float(model.pca.explained_variance_ratio_.sum()), 3
        ),
        "model_version": "2.0"
    })


@app.route("/api/similar", methods=["POST"])
def api_similar():
    try:
        if model is None or model.df is None:
            return jsonify({"error": "Model not initialized"}), 500

        data = request.get_json() or {}
        artist = data.get("artist", "").strip()
        song = data.get("song", "").strip()
        n = min(int(data.get("num_recommendations", 6)), 20)

        if not artist or not song:
            return jsonify({"error": "artist and song are required"}), 400

        df = model.df

        # Strict match first
        mask = (
            df["artist"].str.lower() == artist.lower()
        ) & (
            df["song"].str.lower() == song.lower()
        )

        if not mask.any():
            return jsonify({
                "error": f"Song '{song}' by '{artist}' not found"
            }), 404

        song_idx = df[mask].index[0]
        idx = df.index.get_loc(song_idx)

        distances, indices = model.nn.kneighbors(
            [model.features_scaled[idx]],
            n_neighbors=min(n + 1, len(df))
        )

        similar = []
        for i in indices[0][1:]:
            row = df.iloc[i]
            similar.append({
                "artist": row["artist"],
                "song": row["song"],
                "emotion": row["emotion"],
                "genre": row["Genre"],
                "similarity_score": round(
                    float(1 - distances[0][list(indices[0]).index(i)]), 4
                ),
                "popularity": int(row["Popularity"]),
                "tempo": int(row["Tempo"]),
                "energy": row["Energy"] / 100,
                "danceability": row["Danceability"] / 100
            })

        return jsonify({
            "similar_songs": similar,
            "reference_song": {
                "artist": artist,
                "song": song
            },
            "algorithm": "cosine_knn_pca"
        })

    except Exception as e:
        logger.exception("Similar songs error")
        return jsonify({"error": str(e)}), 500


@app.route("/api/debug", methods=["GET"])
def api_debug():
    if model is None:
        return jsonify({
            "model_loaded": False,
            "model_has_data": False
        })

    return jsonify({
        "model_loaded": True,
        "model_has_data": model.df is not None,
        "total_rows": len(model.df) if model.df is not None else 0,
        "sample_emotions": (
            model.df["emotion"].unique().tolist()
            if model.df is not None else []
        )
    })


if __name__ == "__main__":
    init()
    app.run(host="0.0.0.0", port=5005, debug=True)