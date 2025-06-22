import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.neighbors import NearestNeighbors
from sklearn.decomposition import PCA
import pickle
import os

class MusicRecommendationModel:
    def __init__(self):
        self.scaler = StandardScaler()
        self.emotion_encoder = LabelEncoder()
        self.genre_encoder = LabelEncoder()
        self.key_encoder = LabelEncoder()
        self.pca = PCA(n_components=10)
        self.nn_model = None
        self.df = None
        self.features_scaled = None

    def preprocess_data(self, df):
        """Preprocess the dataset for recommendation"""
        self.df = df.copy()

        if len(self.df) > 10000:
            self.df = self.df.sample(n=5000, random_state=42)
            print(f"Reduced dataset to {len(self.df)} rows for memory efficiency")

        self.df = self.df.fillna(self.df.mean(numeric_only=True))

        self.df['emotion_encoded'] = self.emotion_encoder.fit_transform(self.df['emotion'])
        self.df['genre_encoded'] = self.genre_encoder.fit_transform(self.df['Genre'])
        self.df['key_encoded'] = self.key_encoder.fit_transform(self.df['Key'])
        self.df['explicit_encoded'] = self.df['Explicit'].map({'Yes': 1, 'No': 0})

        feature_columns = [
            'emotion_encoded', 'variance', 'genre_encoded', 'key_encoded',
            'Tempo', 'Loudness', 'explicit_encoded', 'Energy', 'Danceability',
            'Positiveness', 'Speechiness', 'Liveness', 'Acousticness', 'Instrumentalness'
        ]

        features = self.df[feature_columns]
        self.features_scaled = self.scaler.fit_transform(features)
        self.features_scaled = self.pca.fit_transform(self.features_scaled)

        self.nn_model = NearestNeighbors(metric='cosine', algorithm='brute')
        self.nn_model.fit(self.features_scaled)

        return self

    def get_emotion_based_recommendations(self, target_emotion, num_recommendations=10, filters=None):
        if self.df is None:
            raise ValueError("Model not trained. Please call preprocess_data first.")

        emotion_songs = self.df[self.df['emotion'] == target_emotion].copy()

        if len(emotion_songs) == 0:
            return {"error": f"No songs found for emotion: {target_emotion}"}

        if filters:
            if 'genre' in filters and filters['genre']:
                emotion_songs = emotion_songs[emotion_songs['Genre'].isin(filters['genre'])]
            if 'tempo_min' in filters:
                emotion_songs = emotion_songs[emotion_songs['Tempo'] >= filters['tempo_min']]
            if 'tempo_max' in filters:
                emotion_songs = emotion_songs[emotion_songs['Tempo'] <= filters['tempo_max']]
            if 'energy_min' in filters:
                emotion_songs = emotion_songs[emotion_songs['Energy'] >= filters['energy_min']]
            if 'energy_max' in filters:
                emotion_songs = emotion_songs[emotion_songs['Energy'] <= filters['energy_max']]
            if 'danceability_min' in filters:
                emotion_songs = emotion_songs[emotion_songs['Danceability'] >= filters['danceability_min']]
            if 'danceability_max' in filters:
                emotion_songs = emotion_songs[emotion_songs['Danceability'] <= filters['danceability_max']]
            if 'explicit' in filters:
                explicit_value = 'Yes' if filters['explicit'] else 'No'
                emotion_songs = emotion_songs[emotion_songs['Explicit'] == explicit_value]

        if len(emotion_songs) == 0:
            return {"error": "No songs found matching the specified criteria"}

        recommendations = emotion_songs.nlargest(num_recommendations, 'Popularity')

        result = [
            {
                'artist': song['artist'],
                'song': song['song'],
                'emotion': song['emotion'],
                'genre': song['Genre'],
                'release_date': song['Release Date'],
                'key': song['Key'],
                'tempo': song['Tempo'],
                'energy': song['Energy'],
                'danceability': song['Danceability'],
                'positiveness': song['Positiveness'],
                'popularity': song['Popularity'],
                'explicit': song['Explicit']
            }
            for _, song in recommendations.iterrows()
        ]

        return {
            'recommendations': result,
            'total_found': len(emotion_songs),
            'emotion': target_emotion,
            'filters_applied': filters or {}
        }

    def get_similar_songs(self, artist, song_title, num_recommendations=10):
        if self.df is None or self.nn_model is None:
            raise ValueError("Model not trained. Please call preprocess_data first.")

        song_mask = (self.df['artist'] == artist) & (self.df['song'] == song_title)
        song_indices = self.df[song_mask].index

        if len(song_indices) == 0:
            return {"error": f"Song '{song_title}' by '{artist}' not found"}

        song_idx = song_indices[0]
        distances, indices = self.nn_model.kneighbors([self.features_scaled[song_idx]], n_neighbors=num_recommendations + 1)
        similar_indices = indices[0][1:]

        similar_songs = self.df.iloc[similar_indices]

        result = [
            {
                'artist': song['artist'],
                'song': song['song'],
                'emotion': song['emotion'],
                'genre': song['Genre'],
                'similarity_score': round(1 - distances[0][i+1], 4),
                'release_date': song['Release Date'],
                'popularity': song['Popularity']
            }
            for i, (_, song) in enumerate(similar_songs.iterrows())
        ]

        return {
            'similar_songs': result,
            'reference_song': {'artist': artist, 'title': song_title}
        }

    def get_available_options(self):
        if self.df is None:
            raise ValueError("Model not trained. Please call preprocess_data first.")

        return {
            'emotions': sorted(self.df['emotion'].unique().tolist()),
            'genres': sorted(self.df['Genre'].unique().tolist()),
            'keys': sorted(self.df['Key'].unique().tolist()),
            'tempo_range': {
                'min': int(self.df['Tempo'].min()),
                'max': int(self.df['Tempo'].max())
            },
            'energy_range': {
                'min': int(self.df['Energy'].min()),
                'max': int(self.df['Energy'].max())
            },
            'danceability_range': {
                'min': int(self.df['Danceability'].min()),
                'max': int(self.df['Danceability'].max())
            }
        }

    def save_model(self, filepath='music_recommendation_model.pkl'):
        model_data = {
            'scaler': self.scaler,
            'emotion_encoder': self.emotion_encoder,
            'genre_encoder': self.genre_encoder,
            'key_encoder': self.key_encoder,
            'pca': self.pca,
            'df': self.df,
            'features_scaled': self.features_scaled
        }
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        print(f"Model saved to {filepath}")

    def load_model(self, filepath='music_recommendation_model.pkl'):
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Model file {filepath} not found")

        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)

        self.scaler = model_data['scaler']
        self.emotion_encoder = model_data['emotion_encoder']
        self.genre_encoder = model_data['genre_encoder']
        self.key_encoder = model_data['key_encoder']
        self.pca = model_data['pca']
        self.df = model_data['df']
        self.features_scaled = model_data['features_scaled']

        self.nn_model = NearestNeighbors(metric='cosine', algorithm='brute')
        self.nn_model.fit(self.features_scaled)

        print(f"Model loaded from {filepath}")
        return self