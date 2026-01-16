import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../utils/api';

function UploadForm({ onUploadSuccess = null }) {
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
  const [uploadProgress, setUploadProgress] = useState(0);

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

    if (!albumData.title.trim()) {
      setError('Album title is required');
      return;
    }

    if (!albumData.thumbnail) {
      setError('Album thumbnail is required');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const response = await adminAPI.createAlbum({
        title: albumData.title,
        description: albumData.description,
        thumbnail: albumData.thumbnail,
      });
      setAlbumId(response.data.album.id);
      showNotification('Album created successfully!');
      setAlbumData({ title: '', description: '', thumbnail: null });
      setUploadProgress(100);
      
      // Call parent callback if provided
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Album creation failed');
    } finally {
      setLoading(false);
      setUploadProgress(0);
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

    if (!songData.title.trim()) {
      setError('Song title is required');
      return;
    }

    if (!songData.audio) {
      setError('Song audio file is required');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const response = await adminAPI.createSong({
        title: songData.title,
        description: songData.description,
        audio: songData.audio,
        albumId: albumId,
      });
      const songId = response.data.song.id;
      
      if (songData.thumbnail) {
        await adminAPI.addSongThumbnail(songId, songData.thumbnail);
      }
      
      setSongs([...songs, { id: songId, title: songData.title }]);
      showNotification('Song uploaded successfully!');
      setSongData({ title: '', description: '', audio: null, thumbnail: null });
      setUploadProgress(100);

      // Call parent callback if provided
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Song upload failed');
    } finally {
      setLoading(false);
      setUploadProgress(0);
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
      await adminAPI.deleteAlbum(albumId);
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
      await adminAPI.deleteSong(songId);
      setSongs(songs.filter((song) => song.id !== songId));
      showNotification('Song deleted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Song deletion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-green-500/10 border border-green-500 text-green-400 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {/* Album Form */}
        <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-sm">1</span>
            Create Album
          </h3>
          <form onSubmit={handleAlbumSubmit} className="space-y-4">
            <div>
              <label htmlFor="albumTitle" className="block text-slate-300 font-medium mb-2">
                Album Title *
              </label>
              <input
                type="text"
                name="title"
                id="albumTitle"
                value={albumData.title}
                onChange={handleAlbumChange}
                placeholder="Enter album title"
                required
                className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label htmlFor="albumDescription" className="block text-slate-300 font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                id="albumDescription"
                value={albumData.description}
                onChange={handleAlbumChange}
                placeholder="Enter album description"
                rows="3"
                className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label htmlFor="albumThumbnail" className="block text-slate-300 font-medium mb-2">
                Album Thumbnail *
              </label>
              <input
                type="file"
                name="thumbnail"
                id="albumThumbnail"
                accept="image/*"
                onChange={handleAlbumChange}
                required
                className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-400 cursor-pointer"
              />
              {albumData.thumbnail && (
                <p className="text-sm text-green-400 mt-2">✓ {albumData.thumbnail.name}</p>
              )}
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition duration-200"
            >
              {loading ? `Creating Album... ${uploadProgress}%` : 'Create Album'}
            </button>
          </form>
          {albumId && (
            <button
              onClick={handleAlbumDelete}
              disabled={loading}
              className="w-full mt-4 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-lg transition duration-200"
            >
              {loading ? 'Deleting...' : 'Delete Album'}
            </button>
          )}
        </div>

        {/* Song Form */}
        {albumId && (
          <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-sm">2</span>
              Add Songs to Album
            </h3>
            <form onSubmit={handleSongSubmit} className="space-y-4">
              <div>
                <label htmlFor="songTitle" className="block text-slate-300 font-medium mb-2">
                  Song Title *
                </label>
                <input
                  type="text"
                  name="title"
                  id="songTitle"
                  value={songData.title}
                  onChange={handleSongChange}
                  placeholder="Enter song title"
                  required
                  className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label htmlFor="songDescription" className="block text-slate-300 font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  id="songDescription"
                  value={songData.description}
                  onChange={handleSongChange}
                  placeholder="Enter song description"
                  rows="2"
                  className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label htmlFor="songAudio" className="block text-slate-300 font-medium mb-2">
                  Audio File *
                </label>
                <input
                  type="file"
                  name="audio"
                  id="songAudio"
                  accept="audio/*"
                  onChange={handleSongChange}
                  required
                  className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-400 cursor-pointer"
                />
                {songData.audio && (
                  <p className="text-sm text-green-400 mt-2">✓ {songData.audio.name}</p>
                )}
              </div>
              <div>
                <label htmlFor="songThumbnail" className="block text-slate-300 font-medium mb-2">
                  Song Thumbnail (Optional)
                </label>
                <input
                  type="file"
                  name="thumbnail"
                  id="songThumbnail"
                  accept="image/*"
                  onChange={handleSongChange}
                  className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-400 cursor-pointer"
                />
                {songData.thumbnail && (
                  <p className="text-sm text-green-400 mt-2">✓ {songData.thumbnail.name}</p>
                )}
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition duration-200"
              >
                {loading ? `Uploading Song... ${uploadProgress}%` : 'Upload Song'}
              </button>
            </form>

            {/* Uploaded Songs List */}
            {songs.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-600">
                <h4 className="text-lg font-semibold mb-4">Uploaded Songs ({songs.length})</h4>
                <div className="space-y-2">
                  {songs.map((song) => (
                    <div
                      key={song.id}
                      className="flex justify-between items-center bg-slate-600/50 p-3 rounded-lg hover:bg-slate-600 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          ♪
                        </div>
                        <span className="text-slate-200 font-medium">{song.title}</span>
                      </div>
                      <button
                        onClick={() => handleSongDelete(song.id)}
                        disabled={loading}
                        className="py-1 px-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded-lg transition duration-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!albumId && (
          <div className="bg-slate-700/30 border border-dashed border-slate-600 rounded-lg p-8 text-center">
            <p className="text-slate-400">
              Create an album first to start uploading songs. Follow the steps above to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadForm;