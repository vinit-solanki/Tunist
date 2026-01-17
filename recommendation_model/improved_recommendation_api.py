# ============================
# IMPROVED MUSIC RECOMMENDATION API v3
# ============================
# Features:
# - Genre-based recommendations
# - Multi-emotion recommendations with fallback
# - Hybrid recommendation engine
# - Better diversity and coverage

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.neighbors import NearestNeighbors
from sklearn.decomposition import PCA
from sklearn.cluster import MiniBatchKMeans
from sklearn.metrics.pairwise import cosine_similarity
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
# IMPROVED MODEL
# ============================
class ImprovedMusicRecommendationModel:

    def __init__(self, n_components=15, diversity_weight=0.4):
        self.scaler = StandardScaler()
        self.emotion_encoder = LabelEncoder()
        self.genre_encoder = LabelEncoder()
        self.key_encoder = LabelEncoder()
        self.pca = PCA(n_components=n_components, random_state=42)
        self.nn = None
        self.genre_nn = None
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

        # Nearest Neighbors for general recommendations
        self.nn = NearestNeighbors(metric="cosine", algorithm="brute")
        self.nn.fit(self.features_scaled)

        # Genre-specific NN model
        self.genre_nn = {}
        for genre in self.df["Genre"].unique():
            genre_data = self.features_scaled[self.df["Genre"] == genre]
            if len(genre_data) > 1:
                nn = NearestNeighbors(metric="cosine", algorithm="brute")
                nn.fit(genre_data)
                self.genre_nn[genre] = nn

        # Clustering
        n_clusters = max(2, min(15, len(self.df) // 10))
        self.kmeans = MiniBatchKMeans(n_clusters=n_clusters, random_state=42)
        self.df["cluster"] = self.kmeans.fit_predict(self.features_scaled)

        logger.info(f"Model preprocessing completed. Genres: {self.df['Genre'].nunique()}, Emotions: {self.df['emotion'].nunique()}")
        return self

    # ============================
    # EMOTION-BASED WITH FALLBACK
    # ============================
    def recommend_by_emotion_improved(self, emotion, n=15):
        """
        Improved emotion-based recommendations with fallback strategy
        """
        emotion = emotion.lower().strip()
        
        if emotion not in self.df["emotion"].unique():
            # Try to find similar emotions
            available = self.df["emotion"].unique()
            return {
                "error": f"Emotion '{emotion}' not found",
                "available_emotions": sorted(available.tolist())[:10]
            }

        ref_songs = self.df[self.df["emotion"] == emotion]
        if len(ref_songs) == 0:
            return {"error": f"No songs with emotion '{emotion}'"}

        # Get multiple reference songs for better diversity
        n_refs = min(3, len(ref_songs))
        ref_indices = ref_songs.sample(n=n_refs, random_state=42).index

        results = []
        seen_songs = set()

        for ref_idx in ref_indices:
            idx = self.df.index.get_loc(ref_idx)
            
            # Get more neighbors to ensure we have enough variety
            distances, indices = self.nn.kneighbors(
                [self.features_scaled[idx]],
                n_neighbors=min(n * 2, len(self.df))
            )

            for i in indices[0][1:]:  # Skip self
                song_idx = self.df.index[i]
                song = self.df.iloc[i]
                song_key = f"{song['artist']}|{song['song']}"

                # Avoid duplicates
                if song_key in seen_songs:
                    continue

                results.append({
                    "artist": song["artist"],
                    "song": song["song"],
                    "emotion": song["emotion"],
                    "genre": song["Genre"],
                    "popularity": int(song["Popularity"]),
                    "energy": int(song["Energy"]),
                    "danceability": int(song["Danceability"]),
                    "tempo": int(song["Tempo"]),
                    "similarity_score": round(float(1 - distances[0][list(indices[0]).index(i)]), 4)
                })
                seen_songs.add(song_key)

                if len(results) >= n:
                    break
            
            if len(results) >= n:
                break

        # If we don't have enough, add from any emotion but same genre
        if len(results) < n:
            primary_genre = ref_songs.iloc[0]["Genre"]
            genre_mask = self.df["Genre"] == primary_genre
            remaining_needed = n - len(results)
            
            extra = self.df[genre_mask].sample(
                n=min(remaining_needed, len(self.df[genre_mask])),
                random_state=42
            )
            
            for _, song in extra.iterrows():
                song_key = f"{song['artist']}|{song['song']}"
                if song_key not in seen_songs:
                    results.append({
                        "artist": song["artist"],
                        "song": song["song"],
                        "emotion": song["emotion"],
                        "genre": song["Genre"],
                        "popularity": int(song["Popularity"]),
                        "energy": int(song["Energy"]),
                        "danceability": int(song["Danceability"]),
                        "tempo": int(song["Tempo"]),
                        "similarity_score": 0.5  # Lower confidence for fallback
                    })

        return {
            "emotion": emotion,
            "count": len(results[:n]),
            "recommendations": results[:n],
            "pca_variance_explained": round(float(self.pca.explained_variance_ratio_.sum()), 3),
            "algorithm": "emotion_aware_hybrid"
        }

    # ============================
    # GENRE-BASED RECOMMENDATIONS
    # ============================
    def recommend_by_genre(self, genre, n=15):
        """
        Genre-specific recommendations
        """
        genre = genre.strip()
        
        if genre not in self.df["Genre"].unique():
            return {
                "error": f"Genre '{genre}' not found",
                "available_genres": sorted(self.df["Genre"].unique().tolist())[:15]
            }

        genre_songs = self.df[self.df["Genre"] == genre]
        if len(genre_songs) < 1:
            return {"error": f"No songs in genre '{genre}'"}

        # Random sample from genre for variety
        sample_size = min(5, len(genre_songs))
        sample_indices = genre_songs.sample(n=sample_size, random_state=42).index

        results = []
        seen = set()

        for ref_idx in sample_indices:
            idx = self.df.index.get_loc(ref_idx)
            distances, indices = self.nn.kneighbors(
                [self.features_scaled[idx]],
                n_neighbors=min(n + 1, len(self.df))
            )

            for i in indices[0][1:]:
                song = self.df.iloc[i]
                song_key = f"{song['artist']}|{song['song']}"
                
                if song_key not in seen and song["Genre"] == genre:
                    results.append({
                        "artist": song["artist"],
                        "song": song["song"],
                        "emotion": song["emotion"],
                        "genre": song["Genre"],
                        "popularity": int(song["Popularity"]),
                        "energy": int(song["Energy"]),
                        "danceability": int(song["Danceability"]),
                        "tempo": int(song["Tempo"])
                    })
                    seen.add(song_key)

                if len(results) >= n:
                    break
            
            if len(results) >= n:
                break

        return {
            "genre": genre,
            "count": len(results),
            "recommendations": results[:n],
            "algorithm": "genre_aware_hybrid"
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
            "clusters": self.kmeans.n_clusters,
            "unique_emotions": sorted(self.df["emotion"].unique().tolist()),
            "unique_genres": sorted(self.df["Genre"].unique().tolist())[:20]
        }

    # ============================
    # SAVE / LOAD
    # ============================
    def save(self, path="model_improved.pkl"):
        with open(path, "wb") as f:
            pickle.dump(self, f)

    @staticmethod
    def load(path="model_improved.pkl"):
        with open(path, "rb") as f:
            return pickle.load(f)

# ============================
# FLASK API
# ============================
app = Flask(__name__)
CORS(app)

model = None

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
        "time": datetime.now().isoformat()
    })

@app.route("/api/recommend", methods=["POST"])
def recommend():
    """
    Improved emotion-based recommendations
    """
    try:
        data = request.get_json() or {}
        emotion = data.get("emotion", "").strip()
        n = min(int(data.get("num_recommendations", 15)), 50)

        if not emotion:
            return jsonify({"error": "emotion required"}), 400

        result = model.recommend_by_emotion_improved(emotion, n=n)
        return jsonify(result)
    except Exception as e:
        logger.exception("Recommend error")
        return jsonify({"error": str(e)}), 500

@app.route("/api/recommend-by-genre", methods=["POST"])
def recommend_by_genre():
    """
    Genre-based recommendations
    """
    try:
        data = request.get_json() or {}
        genre = data.get("genre", "").strip()
        n = min(int(data.get("num_recommendations", 15)), 50)

        if not genre:
            return jsonify({"error": "genre required"}), 400

        result = model.recommend_by_genre(genre, n=n)
        return jsonify(result)
    except Exception as e:
        logger.exception("Genre recommend error")
        return jsonify({"error": str(e)}), 500

@app.route("/api/model-info", methods=["GET"])
def info():
    return jsonify(model.model_info())

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
        "pca_variance_explained": round(float(model.pca.explained_variance_ratio_.sum()), 3),
        "model_version": "3.0"
    })

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
            sorted(model.df["emotion"].unique().tolist())
            if model.df is not None else []
        ),
        "sample_genres": (
            sorted(model.df["Genre"].unique().tolist())[:10]
            if model.df is not None else []
        )
    })

# ============================
# STARTUP
# ============================
def init():
    global model

    # Try to load improved model first
    if os.path.exists("model_improved.pkl"):
        try:
            model = ImprovedMusicRecommendationModel.load("model_improved.pkl")
            logger.info("Loaded existing improved model")
            return
        except:
            logger.warning("Failed to load model_improved.pkl, training new one")

    # Train new model
    df = pd.read_csv("light_spotify_dataset.csv")
    model = ImprovedMusicRecommendationModel(n_components=15, diversity_weight=0.4)
    model.preprocess_data(df)
    model.save("model_improved.pkl")
    logger.info("Trained and saved improved model")

if __name__ == "__main__":
    init()
    app.run(host="0.0.0.0", port=5005, debug=False)
