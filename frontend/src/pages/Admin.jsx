import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadForm from './UploadForm';
import { adminAPI } from '../utils/api';

function Admin() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upload');
  const [token, setToken] = useState(null);
  const [stats, setStats] = useState({
    totalAlbums: 0,
    totalSongs: 0,
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      navigate('/login');
      return;
    }
    setToken(storedToken);
    fetchAdminData();
  }, [navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // Fetch albums
      const albumsRes = await adminAPI.getAllAlbums();
      const albumsData = albumsRes.data.albums || albumsRes.data || [];
      setAlbums(albumsData);

      // Fetch songs
      const songsRes = await adminAPI.getAllSongs();
      const songsData = songsRes.data.songs || songsRes.data || [];
      setSongs(songsData);

      setStats({
        totalAlbums: albumsData.length,
        totalSongs: songsData.length,
      });
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    // Refresh data after upload
    fetchAdminData();
  };

  const handleDeleteAlbum = async (albumId) => {
    if (!window.confirm('Are you sure you want to delete this album and all its songs?')) {
      return;
    }

    try {
      await adminAPI.deleteAlbum(albumId);
      setAlbums(albums.filter((album) => album.id !== albumId));
      setStats((prev) => ({
        ...prev,
        totalAlbums: prev.totalAlbums - 1,
      }));
      alert('Album deleted successfully!');
    } catch (err) {
      console.error('Error deleting album:', err);
      alert('Failed to delete album');
    }
  };

  const handleDeleteSong = async (songId) => {
    if (!window.confirm('Are you sure you want to delete this song?')) {
      return;
    }

    try {
      await adminAPI.deleteSong(songId);
      setSongs(songs.filter((song) => song.id !== songId));
      setStats((prev) => ({
        ...prev,
        totalSongs: prev.totalSongs - 1,
      }));
      alert('Song deleted successfully!');
    } catch (err) {
      console.error('Error deleting song:', err);
      alert('Failed to delete song');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Manage your music library and uploads</p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 shadow-lg">
            <div className="text-3xl font-bold">{stats.totalAlbums}</div>
            <div className="text-blue-200">Total Albums</div>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 shadow-lg">
            <div className="text-3xl font-bold">{stats.totalSongs}</div>
            <div className="text-green-200">Total Songs</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 font-semibold transition-all duration-200 ${
              activeTab === 'upload'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upload Music
          </button>
          <button
            onClick={() => setActiveTab('albums')}
            className={`px-6 py-3 font-semibold transition-all duration-200 ${
              activeTab === 'albums'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Manage Albums
          </button>
          <button
            onClick={() => setActiveTab('songs')}
            className={`px-6 py-3 font-semibold transition-all duration-200 ${
              activeTab === 'songs'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Manage Songs
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Upload New Music</h2>
              <UploadForm onUploadSuccess={handleUploadSuccess} />
            </div>
          )}

          {/* Albums Tab */}
          {activeTab === 'albums' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Albums Library</h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-slate-400">Loading albums...</div>
                </div>
              ) : albums.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">No albums found. Create one to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {albums.map((album) => (
                    <div
                      key={album.id}
                      className="bg-slate-700/50 border border-slate-600 rounded-lg overflow-hidden hover:border-green-400 transition-all duration-200 transform hover:scale-105"
                    >
                      {album.thumbnail && (
                        <img
                          src={album.thumbnail}
                          alt={album.title}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2 truncate">{album.title}</h3>
                        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                          {album.description}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteAlbum(album.id)}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition-all duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Songs Tab */}
          {activeTab === 'songs' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Songs Library</h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-slate-400">Loading songs...</div>
                </div>
              ) : songs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">No songs found. Upload some to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {songs.map((song) => (
                    <div
                      key={song.id}
                      className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex items-center justify-between hover:border-green-400 transition-all duration-200"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{song.title}</h3>
                        <p className="text-slate-400 text-sm">{song.description}</p>
                        {song.album_id && (
                          <p className="text-slate-500 text-xs mt-1">
                            Album ID: {song.album_id}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteSong(song.id)}
                        className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition-all duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
