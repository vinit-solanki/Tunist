# model.py
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.neighbors import NearestNeighbors
from sklearn.decomposition import PCA
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MusicRecommendationModel:
    def __init__(self, n_components=10):
        """
        Initialize the Music Recommendation Model
        
        Args:
            n_components (int): Number of PCA components to use
        """
        self.scaler = StandardScaler()
        self.emotion_encoder = LabelEncoder()
        self.genre_encoder = LabelEncoder()
        self.key_encoder = LabelEncoder()
        self.pca = PCA(n_components=n_components, random_state=42)
        self.nn_model = None
        self.df = None
        self.features_scaled = None
        self.feature_columns = [
            'emotion_encoded', 'variance', 'genre_encoded', 'key_encoded',
            'Tempo', 'Loudness', 'explicit_encoded', 'Energy', 'Danceability',
            'Positiveness', 'Speechiness', 'Liveness', 'Acousticness', 'Instrumentalness'
        ]
        logger.info(f"Initialized MusicRecommendationModel with {n_components} PCA components")

    def preprocess_data(self, df):
        """
        Preprocess dataset for recommendations using PCA and scaling
        
        Args:
            df (pd.DataFrame): Raw music dataset
            
        Returns:
            self: Returns the instance for method chaining
        """
        logger.info(f"Starting preprocessing with {len(df)} songs")
        self.df = df.copy()

        # Limit dataset size for performance while maintaining diversity
        if len(self.df) > 15000:
            # Sample stratified by emotion to maintain balance
            self.df = self.df.groupby('emotion').apply(
                lambda x: x.sample(min(len(x), 500), random_state=42)
            ).reset_index(drop=True)
            logger.info(f"Sampled dataset to {len(self.df)} songs")

        # Handle missing values
        numeric_columns = self.df.select_dtypes(include=[np.number]).columns
        self.df[numeric_columns] = self.df[numeric_columns].fillna(self.df[numeric_columns].mean())
        
        categorical_columns = ['emotion', 'Genre', 'Key', 'Explicit']
        for col in categorical_columns:
            if col in self.df.columns:
                self.df[col] = self.df[col].fillna(self.df[col].mode()[0] if not self.df[col].mode().empty else 'Unknown')

        # Encode categorical variables
        try:
            self.df['emotion_encoded'] = self.emotion_encoder.fit_transform(self.df['emotion'].astype(str))
            self.df['genre_encoded'] = self.genre_encoder.fit_transform(self.df['Genre'].astype(str))
            self.df['key_encoded'] = self.key_encoder.fit_transform(self.df['Key'].astype(str))
            self.df['explicit_encoded'] = self.df['Explicit'].map({'Yes': 1, 'No': 0, True: 1, False: 0}).fillna(0)
        except Exception as e:
            logger.error(f"Error in encoding: {e}")
            raise

        # Calculate variance if not present
        if 'variance' not in self.df.columns:
            audio_features = ['Energy', 'Danceability', 'Positiveness', 'Speechiness', 'Liveness', 'Acousticness']
            available_features = [col for col in audio_features if col in self.df.columns]
            if available_features:
                self.df['variance'] = self.df[available_features].var(axis=1)
            else:
                self.df['variance'] = 0
                logger.warning("No audio features found for variance calculation")

        # Select and prepare features
        available_feature_columns = [col for col in self.feature_columns if col in self.df.columns]
        logger.info(f"Using features: {available_feature_columns}")
        
        features = self.df[available_feature_columns]
        
        # Scale features
        self.features_scaled = self.scaler.fit_transform(features)
        logger.info(f"Features scaled. Shape: {self.features_scaled.shape}")
        
        # Apply PCA for dimensionality reduction
        self.features_scaled = self.pca.fit_transform(self.features_scaled)
        logger.info(f"PCA applied. New shape: {self.features_scaled.shape}")
        logger.info(f"PCA explained variance ratio: {self.pca.explained_variance_ratio_[:5]}")

        # Initialize Nearest Neighbors model with cosine similarity
        self.nn_model = NearestNeighbors(
            n_neighbors=min(50, len(self.df)), 
            metric='cosine', 
            algorithm='brute'
        )
        self.nn_model.fit(self.features_scaled)
        
        logger.info("Model preprocessing completed successfully")
        return self

    def get_emotion_based_recommendations(self, target_emotion, num_recommendations=10, filters=None):
        """
        Get song recommendations based on emotion using PCA features and cosine similarity
        
        Args:
            target_emotion (str): Target emotion for recommendations
            num_recommendations (int): Number of recommendations to return
            filters (dict): Additional filters to apply
            
        Returns:
            dict: Dictionary containing recommendations and metadata
        """
        if self.df is None or self.nn_model is None:
            raise ValueError("Model not trained. Please call preprocess_data first.")

        logger.info(f"Getting recommendations for emotion: {target_emotion}")
        
        # Filter by emotion
        emotion_songs = self.df[self.df['emotion'].str.lower() == target_emotion.lower()].copy()
        if len(emotion_songs) == 0:
            available_emotions = self.df['emotion'].unique().tolist()
            return {
                "error": f"No songs found for emotion: {target_emotion}",
                "available_emotions": available_emotions
            }

        # Apply additional filters
        if filters:
            emotion_songs = self._apply_filters(emotion_songs, filters)
            if len(emotion_songs) == 0:
                return {"error": "No songs found matching the criteria"}

        # Find the most popular song as reference for similarity
        reference_song_idx = emotion_songs.nlargest(1, 'Popularity').index[0]
        reference_idx_in_scaled = self.df.index.get_loc(reference_song_idx)
        
        # Get similar songs using cosine similarity through NearestNeighbors
        distances, indices = self.nn_model.kneighbors(
            [self.features_scaled[reference_idx_in_scaled]], 
            n_neighbors=min(num_recommendations * 3, len(self.df))
        )
        
        # Filter results to match target emotion and create recommendations
        similar_indices = []
        for i, idx in enumerate(indices[0][1:]):  # Skip first as it's the reference song
            if self.df.iloc[idx]['emotion'].lower() == target_emotion.lower():
                similar_indices.append((idx, distances[0][i+1]))
            if len(similar_indices) >= num_recommendations:
                break
        
        # Create result list
        result = []
        for idx, distance in similar_indices:
            song = self.df.iloc[idx]
            similarity_score = 1 - distance  # Convert distance to similarity
            
            result.append({
                'artist': str(song.get('artist', song.get('Artist', 'Unknown'))),
                'song': str(song.get('song', song.get('Song', song.get('Track Name', 'Unknown')))),
                'emotion': str(song['emotion']),
                'genre': str(song.get('Genre', 'Unknown')),
                'similarity_score': round(float(similarity_score), 4),
                'release_date': str(song.get('Release Date', song.get('release_date', 'Unknown'))),
                'popularity': int(song.get('Popularity', song.get('popularity', 0))),
                'tempo': round(float(song.get('Tempo', 0)), 2),
                'energy': round(float(song.get('Energy', 0)), 2),
                'danceability': round(float(song.get('Danceability', 0)), 2)
            })

        logger.info(f"Generated {len(result)} recommendations")
        
        return {
            'recommendations': result,
            'total_found': len(emotion_songs),
            'emotion': target_emotion,
            'filters_applied': filters or {},
            'pca_components_used': self.pca.n_components_,
            'reference_song': {
                'artist': str(self.df.loc[reference_song_idx].get('artist', 'Unknown')),
                'song': str(self.df.loc[reference_song_idx].get('song', 'Unknown'))
            }
        }

    def get_similar_songs(self, artist, song_title, num_recommendations=10):
        """
        Get songs similar to a specific song using PCA features and cosine similarity
        
        Args:
            artist (str): Artist name
            song_title (str): Song title
            num_recommendations (int): Number of recommendations to return
            
        Returns:
            dict: Dictionary containing similar songs and metadata
        """
        if self.df is None or self.nn_model is None:
            raise ValueError("Model not trained. Please call preprocess_data first.")

        logger.info(f"Finding songs similar to '{song_title}' by '{artist}'")
        
        # Find the target song
        artist_col = 'artist' if 'artist' in self.df.columns else 'Artist'
        song_col = 'song' if 'song' in self.df.columns else 'Song'
        if song_col not in self.df.columns:
            song_col = 'Track Name'
            
        song_mask = (
            self.df[artist_col].str.lower().str.contains(artist.lower(), na=False) & 
            self.df[song_col].str.lower().str.contains(song_title.lower(), na=False)
        )
        
        song_indices = self.df[song_mask].index
        if len(song_indices) == 0:
            return {"error": f"Song '{song_title}' by '{artist}' not found in the dataset"}

        song_idx = song_indices[0]
        scaled_idx = self.df.index.get_loc(song_idx)
        
        # Find similar songs using cosine similarity
        distances, indices = self.nn_model.kneighbors(
            [self.features_scaled[scaled_idx]], 
            n_neighbors=num_recommendations + 1
        )
        
        similar_indices = indices[0][1:]  # Skip the first one (original song)
        similar_songs = self.df.iloc[similar_indices]

        result = []
        for i, (_, song) in enumerate(similar_songs.iterrows()):
            similarity_score = 1 - distances[0][i+1]  # Convert distance to similarity
            
            result.append({
                'artist': str(song.get('artist', song.get('Artist', 'Unknown'))),
                'song': str(song.get('song', song.get('Song', song.get('Track Name', 'Unknown')))),
                'emotion': str(song.get('emotion', 'Unknown')),
                'genre': str(song.get('Genre', 'Unknown')),
                'similarity_score': round(float(similarity_score), 4),
                'release_date': str(song.get('Release Date', song.get('release_date', 'Unknown'))),
                'popularity': int(song.get('Popularity', song.get('popularity', 0))),
                'tempo': round(float(song.get('Tempo', 0)), 2),
                'energy': round(float(song.get('Energy', 0)), 2),
                'danceability': round(float(song.get('Danceability', 0)), 2)
            })

        logger.info(f"Found {len(result)} similar songs")
        
        return {
            'similar_songs': result,
            'reference_song': {'artist': artist, 'title': song_title},
            'pca_components_used': self.pca.n_components_,
            'similarity_metric': 'cosine'
        }

    def _apply_filters(self, df, filters):
        """Apply various filters to the dataframe"""
        filtered_df = df.copy()
        
        if 'genre' in filters and filters['genre']:
            genres = filters['genre'] if isinstance(filters['genre'], list) else [filters['genre']]
            filtered_df = filtered_df[filtered_df['Genre'].isin(genres)]
            
        if 'tempo_min' in filters and filters['tempo_min']:
            filtered_df = filtered_df[filtered_df['Tempo'] >= float(filters['tempo_min'])]
            
        if 'tempo_max' in filters and filters['tempo_max']:
            filtered_df = filtered_df[filtered_df['Tempo'] <= float(filters['tempo_max'])]
            
        if 'energy_min' in filters and filters['energy_min']:
            filtered_df = filtered_df[filtered_df['Energy'] >= float(filters['energy_min'])]
            
        if 'energy_max' in filters and filters['energy_max']:
            filtered_df = filtered_df[filtered_df['Energy'] <= float(filters['energy_max'])]
            
        if 'danceability_min' in filters and filters['danceability_min']:
            filtered_df = filtered_df[filtered_df['Danceability'] >= float(filters['danceability_min'])]
            
        if 'danceability_max' in filters and filters['danceability_max']:
            filtered_df = filtered_df[filtered_df['Danceability'] <= float(filters['danceability_max'])]
            
        if 'explicit' in filters and filters['explicit']:
            filtered_df = filtered_df[filtered_df['Explicit'].isin(['Yes', True, 1])]
            
        return filtered_df

    def get_available_options(self):
        """Get all available options for filtering"""
        if self.df is None:
            raise ValueError("Model not trained. Please call preprocess_data first.")
            
        return {
            'emotions': sorted(self.df['emotion'].unique().tolist()),
            'genres': sorted(self.df['Genre'].unique().tolist()),
            'keys': sorted(self.df['Key'].unique().tolist()) if 'Key' in self.df.columns else [],
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
            },
            'total_songs': len(self.df),
            'pca_components': self.pca.n_components_ if self.pca else 0,
            'pca_explained_variance': float(np.sum(self.pca.explained_variance_ratio_)) if self.pca else 0
        }

    def save_model(self, filepath='music_recommendation_model.pkl'):
        """Save the trained model to disk"""
        try:
            model_data = {
                'scaler': self.scaler,
                'emotion_encoder': self.emotion_encoder,
                'genre_encoder': self.genre_encoder,
                'key_encoder': self.key_encoder,
                'pca': self.pca,
                'df': self.df,
                'features_scaled': self.features_scaled,
                'feature_columns': self.feature_columns
            }
            
            with open(filepath, 'wb') as f:
                pickle.dump(model_data, f)
                
            logger.info(f"Model saved successfully to {filepath}")
        except Exception as e:
            logger.error(f"Error saving model: {e}")
            raise

    def load_model(self, filepath='music_recommendation_model.pkl'):
        """Load a trained model from disk"""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Model file {filepath} not found")
            
        try:
            with open(filepath, 'rb') as f:
                model_data = pickle.load(f)

            self.scaler = model_data['scaler']
            self.emotion_encoder = model_data['emotion_encoder']
            self.genre_encoder = model_data['genre_encoder']
            self.key_encoder = model_data['key_encoder']
            self.pca = model_data['pca']
            self.df = model_data['df']
            self.features_scaled = model_data['features_scaled']
            
            if 'feature_columns' in model_data:
                self.feature_columns = model_data['feature_columns']

            # Recreate the NearestNeighbors model
            self.nn_model = NearestNeighbors(
                n_neighbors=min(50, len(self.df)), 
                metric='cosine', 
                algorithm='brute'
            )
            self.nn_model.fit(self.features_scaled)
            
            logger.info(f"Model loaded successfully from {filepath}")
            logger.info(f"Loaded {len(self.df)} songs with {self.features_scaled.shape[1]} PCA components")
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise
            
        return self

    def get_model_info(self):
        """Get information about the current model"""
        if self.df is None:
            return {"error": "Model not initialized"}
            
        return {
            "total_songs": len(self.df),
            "emotions": len(self.df['emotion'].unique()),
            "genres": len(self.df['Genre'].unique()),
            "pca_components": self.pca.n_components_,
            "explained_variance": float(np.sum(self.pca.explained_variance_ratio_)),
            "feature_dimensions": self.features_scaled.shape[1],
            "similarity_metric": "cosine"
        }