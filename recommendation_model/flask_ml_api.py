# flask_ml_api.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
import traceback
from model import MusicRecommendationModel

app = Flask(__name__)
CORS(app)
model = None


def initialize_model():
    global model
    try:
        model = MusicRecommendationModel()

        if os.path.exists('music_recommendation_model.pkl'):
            model.load_model('music_recommendation_model.pkl')
            print("Loaded existing model")
        elif os.path.exists('light_spotify_dataset.csv'):
            df = pd.read_csv('light_spotify_dataset.csv')
            model.preprocess_data(df)
            model.save_model()
            print("Trained new model and saved")
        else:
            print("Warning: No dataset found. Please provide light_spotify_dataset.csv")
            return False
        return True
    except Exception as e:
        print(f"Error initializing model: {e}")
        traceback.print_exc()
        return False


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'model_loaded': model is not None})


@app.route('/api/emotions', methods=['GET'])
def get_emotions():
    try:
        if model is None:
            return jsonify({'error': 'Model not initialized'}), 500
        return jsonify(model.get_available_options())
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/recommend', methods=['POST'])
def recommend_songs():
    try:
        if model is None:
            return jsonify({'error': 'Model not initialized'}), 500

        data = request.get_json()
        emotion = data.get('emotion')
        if not emotion:
            return jsonify({'error': 'emotion is required'}), 400

        num_recommendations = data.get('num_recommendations', 10)
        filters = data.get('filters', {})

        if not isinstance(num_recommendations, int) or not (1 <= num_recommendations <= 50):
            return jsonify({'error': 'num_recommendations must be between 1 and 50'}), 400

        return jsonify(model.get_emotion_based_recommendations(emotion, num_recommendations, filters))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/similar', methods=['POST'])
def get_similar_songs():
    try:
        if model is None:
            return jsonify({'error': 'Model not initialized'}), 500

        data = request.get_json()
        artist = data.get('artist')
        song = data.get('song')
        if not artist or not song:
            return jsonify({'error': 'artist and song are required'}), 400

        num_recommendations = data.get('num_recommendations', 10)
        if not isinstance(num_recommendations, int) or not (1 <= num_recommendations <= 50):
            return jsonify({'error': 'num_recommendations must be between 1 and 50'}), 400

        return jsonify(model.get_similar_songs(artist, song, num_recommendations))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/search', methods=['GET'])
def search_songs():
    try:
        if model is None:
            return jsonify({'error': 'Model not initialized'}), 500

        query = request.args.get('q', '').strip().lower()
        if not query:
            return jsonify({'error': 'Search query is required'}), 400

        df = model.df
        results_df = df[(df['artist'].str.lower().str.contains(query)) | (df['song'].str.lower().str.contains(query))].head(20)

        results = [
            {
                'artist': row['artist'],
                'song': row['song'],
                'emotion': row['emotion'],
                'genre': row['Genre'],
                'release_date': row['Release Date'],
                'popularity': row['Popularity']
            }
            for _, row in results_df.iterrows()
        ]

        return jsonify({'results': results, 'total_found': len(results), 'query': query})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/stats', methods=['GET'])
def get_dataset_stats():
    try:
        if model is None:
            return jsonify({'error': 'Model not initialized'}), 500

        df = model.df
        stats = {
            'total_songs': len(df),
            'total_artists': df['artist'].nunique(),
            'emotion_distribution': df['emotion'].value_counts().to_dict(),
            'genre_distribution': df['Genre'].value_counts().head(10).to_dict(),
            'year_range': {
                'earliest': int(df['Release Date'].min()),
                'latest': int(df['Release Date'].max())
            },
            'popularity_stats': {
                'mean': float(df['Popularity'].mean()),
                'median': float(df['Popularity'].median()),
                'max': int(df['Popularity'].max()),
                'min': int(df['Popularity'].min())
            }
        }
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'error': 'Method not allowed'}), 405


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    print("Initializing music recommendation API...")
    if initialize_model():
        print("Model initialized successfully!")
        print("Starting Flask server on port 5005...")
        app.run(debug=True, host='0.0.0.0', port=5005)
    else:
        print("Failed to initialize model. Please check your dataset and try again.")
