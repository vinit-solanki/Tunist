import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const Dashboard = () => {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const albumRes = await axios.get('https://tunist-song-service.onrender.com/api/v1/album/all');
        const songRes = await axios.get('https://tunist-song-service.onrender.com/api/v1/song/all');

        // Limit to top 4
        setAlbums(albumRes.data.slice(0, 4));
        setSongs(songRes.data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchContent();
  }, []);

  return (
    <div className="p-6">
      {/* Discover Section */}
      <section className="mb-10">
        <div className="rounded-xl overflow-hidden bg-gradient-to-r from-purple-600 to-blue-500 text-white p-10 text-center">
          <h1 className="text-4xl font-bold mb-4">This Project is Deployed on Free Tier Hence a 50s deplay is expected!</h1>
          <h1 className="text-4xl font-bold mb-4">Discover Your Sound</h1>
          <p className="text-lg mb-6">Millions of songs, curated playlists, and exclusive content</p>
          <button className="px-6 py-2 bg-white text-black rounded-full font-semibold hover:opacity-90 transition">Start Listening</button>
        </div>
      </section>

      {/* Featured Albums Section */}
      <section className="mb-10">
        <div className='w-full px-4 flex justify-between items-center'>
          <h2 className="text-2xl font-bold text-white mb-6">Featured Albums</h2>
          <button className='text-white'>See All</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </section>

      {/* Featured Songs Section */}
      <section className="mb-10">
        <div className='w-full px-4 flex justify-between items-center'>
          <h2 className="text-2xl font-bold text-white mb-6">Featured Songs</h2>
          <button className='text-white'>See All</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {songs.map((song, index) => (
            <div key={index} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <img src={song.thumbnail} alt={song.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white">{song.title}</h3>
                <p className="text-gray-400 text-sm">{song.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
