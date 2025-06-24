import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const AlbumDetail = () => {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const fetchAlbumDetail = async () => {
      try {
        const numericId = parseInt(id);
        console.log(numericId);
        const res = await axios.get(`https://tunist-song-service.onrender.com/api/v1/album/${numericId}`);
        setAlbum(res.data.album);
        setSongs(res.data.songs);
      } catch (err) {
        console.error("Error fetching album detail:", err);
      }
    };
  
    fetchAlbumDetail();
  }, [id]);
  

  if (!album) return <div className="text-white p-6">Loading album details...</div>;

  return (
    <div className="p-6 text-white">
      {/* Album Info */}
      <div className="flex flex-col lg:flex-row items-center mb-10 gap-8">
        <img src={album.thumbnail} alt={album.title} className="w-32 h-32 object-cover rounded-lg shadow-lg" />
        <div>
          <h2 className="text-4xl font-bold mb-2">{album.title}</h2>
          <p className="text-gray-300">{album.description}</p>
          <p className="text-sm text-gray-500 mt-2">Created on: {new Date(album.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Songs List */}
      <h3 className="text-2xl font-bold mb-6">Songs in this Album</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {songs.map((song, index) => (
          <div key={index} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <img src={song.thumbnail} alt={song.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h4 className="text-lg font-semibold text-white">{song.title}</h4>
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

export default AlbumDetail;
