import React, { useState } from 'react';

const MusicRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [emotion, setEmotion] = useState({
    happiness: 50,
    sadness: 50,
    energy: 50,
    calmness: 50
  });

  const handleSliderChange = (emotionType, value) => {
    setEmotion(prev => ({
      ...prev,
      [emotionType]: value
    }));
  };

  const getRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emotion })
      });

      const data = await response.json();
      setRecommendations(data.recommendations);
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
          <label className="block">Happiness: {emotion.happiness}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={emotion.happiness}
            onChange={(e) => handleSliderChange('happiness', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block">Sadness: {emotion.sadness}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={emotion.sadness}
            onChange={(e) => handleSliderChange('sadness', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block">Energy: {emotion.energy}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={emotion.energy}
            onChange={(e) => handleSliderChange('energy', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block">Calmness: {emotion.calmness}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={emotion.calmness}
            onChange={(e) => handleSliderChange('calmness', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <button
          onClick={getRecommendations}
          disabled={loading}
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
              <div key={index} className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-all smooth duration-300">
                <h4 className="font-semibold">{song.title}</h4>
                <p className="text-gray-400">{song.artist}</p>
                <p className="text-sm text-gray-500">{song.genre}</p>
                <div className="mt-2">
                  <p className="text-sm">Match Score: {(song.similarity_score * 100).toFixed(1)}%</p>
                  <div className="text-xs text-gray-400 mt-1">
                    Energy: {(song.audio_features.energy * 100).toFixed(0)}%
                    <br />
                    Mood: {(song.audio_features.valence * 100).toFixed(0)}%
                    <br />
                    Dance: {(song.audio_features.danceability * 100).toFixed(0)}%
                  </div>
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