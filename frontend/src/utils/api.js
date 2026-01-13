import axios from 'axios';
import { ADMIN_SERVICE_URL, USER_SERVICE_URL, RECOMMENDATION_SERVICE_URL } from '../config/api.config';

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

// Recommendation Service APIs (Enhanced)
export const recommendationAPI = {
  // Check API health
  getHealth: async () => {
    return axios.get(`${RECOMMENDATION_SERVICE_URL}/health`);
  },

  // Get available filtering options
  getOptions: async () => {
    return axios.get(`${RECOMMENDATION_SERVICE_URL}/api/options`);
  },

  // Get model information
  getModelInfo: async () => {
    return axios.get(`${RECOMMENDATION_SERVICE_URL}/api/model-info`);
  },

  // Get statistics
  getStats: async () => {
    return axios.get(`${RECOMMENDATION_SERVICE_URL}/api/stats`);
  },

  // Get emotion-based recommendations (enhanced)
  getRecommendations: async (emotion, numRecommendations = 10, filters = {}) => {
    return axios.post(`${RECOMMENDATION_SERVICE_URL}/api/recommend`, {
      emotion,
      num_recommendations: numRecommendations,
      filters,
    });
  },

  // Get similar songs (enhanced)
  getSimilarSongs: async (artist, song, numRecommendations = 10) => {
    return axios.post(`${RECOMMENDATION_SERVICE_URL}/api/similar`, {
      artist,
      song,
      num_recommendations: numRecommendations,
    });
  },

  // Get songs from a cluster (discovery feature)
  getClusterSongs: async (clusterId, num = 20) => {
    return axios.get(`${RECOMMENDATION_SERVICE_URL}/api/cluster/${clusterId}?num=${num}`);
  },

  // Search for songs
  searchSongs: async (query, limit = 20) => {
    return axios.post(`${RECOMMENDATION_SERVICE_URL}/api/search`, {
      query,
      limit,
    });
  },

  // Get debug info
  getDebug: async () => {
    return axios.get(`${RECOMMENDATION_SERVICE_URL}/api/debug`);
  },
};

export default { adminAPI, userAPI, recommendationAPI };
