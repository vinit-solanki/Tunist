import axios from 'axios';

const ADMIN_SERVICE_URL = 'https://tunist-admin-service-1.onrender.com/api/v1';
const USER_SERVICE_URL = 'https://tunist-user-service.onrender.com/api/v1';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Admin Service APIs
export const adminAPI = {
  // Create a new album with thumbnail
  createAlbum: async (albumData) => {
    const formData = new FormData();
    formData.append('title', albumData.title);
    formData.append('description', albumData.description);
    formData.append('file', albumData.thumbnail);

    return axios.post(`${ADMIN_SERVICE_URL}/album/new`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        token: getToken(),
      },
    });
  },

  // Add a new song to an album
  createSong: async (songData) => {
    const formData = new FormData();
    formData.append('title', songData.title);
    formData.append('description', songData.description);
    formData.append('file', songData.audio);
    formData.append('album', songData.albumId);

    return axios.post(`${ADMIN_SERVICE_URL}/song/new`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        token: getToken(),
      },
    });
  },

  // Add thumbnail to existing song
  addSongThumbnail: async (songId, thumbnail) => {
    const formData = new FormData();
    formData.append('file', thumbnail);

    return axios.post(`${ADMIN_SERVICE_URL}/song/${songId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        token: getToken(),
      },
    });
  },

  // Delete an album
  deleteAlbum: async (albumId) => {
    return axios.delete(`${ADMIN_SERVICE_URL}/album/${albumId}`, {
      headers: { token: getToken() },
    });
  },

  // Delete a song
  deleteSong: async (songId) => {
    return axios.delete(`${ADMIN_SERVICE_URL}/song/${songId}`, {
      headers: { token: getToken() },
    });
  },
};

// User Service APIs
export const userAPI = {
  // Get current user profile
  getProfile: async () => {
    return axios.get(`${USER_SERVICE_URL}/user/me`, {
      headers: { token: getToken() },
    });
  },

  // Login
  login: async (email, password) => {
    return axios.post(`${USER_SERVICE_URL}/user/login`, { email, password });
  },

  // Register
  register: async (userData) => {
    return axios.post(`${USER_SERVICE_URL}/user/register`, userData);
  },
};

export default { adminAPI, userAPI };
