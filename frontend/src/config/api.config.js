// API Configuration
// Update these URLs based on your deployment environment

const API_URLS = {
  // Production URLs (deployed on Render)
  production: {
    admin: 'https://tunist-admin-service-1.onrender.com/api/v1',
    user: 'https://tunist-user-service.onrender.com/api/v1',
  },
  
  // Development URLs (local)
  development: {
    admin: 'http://localhost:5001/api/v1',
    user: 'http://localhost:5002/api/v1',
  },
};

// Detect environment (for admin and user services)
const env = process.env.NODE_ENV || 'production';

// Export active configuration
export const API_CONFIG = API_URLS[env];

// For easy access - admin and user services follow the environment
export const ADMIN_SERVICE_URL = API_CONFIG.admin;
export const USER_SERVICE_URL = API_CONFIG.user;

// IMPORTANT: Music Recommendation API ALWAYS uses production URL
// This ensures recommendations work in both dev and production environments
export const RECOMMENDATION_SERVICE_URL = 'https://song-recommendation-using.onrender.com';

export default API_CONFIG;
