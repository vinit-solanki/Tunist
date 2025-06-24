import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const Albums = () => {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const res = await axios.get('https://tunist-song-service.onrender.com/api/v1/album/all');
        setAlbums(res.data);
      } catch (err) {
        console.error("Failed to fetch albums:", err);
      }
    };

    fetchAlbums();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">All Albums</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 cursor-pointer">
        {albums.map((album, index) => (
          <div onClick={()=>navigate(`/album/${album.id}`)} key={index} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <img src={album.thumbnail} alt={album.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white">{album.title}</h3>
              <p className="text-gray-400 text-sm">{album.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Albums;
