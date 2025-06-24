import React, { useState, useEffect } from 'react';

const MusicRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [emotion, setEmotion] = useState('');
  const [availableEmotions, setAvailableEmotions] = useState([]);
  const [filters, setFilters] = useState({
    genre: '',
    tempo_min: '',
    energy_min: '',
    explicit: false
  });

  useEffect(() => {
    // Fetch available emotions and genres on mount
    fetch('http://localhost:5005/api/emotions')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.emotions)) {
          setAvailableEmotions(data.emotions);
          setEmotion(data.emotions[0] || ''); // default select first
        } else {
          console.warn('No emotions received from backend');
        }
      })
      .catch((err) => console.error('Error loading options:', err));
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const getRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5005/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emotion,
          num_recommendations: 9,
          filters: {
            genre: filters.genre ? [filters.genre] : [],
            tempo_min: filters.tempo_min ? parseFloat(filters.tempo_min) : undefined,
            energy_min: filters.energy_min ? parseFloat(filters.energy_min) : undefined,
            explicit: filters.explicit
          }
        })
      });

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">🎵 Music Recommendations</h2>

      <div className="mb-8 space-y-4">
        <div className="space-y-2">
          <label className="block font-semibold">Emotion</label>
          <select
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            className="w-full p-2 rounded border border-gray-300"
          >
            {availableEmotions.length > 0 ? (
              availableEmotions.map((em, idx) => (
                <option key={idx} value={em}>
                  {em.charAt(0).toUpperCase() + em.slice(1)}
                </option>
              ))
            ) : (
              <option>Loading...</option>
            )}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block font-semibold">Genre (optional)</label>
          <input
            type="text"
            placeholder="e.g., pop"
            value={filters.genre}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
            className="w-full p-2 rounded border border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-semibold">Minimum Tempo</label>
          <input
            type="number"
            value={filters.tempo_min}
            onChange={(e) => handleFilterChange('tempo_min', e.target.value)}
            className="w-full p-2 rounded border border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-semibold">Minimum Energy</label>
          <input
            type="number"
            value={filters.energy_min}
            onChange={(e) => handleFilterChange('energy_min', e.target.value)}
            className="w-full p-2 rounded border border-gray-300"
          />
        </div>

        {/* <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.explicit}
            onChange={(e) => handleFilterChange('explicit', e.target.checked)}
            className="form-checkbox"
          />
          <label>Explicit Content</label>
        </div> */}

        <button
          onClick={getRecommendations}
          disabled={loading || !emotion}
          className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
        </button>
      </div>

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Recommended Songs</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((song, index) => (
              <div
                key={index}
                className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-all duration-300"
              >
                <h4 className="font-semibold">{song.song}</h4>
                <p className="text-gray-400">{song.artist}</p>
                <p className="text-sm text-gray-500">{song.genre}</p>
                <div className="mt-2 text-xs text-gray-400">
                  Popularity: {song.popularity}
                  <br />
                  Energy: {song.energy}
                  <br />
                  Danceability: {song.danceability}
                  <br />
                  Tempo: {song.tempo}
                  <br />
                  Explicit: {song.explicit}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicRecommendations;
