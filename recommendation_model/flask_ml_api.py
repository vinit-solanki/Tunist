# flask_ml_api.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
import traceback
import logging
from model import MusicRecommendationModel

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["*"])  # Allow all origins for development

# Global model instance
model = None

def initialize_model():
    """Initialize the recommendation model"""
    global model
    try:
        logger.info("Initializing Music Recommendation Model...")
        model = MusicRecommendationModel(n_components=10)
        
        # Try to load existing model
        if os.path.exists('music_recommendation_model.pkl'):
            logger.info("Loading existing model from pickle file...")
            model.load_model('music_recommendation_model.pkl')
            logger.info("Model loaded successfully!")
            
            # Verify model has data
            if model.df is not None and len(model.df) > 0:
                logger.info(f"Model contains {len(model.df)} songs")
                if 'emotion' in model.df.columns:
                    emotions = model.df['emotion'].unique().tolist()
                    logger.info(f"Available emotions: {emotions}")
                else:
                    logger.warning("'emotion' column not found in loaded model data")
                return True
            else:
                logger.warning("Loaded model has no data, will retrain...")
                
        # Train new model if dataset exists or if loaded model has no data
        if os.path.exists('light_spotify_dataset.csv'):
            logger.info("Training new model from dataset...")
            df = pd.read_csv('light_spotify_dataset.csv')
            logger.info(f"Loaded dataset with {len(df)} songs")
            
            # Check if emotion column exists
            if 'emotion' not in df.columns:
                logger.error("Dataset missing 'emotion' column!")
                logger.info(f"Available columns: {list(df.columns)}")
                return False
            
            # Log available emotions before preprocessing
            emotions = df['emotion'].unique().tolist()
            logger.info(f"Emotions in dataset: {emotions}")
            
            # Preprocess and train
            model.preprocess_data(df)
            model.save_model('music_recommendation_model.pkl')
            logger.info("New model trained and saved!")
            return True
            
        else:
            logger.error("⚠️ No dataset or model file found.")
            logger.error("Expected files: 'light_spotify_dataset.csv' or 'music_recommendation_model.pkl'")
            return False
            
    except Exception as e:
        logger.error(f"Error initializing model: {e}")
        traceback.print_exc()
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    model_status = model is not None
    model_info = {}
    
    if model_status:
        try:
            model_info = model.get_model_info()
        except:
            model_info = {"error": "Model info unavailable"}
    
    return jsonify({
        'status': 'healthy',
        'model_loaded': model_status,
        'model_info': model_info
    })

@app.route('/api/options', methods=['GET'])
def get_options():
    """Get available filtering options"""
    try:
        if model is None:
            return jsonify({'error': 'Model not initialized'}), 500
        
        if model.df is None:
            return jsonify({'error': 'Model not trained with data'}), 500
            
        options = model.get_available_options()
        logger.info(f"Retrieved available options: {len(options.get('emotions', []))} emotions, {len(options.get('genres', []))} genres")
        
        # Debug log to check what emotions are available
        if options.get('emotions'):
            logger.info(f"Available emotions: {options['emotions']}")
        else:
            logger.warning("No emotions found in dataset!")
            
        return jsonify(options)
        
    except Exception as e:
        logger.error(f"Error getting options: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommend', methods=['POST'])
def recommend_songs():
    """Get emotion-based song recommendations"""
    try:
        if model is None:
            return jsonify({'error': 'Model not initialized'}), 500
            
        # Parse request data
        data = request.get_json() or {}
        emotion = data.get('emotion')
        num_recommendations = data.get('num_recommendations', 10)
        filters = data.get('filters', {})
        
        # Validate input
        if not emotion:
            return jsonify({'error': 'emotion parameter is required'}), 400
            
        if num_recommendations > 50:
            num_recommendations = 50  # Limit for performance
            
        logger.info(f"Getting recommendations for emotion: {emotion}, count: {num_recommendations}")
        
        # Get recommendations
        result = model.get_emotion_based_recommendations(
            emotion, 
            num_recommendations, 
            filters
        )
        
        if 'error' in result:
            return jsonify(result), 400
            
        logger.info(f"Successfully generated {len(result.get('recommendations', []))} recommendations")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in recommend_songs: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/similar', methods=['POST'])
def get_similar_songs():
    """Get songs similar to a specific track"""
    try:
        if model is None:
            return jsonify({'error': 'Model not initialized'}), 500
            
        # Parse request data
        data = request.get_json() or {}
        artist = data.get('artist', '').strip()
        song = data.get('song', '').strip()
        num_recommendations = data.get('num_recommendations', 10)
        
        # Validate input
        if not artist or not song:
            return jsonify({'error': 'Both artist and song parameters are required'}), 400
            
        if num_recommendations > 50:
            num_recommendations = 50  # Limit for performance
            
        logger.info(f"Finding songs similar to '{song}' by '{artist}'")
        
        # Get similar songs
        result = model.get_similar_songs(artist, song, num_recommendations)
        
        if 'error' in result:
            return jsonify(result), 404
            
        logger.info(f"Successfully found {len(result.get('similar_songs', []))} similar songs")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in get_similar_songs: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/debug', methods=['GET'])
def debug_info():
    """Debug endpoint to check model and data status"""
    try:
        debug_data = {
            'model_initialized': model is not None,
            'model_has_data': False,
            'dataset_shape': None,
            'available_columns': [],
            'sample_emotions': [],
            'sample_genres': [],
            'data_types': {}
        }
        
        if model is not None:
            debug_data['model_has_data'] = model.df is not None
            
            if model.df is not None:
                debug_data['dataset_shape'] = list(model.df.shape)
                debug_data['available_columns'] = list(model.df.columns)
                debug_data['data_types'] = {col: str(dtype) for col, dtype in model.df.dtypes.items()}
                
                if 'emotion' in model.df.columns:
                    debug_data['sample_emotions'] = model.df['emotion'].unique().tolist()[:10]
                    debug_data['total_emotions'] = len(model.df['emotion'].unique())
                    
                if 'Genre' in model.df.columns:
                    debug_data['sample_genres'] = model.df['Genre'].unique().tolist()[:10]
                    debug_data['total_genres'] = len(model.df['Genre'].unique())
        
        return jsonify(debug_data)
        
    except Exception as e:
        return jsonify({'error': f'Debug error: {str(e)}'})

@app.route('/api/model-info', methods=['GET'])
def get_model_info():
    """Get detailed information about the current model"""
    try:
        if model is None:
            return jsonify({'error': 'Model not initialized'}), 500
            
        info = model.get_model_info()
        return jsonify(info)
        
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/search', methods=['POST'])
def search_songs():
    """Search for songs in the dataset"""
    try:
        if model is None:
            return jsonify({'error': 'Model not initialized'}), 500
            
        data = request.get_json() or {}
        query = data.get('query', '').strip().lower()
        limit = min(data.get('limit', 20), 100)  # Max 100 results
        
        if not query:
            return jsonify({'error': 'query parameter is required'}), 400
            
        # Search in dataset
        df = model.df
        artist_col = 'artist' if 'artist' in df.columns else 'Artist'
        song_col = 'song' if 'song' in df.columns else 'Song'
        if song_col not in df.columns:
            song_col = 'Track Name'
            
        # Search in artist and song names
        mask = (
            df[artist_col].str.lower().str.contains(query, na=False) |
            df[song_col].str.lower().str.contains(query, na=False)
        )
        
        results = df[mask].head(limit)
        
        search_results = []
        for _, row in results.iterrows():
            search_results.append({
                'artist': str(row.get(artist_col, 'Unknown')),
                'song': str(row.get(song_col, 'Unknown')),
                'emotion': str(row.get('emotion', 'Unknown')),
                'genre': str(row.get('Genre', 'Unknown')),
                'popularity': int(row.get('Popularity', 0)),
                'tempo': round(float(row.get('Tempo', 0)), 2),
                'energy': round(float(row.get('Energy', 0)), 2),
                'danceability': round(float(row.get('Danceability', 0)), 2)
            })
        
        return jsonify({
            'results': search_results,
            'total_found': len(results),
            'query': query
        })
        
    except Exception as e:
        logger.error(f"Error in search_songs: {e}")
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
    logger.info("Starting Music Recommendation API Server...")
    
    if initialize_model():
        logger.info("🎵 Model initialized successfully!")
        logger.info("🚀 Starting Flask server on http://0.0.0.0:5005")
        
        # Run with different configurations based on environment
        debug_mode = os.getenv('FLASK_ENV') == 'development'
        app.run(
            debug=debug_mode, 
            host='0.0.0.0', 
            port=int(os.getenv('PORT', 5005)),
            threaded=True
        )
    else:
        logger.error("❌ Failed to initialize model. Server not starting.")
        print("\nTroubleshooting:")
        print("1. Ensure 'light_spotify_dataset.csv' exists in the current directory")
        print("2. Or ensure 'music_recommendation_model.pkl' exists")
        print("3. Check that the CSV file has the required columns")
        print("4. Check file permissions")
        exit(1)