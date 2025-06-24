from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import pickle
import os
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

print("🚀 Starting Music Recommendation ML API")
print("=" * 40)

# Global variables for models
models = None
scaler = None
features = None
targets = None

def load_models():
    """Load the trained ML models"""
    global models, scaler, features, targets
    
    try:
        # Try to load existing models
        if os.path.exists('music_emotion_models.pkl'):
            with open('music_emotion_models.pkl', 'rb') as f:
                model_package = pickle.load(f)
                models = model_package['models']
                scaler = model_package['scaler']
                features = model_package['features']
                targets = model_package['targets']
            print("✅ Loaded existing trained models")
        else:
            print("⚠️ No trained models found. Creating dummy models...")
            create_dummy_models()
            
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        create_dummy_models()

def create_dummy_models():
    """Create dummy models for demonstration"""
    global models, scaler, features, targets
    
    from sklearn.ensemble import RandomForestRegressor
    
    features = ['danceability', 'energy', 'loudness', 'speechiness', 'acousticness', 
               'instrumentalness', 'liveness', 'valence', 'tempo']
    targets = ['happiness_score', 'sadness_score', 'energy_score', 'calmness_score']
    
    # Create dummy training data
    np.random.seed(42)
    X_dummy = np.random.rand(100, len(features))
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_dummy)
    
    models = {}
    for target in targets:
        # Create simple dummy targets based on features
        if target == 'happiness_score':
            y_dummy = X_dummy[:, 7] * 0.8 + X_dummy[:, 1] * 0.2  # valence + energy
        elif target == 'sadness_score':
            y_dummy = (1 - X_dummy[:, 7]) * 0.8 + (1 - X_dummy[:, 1]) * 0.2
        elif target == 'energy_score':
            y_dummy = X_dummy[:, 1] * 0.9 + X_dummy[:, 0] * 0.1  # energy + danceability
        else:  # calmness_score
            y_dummy = X_dummy[:, 4] * 0.6 + (1 - X_dummy[:, 1]) * 0.4  # acousticness + low energy
        
        model = RandomForestRegressor(n_estimators=50, random_state=42)
        model.fit(X_scaled, y_dummy)
        models[target] = model
    
    print("✅ Created dummy models for demonstration")

# Sample song database with audio features
SONG_DATABASE = [
    {
        'title': 'Blinding Lights', 'artist': 'The Weeknd', 'genre': 'Pop',
        'danceability': 0.514, 'energy': 0.730, 'loudness': -5.934, 'speechiness': 0.0598,
        'acousticness': 0.00146, 'instrumentalness': 0.000, 'liveness': 0.0897, 'valence': 0.334, 'tempo': 171.005
    },
    {
        'title': 'Someone Like You', 'artist': 'Adele', 'genre': 'Ballad',
        'danceability': 0.499, 'energy': 0.166, 'loudness': -8.058, 'speechiness': 0.0265,
        'acousticness': 0.517, 'instrumentalness': 0.000, 'liveness': 0.123, 'valence': 0.234, 'tempo': 67.024
    },
    {
        'title': 'Uptown Funk', 'artist': 'Bruno Mars', 'genre': 'Funk',
        'danceability': 0.896, 'energy': 0.842, 'loudness': -4.632, 'speechiness': 0.0556,
        'acousticness': 0.00777, 'instrumentalness': 0.000, 'liveness': 0.159, 'valence': 0.849, 'tempo': 114.998
    },
    {
        'title': 'The Sound of Silence', 'artist': 'Simon & Garfunkel', 'genre': 'Folk',
        'danceability': 0.395, 'energy': 0.263, 'loudness': -13.047, 'speechiness': 0.0362,
        'acousticness': 0.963, 'instrumentalness': 0.000, 'liveness': 0.0556, 'valence': 0.248, 'tempo': 149.063
    },
    {
        'title': 'Happy', 'artist': 'Pharrell Williams', 'genre': 'Pop',
        'danceability': 0.765, 'energy': 0.822, 'loudness': -5.559, 'speechiness': 0.0431,
        'acousticness': 0.0103, 'instrumentalness': 0.000, 'liveness': 0.159, 'valence': 0.962, 'tempo': 159.990
    },
    {
        'title': 'Mad World', 'artist': 'Gary Jules', 'genre': 'Alternative',
        'danceability': 0.418, 'energy': 0.0751, 'loudness': -18.056, 'speechiness': 0.0265,
        'acousticness': 0.954, 'instrumentalness': 0.000, 'liveness': 0.0985, 'valence': 0.0594, 'tempo': 86.985
    },
    {
        'title': 'Thunderstruck', 'artist': 'AC/DC', 'genre': 'Rock',
        'danceability': 0.375, 'energy': 0.984, 'loudness': -4.770, 'speechiness': 0.0654,
        'acousticness': 0.000856, 'instrumentalness': 0.00851, 'liveness': 0.402, 'valence': 0.729, 'tempo': 133.009
    },
    {
        'title': 'Hallelujah', 'artist': 'Leonard Cohen', 'genre': 'Folk',
        'danceability': 0.264, 'energy': 0.0954, 'loudness': -16.842, 'speechiness': 0.0265,
        'acousticness': 0.963, 'instrumentalness': 0.000, 'liveness': 0.0985, 'valence': 0.181, 'tempo': 59.090
    }
]

def predict_emotion_scores(song_features):
    """Predict emotion scores for a song"""
    if models is None or scaler is None:
        return None
    
    try:
        # Convert to numpy array and scale
        features_array = np.array([song_features])
        features_scaled = scaler.transform(features_array)
        
        # Predict emotion scores
        emotion_scores = {}
        for emotion in targets:
            score = models[emotion].predict(features_scaled)[0]
            emotion_scores[emotion] = max(0, min(1, score))  # Clamp between 0 and 1
        
        return emotion_scores
    except Exception as e:
        print(f"Error predicting emotion scores: {e}")
        return None

def calculate_emotion_similarity(user_emotion, song_emotion_scores):
    """Calculate similarity between user emotion and song emotion scores"""
    # Normalize user emotion (0-100 to 0-1)
    user_normalized = {
        'happiness': user_emotion['happiness'] / 100,
        'sadness': user_emotion['sadness'] / 100,
        'energy': user_emotion['energy'] / 100,
        'calmness': user_emotion['calmness'] / 100
    }
    
    # Calculate weighted similarity
    similarity = 0
    weights = {'happiness': 0.3, 'sadness': 0.3, 'energy': 0.25, 'calmness': 0.15}
    
    for emotion, weight in weights.items():
        song_score = song_emotion_scores.get(f'{emotion}_score', 0)
        user_score = user_normalized[emotion]
        similarity += weight * (1 - abs(song_score - user_score))
    
    return similarity

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'running',
        'message': 'Music Recommendation ML API',
        'models_loaded': models is not None
    })

@app.route('/recommend', methods=['POST'])
def recommend_songs():
    """Main recommendation endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'emotion' not in data:
            return jsonify({'error': 'Emotion data is required'}), 400
        
        user_emotion = data['emotion']
        
        # Validate emotion data
        required_emotions = ['happiness', 'sadness', 'energy', 'calmness']
        for emotion in required_emotions:
            if emotion not in user_emotion:
                return jsonify({'error': f'Missing emotion: {emotion}'}), 400
        
        print(f"Received emotion request: {user_emotion}")
        
        # Calculate recommendations
        recommendations = []
        
        for song in SONG_DATABASE:
            # Extract audio features
            song_features = [
                song['danceability'], song['energy'], song['loudness'],
                song['speechiness'], song['acousticness'], song['instrumentalness'],
                song['liveness'], song['valence'], song['tempo']
            ]
            
            # Predict emotion scores for the song
            emotion_scores = predict_emotion_scores(song_features)
            
            if emotion_scores:
                # Calculate similarity to user emotion
                similarity = calculate_emotion_similarity(user_emotion, emotion_scores)
                
                recommendations.append({
                    'title': song['title'],
                    'artist': song['artist'],
                    'genre': song['genre'],
                    'similarity_score': similarity,
                    'emotion_scores': emotion_scores,
                    'audio_features': {
                        'energy': song['energy'],
                        'valence': song['valence'],
                        'danceability': song['danceability']
                    }
                })
        
        # Sort by similarity and return top recommendations
        recommendations.sort(key=lambda x: x['similarity_score'], reverse=True)
        top_recommendations = recommendations[:6]
        
        # Analyze user emotion
        dominant_emotion = max(user_emotion.items(), key=lambda x: x[1])
        
        response = {
            'recommendations': top_recommendations,
            'user_emotion_analysis': {
                'dominant_emotion': dominant_emotion[0],
                'emotion_vector': user_emotion,
                'mood_category': classify_mood(user_emotion)
            },
            'total_songs_analyzed': len(SONG_DATABASE)
        }
        
        print(f"Returning {len(top_recommendations)} recommendations")
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in recommend_songs: {e}")
        return jsonify({'error': 'Internal server error'}), 500

def classify_mood(emotion):
    """Classify overall mood based on emotion scores"""
    if emotion['happiness'] > 70 and emotion['energy'] > 60:
        return 'upbeat'
    elif emotion['sadness'] > 60:
        return 'melancholic'
    elif emotion['energy'] > 80:
        return 'energetic'
    elif emotion['calmness'] > 70:
        return 'peaceful'
    else:
        return 'balanced'

@app.route('/analyze', methods=['POST'])
def analyze_song():
    """Analyze a song's emotional characteristics"""
    try:
        data = request.get_json()
        
        if not data or 'audio_features' not in data:
            return jsonify({'error': 'Audio features are required'}), 400
        
        audio_features = data['audio_features']
        
        # Predict emotion scores
        emotion_scores = predict_emotion_scores(audio_features)
        
        if emotion_scores is None:
            return jsonify({'error': 'Failed to analyze song'}), 500
        
        return jsonify({
            'emotion_scores': emotion_scores,
            'dominant_emotion': max(emotion_scores.items(), key=lambda x: x[1])[0],
            'audio_features': audio_features
        })
        
    except Exception as e:
        print(f"Error in analyze_song: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Load models on startup
load_models()

if __name__ == '__main__':
    print("\n🎵 Music Recommendation ML API Server")
    print("Available endpoints:")
    print("  GET  /          - Health check")
    print("  POST /recommend - Get song recommendations")
    print("  POST /analyze   - Analyze song emotions")
    print("\n🚀 Starting server on https://tunist-song-service.onrender.com")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
