import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Songs = () => {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await axios.get('https://tunist-song-service.onrender.com/api/v1/song/all');
        setSongs(res.data);
      } catch (err) {
        console.error("Failed to fetch songs:", err);
      }
    };

    fetchSongs();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">All Songs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {songs.map((song, index) => (
          <div key={index} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <img src={song.thumbnail} alt={song.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white">{song.title}</h3>
              <p className="text-gray-400 text-sm">{song.description}</p>
              <audio controls className="mt-2 w-full">
                <source src={song.audio} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Songs;
