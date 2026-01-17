import React, { useState, useEffect } from 'react';
import { RECOMMENDATION_SERVICE_URL } from '../config/api.config';

// Use production or development API based on environment
const API_URL = RECOMMENDATION_SERVICE_URL;

const MusicRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [similarSongs, setSimilarSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emotion, setEmotion] = useState('');
  const [modelInfo, setModelInfo] = useState(null);
  const [availableOptions, setAvailableOptions] = useState({
    emotions: [],
    genres: [],
    keys: [],
    tempo_range: { min: 0, max: 300 },
    energy_range: { min: 0, max: 100 },
    danceability_range: { min: 0, max: 100 },
    total_songs: 0,
    pca_components: 0,
    total_clusters: 0,
    pca_variance_explained: 0,
    model_version: ''
  });
  const [selectedSong, setSelectedSong] = useState(null);
  const [filters, setFilters] = useState({
    genre: '',
    tempo_min: '',
    tempo_max: '',
    energy_min: '',
    energy_max: '',
    danceability_min: '',
    danceability_max: '',
    explicit: false
  });

  // Load available options on mount
  useEffect(() => {
    loadOptions();
    loadModelInfo();
  }, []);

  const loadOptions = async () => {
    try {
      setError('');
      
      // Check API health
      const healthResponse = await fetch(`${API_URL}/health`);
      const healthData = await healthResponse.json();
      
      if (!healthData.model_loaded) {
        setError('Model not loaded on server. Please wait for initialization.');
        return;
      }
      
      // Get debug info
      const debugResponse = await fetch(`${API_URL}/api/debug`);
      const debugData = await debugResponse.json();
      console.log('Debug info:', debugData);
      
      if (!debugData.model_has_data) {
        setError('Model has no data loaded. Please check the dataset.');
        return;
      }
      
      if (debugData.sample_emotions && debugData.sample_emotions.length === 0) {
        setError('No emotions found in dataset.');
        return;
      }
      
      // Get options
      const optionsResponse = await fetch(`${API_URL}/api/options`);
      const optionsData = await optionsResponse.json();
      
      if (optionsData.error) {
        setError(`API Error: ${optionsData.error}`);
        return;
      }
      
      if (optionsData && optionsData.emotions && optionsData.emotions.length > 0) {
        setAvailableOptions(optionsData);
        setEmotion(optionsData.emotions[0] || '');
        console.log('Loaded enhanced options:', {
          emotions: optionsData.emotions.length,
          genres: optionsData.genres.length,
          totalSongs: optionsData.total_songs,
          clusters: optionsData.total_clusters,
          version: optionsData.model_version
        });
      } else {
        setError('No emotions available in the dataset.');
      }
    } catch (err) {
      console.error('Error loading options:', err);
      setError(`Failed to load options: ${err.message}. Please check if the server is running at ${API_URL}`);
    }
  };

  const loadModelInfo = async () => {
    try {
      const response = await fetch(`${API_URL}/api/model-info`);
      const data = await response.json();
      if (!data.error) {
        setModelInfo(data);
      }
    } catch (err) {
      console.error('Error loading model info:', err);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Fetch emotion-based recommendations
  const getRecommendations = async () => {
    if (!emotion) {
      setError('Please select an emotion');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSimilarSongs([]);
      setSelectedSong(null);

      const response = await fetch(`${API_URL}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emotion,
          num_recommendations: 20,  // Increased from 9 to 20
          filters: {
            genre: filters.genre ? [filters.genre] : [],
            tempo_min: filters.tempo_min ? parseFloat(filters.tempo_min) : undefined,
            tempo_max: filters.tempo_max ? parseFloat(filters.tempo_max) : undefined,
            energy_min: filters.energy_min ? parseFloat(filters.energy_min) / 100 : undefined,
            energy_max: filters.energy_max ? parseFloat(filters.energy_max) / 100 : undefined,
            danceability_min: filters.danceability_min ? parseFloat(filters.danceability_min) / 100 : undefined,
            danceability_max: filters.danceability_max ? parseFloat(filters.danceability_max) / 100 : undefined,
            explicit: filters.explicit
          }
        })
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setRecommendations([]);
      } else {
        setRecommendations(data.recommendations || []);
        console.log('Improved recommendations received:', {
          count: data.recommendations?.length,
          algorithm: data.algorithm,
          variance: data.pca_variance_explained
        });
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to get recommendations. Please try again.');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch similar songs
  const getSimilarSongs = async (artist, song) => {
    try {
      setLoading(true);
      setError('');
      setSelectedSong({ artist, song });

      const response = await fetch(`${API_URL}/api/similar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist,
          song,
          num_recommendations: 6
        })
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setSimilarSongs([]);
      } else {
        setSimilarSongs(data.similar_songs || []);
        console.log('Similar songs received:', {
          count: data.similar_songs?.length,
          algorithm: data.algorithm,
          reference: data.reference_song
        });
      }
    } catch (error) {
      console.error('Error fetching similar songs:', error);
      setError('Failed to get similar songs. Please try again.');
      setSimilarSongs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">🎵 Enhanced Music Recommendations</h2>
        <p className="text-gray-600 text-sm">
          Powered by Hybrid PCA + Cosine Similarity + Diversity Optimization
        </p>
        {modelInfo && (
          <div className="mt-2 text-xs text-gray-500 flex items-center justify-center gap-4">
            <span>📊 {modelInfo.total_songs} songs</span>
            <span>•</span>
            <span>🧠 {modelInfo.pca_components} PCA components</span>
            <span>•</span>
            <span>📈 {(modelInfo.explained_variance * 100).toFixed(1)}% variance</span>
            {modelInfo.total_clusters > 0 && (
              <>
                <span>•</span>
                <span>🎪 {modelInfo.total_clusters} clusters</span>
              </>
            )}
            {modelInfo.model_version && (
              <>
                <span>•</span>
                <span>v{modelInfo.model_version}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg text-blue-700">
          <strong>Loading...</strong> Please wait while we process your request.
        </div>
      )}

      {/* No emotions available warning */}
      {!loading && availableOptions.emotions.length === 0 && !error && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-700">
          <strong>No emotions available.</strong> The server may still be initializing. Please refresh the page in a few moments.
        </div>
      )}

      {/* Emotion & Filters */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Emotion */}
        <div>
          <label className="block font-semibold mb-1">Emotion</label>
          <select
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            className="w-full p-2 rounded border border-gray-300"
          >
            {availableOptions.emotions.map((em, idx) => (
              <option key={idx} value={em}>
                {em.charAt(0).toUpperCase() + em.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Tempo */}
        <div>
          <label className="block font-semibold mb-1">Tempo Range</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder={`Min (${availableOptions.tempo_range.min})`}
              value={filters.tempo_min}
              onChange={(e) => handleFilterChange('tempo_min', e.target.value)}
              className="w-1/2 p-2 rounded border border-gray-300"
            />
            <input
              type="number"
              placeholder={`Max (${availableOptions.tempo_range.max})`}
              value={filters.tempo_max}
              onChange={(e) => handleFilterChange('tempo_max', e.target.value)}
              className="w-1/2 p-2 rounded border border-gray-300"
            />
          </div>
        </div>

        {/* Energy */}
        <div>
          <label className="block font-semibold mb-1">Energy Range (0-100)</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.energy_min}
              onChange={(e) => handleFilterChange('energy_min', e.target.value)}
              className="w-1/2 p-2 rounded border border-gray-300"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.energy_max}
              onChange={(e) => handleFilterChange('energy_max', e.target.value)}
              className="w-1/2 p-2 rounded border border-gray-300"
            />
          </div>
        </div>

        {/* Danceability */}
        <div>
          <label className="block font-semibold mb-1">Danceability Range (0-100)</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.danceability_min}
              onChange={(e) => handleFilterChange('danceability_min', e.target.value)}
              className="w-1/2 p-2 rounded border border-gray-300"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.danceability_max}
              onChange={(e) => handleFilterChange('danceability_max', e.target.value)}
              className="w-1/2 p-2 rounded border border-gray-300"
            />
          </div>
        </div>

        {/* Explicit */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.explicit}
            onChange={(e) => handleFilterChange('explicit', e.target.checked)}
          />
          <label className="font-semibold">Explicit Only</label>
        </div>
      </div>

      <button
        onClick={getRecommendations}
        disabled={loading || !emotion}
        className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 disabled:opacity-50"
      >
        {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
      </button>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Recommended Songs</h3>
            {recommendations.length > 0 && recommendations[0]?.ranking_score && (
              <div className="text-xs text-gray-500 flex gap-3">
                <span title="Algorithm used">🤖 Hybrid Multi-Metric</span>
                {modelInfo?.diversity_weight !== undefined && (
                  <span title="Diversity optimization">🌈 Diversity: {(modelInfo.diversity_weight * 100).toFixed(0)}%</span>
                )}
              </div>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((song, index) => (
              <div
                key={index}
                onClick={() => getSimilarSongs(song.artist, song.song)}
                className="cursor-pointer bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-all duration-300"
              >
                <h4 className="font-semibold text-white">{song.song}</h4>
                <p className="text-gray-400">{song.artist}</p>
                <p className="text-sm text-gray-500">{song.genre}</p>
                <div className="mt-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-green-600 px-2 py-0.5 rounded">⭐ {song.popularity}</span>
                    {song.ranking_score && (
                      <span className="bg-blue-600 px-2 py-0.5 rounded" title="Final ranking score">
                        🎯 {song.ranking_score.toFixed(3)}
                      </span>
                    )}
                  </div>
                  Similarity: {song.similarity_score}
                  {song.ranking_score && song.similarity_score !== song.ranking_score && (
                    <> (base) → {song.ranking_score.toFixed(3)} (ranked)</>
                  )}
                  <br />
                  Release: {song.release_date}
                  {song.tempo && (
                    <>
                      <br />
                      Tempo: {song.tempo} | Energy: {(song.energy * 100).toFixed(0)}% | Dance: {(song.danceability * 100).toFixed(0)}%
                    </>
                  )}
                  {song.positiveness !== undefined && (
                    <>
                      <br />
                      Mood: {(song.positiveness * 100).toFixed(0)}%
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Similar Songs */}
      {similarSongs.length > 0 && selectedSong && (
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">
            🎶 Songs Similar to <span className="text-green-400">{selectedSong.song}</span>
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {similarSongs.map((song, index) => (
              <div
                key={index}
                className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-all duration-300"
              >
                <h4 className="font-semibold text-white">{song.song}</h4>
                <p className="text-gray-400">{song.artist}</p>
                <p className="text-sm text-gray-500">{song.genre}</p>
                <div className="mt-2 text-xs text-gray-400">
                  Similarity: {song.similarity_score}
                  <br />
                  Popularity: {song.popularity}
                  {song.tempo && (
                    <>
                      <br />
                      Tempo: {song.tempo} | Energy: {(song.energy * 100).toFixed(0)}% | Dance: {(song.danceability * 100).toFixed(0)}%
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && recommendations.length === 0 && similarSongs.length === 0 && !error && (
        <div className="mt-8 text-center text-gray-500">
          <p>Select an emotion and click "Get Recommendations" to start!</p>
        </div>
      )}
    </div>
  );
};

export default MusicRecommendations;