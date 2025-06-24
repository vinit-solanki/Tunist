import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UploadForm() {
  const navigate = useNavigate();
  const [albumData, setAlbumData] = useState({
    title: '',
    description: '',
    thumbnail: null,
  });
  const [songData, setSongData] = useState({
    title: '',
    description: '',
    audio: null,
    thumbnail: null,
  });
  const [albumId, setAlbumId] = useState(null);
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setError('Please log in to upload content');
      navigate('/login');
    } else {
      setToken(storedToken);
    }
  }, [navigate]);

  const handleAlbumChange = (e) => {
    const { name, value, files } = e.target;
    setAlbumData({
      ...albumData,
      [name]: files ? files[0] : value,
    });
    setError('');
  };

  const handleSongChange = (e) => {
    const { name, value, files } = e.target;
    setSongData({
      ...songData,
      [name]: files ? files[0] : value,
    });
    setError('');
  };

  const showNotification = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleAlbumSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please log in');
      navigate('/login');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('title', albumData.title);
    formData.append('description', albumData.description);
    formData.append('file', albumData.thumbnail);

    try {
      const response = await axios.post('https://tunist-admin-service-1.onrender.com/api/v1/album/new', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          token: `${token}`,
        },
      });
      setAlbumId(response.data.album._id);
      showNotification('Album created successfully!');
      setAlbumData({ title: '', description: '', thumbnail: null });
    } catch (err) {
      setError(err.response?.data?.message || 'Album creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSongSubmit = async (e) => {
    e.preventDefault();
    if (!albumId) {
      setError('Please create an album first');
      return;
    }
    if (!token) {
      setError('Please log in');
      navigate('/login');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('title', songData.title);
    formData.append('description', songData.description);
    formData.append('file', songData.audio);
    formData.append('album', albumId);

    try {
      const response = await axios.post('https://tunist-admin-service-1.onrender.com/api/v1/song/new', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          token: `${token}`,
        },
      });
      const songId = response.data.song._id;
      if (songData.thumbnail) {
        const thumbnailFormData = new FormData();
        thumbnailFormData.append('file', songData.thumbnail);
        await axios.post(`https://tunist-admin-service-1.onrender.com/api/v1/song/${songId}`, thumbnailFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            token: `${token}`,
          },
        });
      }
      setSongs([...songs, { id: songId, title: songData.title }]);
      showNotification('Song uploaded successfully!');
      setSongData({ title: '', description: '', audio: null, thumbnail: null });
    } catch (err) {
      setError(err.response?.data?.message || 'Song upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAlbumDelete = async () => {
    if (!albumId) return;
    if (!token) {
      setError('Please log in');
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      await axios.delete(`https://tunist-admin-service-1.onrender.com/api/v1/album/${albumId}`, {
        headers: {
          token: `${token}`,
        },
      });
      showNotification('Album deleted successfully!');
      setAlbumId(null);
      setSongs([]);
      setAlbumData({ title: '', description: '', thumbnail: null });
    } catch (err) {
      setError(err.response?.data?.message || 'Album deletion failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSongDelete = async (songId) => {
    if (!token) {
      setError('Please log in');
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      await axios.delete(`https://tunist-admin-service-1.onrender.com/api/v1/song/${songId}`, {
        headers: {
          token: `${token}`,
        },
      });
      setSongs(songs.filter((song) => song.id !== songId));
      showNotification('Song deleted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Song deletion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md text-white border-2 border-white/40 border-dotted rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-100">Upload Album & Songs</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
            {successMessage}
          </div>
        )}

        <div className="space-y-8">
          {/* Album Form */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-200">Create Album</h3>
            <form onSubmit={handleAlbumSubmit} className="space-y-4">
              <div>
                <label htmlFor="albumTitle" className="block text-slate-300 font-medium">
                  Album Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="albumTitle"
                  value={albumData.title}
                  onChange={handleAlbumChange}
                  required
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                />
              </div>
              <div>
                <label htmlFor="albumDescription" className="block text-slate-300 font-medium">
                  Description
                </label>
                <textarea
                  name="description"
                  id="albumDescription"
                  value={albumData.description}
                  onChange={handleAlbumChange}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                />
              </div>
              <div>
                <label htmlFor="albumThumbnail" className="block text-slate-300 font-medium">
                  Thumbnail
                </label>
                <input
                  type="file"
                  name="thumbnail"
                  id="albumThumbnail"
                  accept="image/*"
                  onChange={handleAlbumChange}
                  required
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-slate-300"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-200"
              >
                {loading ? 'Uploading...' : 'Create Album'}
              </button>
            </form>
            {albumId && (
              <button
                onClick={handleAlbumDelete}
                disabled={loading}
                className="w-full mt-4 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200"
              >
                {loading ? 'Deleting...' : 'Delete Album'}
              </button>
            )}
          </div>

          {/* Song Form */}
          {albumId && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-200">Add Song</h3>
              <form onSubmit={handleSongSubmit} className="space-y-4">
                <div>
                  <label htmlFor="songTitle" className="block text-slate-300 font-medium">
                    Song Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="songTitle"
                    value={songData.title}
                    onChange={handleSongChange}
                    required
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                  />
                </div>
                <div>
                  <label htmlFor="songDescription" className="block text-slate-300 font-medium">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="songDescription"
                    value={songData.description}
                    onChange={handleSongChange}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                  />
                </div>
                <div>
                  <label htmlFor="songAudio" className="block text-slate-300 font-medium">
                    Audio File
                  </label>
                  <input
                    type="file"
                    name="audio"
                    id="songAudio"
                    accept="audio/*"
                    onChange={handleSongChange}
                    required
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-slate-300"
                  />
                </div>
                <div>
                  <label htmlFor="songThumbnail" className="block text-slate-300 font-medium">
                    Thumbnail (Optional)
                  </label>
                  <input
                    type="file"
                    name="thumbnail"
                    id="songThumbnail"
                    accept="image/*"
                    onChange={handleSongChange}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-slate-300"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-200"
                >
                  {loading ? 'Uploading...' : 'Add Song'}
                </button>
              </form>
              {songs.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-2 text-slate-200">Uploaded Songs</h4>
                  <ul className="space-y-2">
                    {songs.map((song) => (
                      <li key={song.id} className="flex justify-between items-center">
                        <span className="text-slate-300">{song.title}</span>
                        <button
                          onClick={() => handleSongDelete(song.id)}
                          disabled={loading}
                          className="py-1 px-3 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition duration-200"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadForm;