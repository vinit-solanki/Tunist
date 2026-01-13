# 🎵 Enhanced Recommendation System - Frontend Integration

## ✅ What's Been Integrated

### 1. Enhanced API Wrapper (`src/utils/api.js`)
- ✅ `recommendationAPI.getHealth()` - Check API status
- ✅ `recommendationAPI.getOptions()` - Get available filters
- ✅ `recommendationAPI.getModelInfo()` - Get model details
- ✅ `recommendationAPI.getRecommendations(emotion, count, filters)` - Get emotion-based recommendations
- ✅ `recommendationAPI.getSimilarSongs(artist, song, count)` - Get similar songs
- ✅ `recommendationAPI.getClusterSongs(clusterId, num)` - Discovery feature
- ✅ `recommendationAPI.searchSongs(query, limit)` - Search songs
- ✅ `recommendationAPI.getStats()` - Get statistics
- ✅ `recommendationAPI.getDebug()` - Debug info

### 2. Updated MusicRecommendation Component
- ✅ Enhanced UI showing ranking scores
- ✅ Displays diversity metrics
- ✅ Shows algorithm used (Hybrid Multi-Metric)
- ✅ Better error handling
- ✅ Support for new API fields (ranking_score, cluster_id, positiveness)
- ✅ Model version display
- ✅ Cluster count display

### 3. Configuration System (`src/config/api.config.js`)
- ✅ Environment-based API URLs
- ✅ Easy switching between local/production
- ✅ Centralized URL management

---

## 🚀 How to Use

### Local Development

1. **Start the enhanced API:**
   ```bash
   cd recommendation_model
   python enhanced_recommendation_api.py
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access:** `http://localhost:5173/recommendations`

### Production

1. **Deploy enhanced API to Render** (see DEPLOYMENT_GUIDE.md)

2. **Update config with your deployed URL:**
   ```javascript
   // src/config/api.config.js
   production: {
     recommendation: 'https://your-app.onrender.com',
   }
   ```

3. **Build and deploy frontend:**
   ```bash
   npm run build
   ```

---

## 📊 New Features Available

### 1. Enhanced Recommendations
Shows both similarity and ranking scores:
```jsx
{
  song: "Song Title",
  artist: "Artist Name",
  similarity_score: 0.9234,      // Raw similarity
  ranking_score: 0.9567,         // Final score (similarity + popularity + diversity)
  cluster_id: 5,                 // Which cluster the song belongs to
  positiveness: 0.85             // Mood metric
}
```

### 2. Model Information Display
```jsx
{
  total_songs: 15000,
  pca_components: 15,
  explained_variance: 0.847,
  total_clusters: 20,
  model_version: "2.0_enhanced",
  algorithms: ["hybrid_cosine_euclidean", "pca", "kmeans_clustering"]
}
```

### 3. Better Error Handling
- Health checks before API calls
- Debug mode for troubleshooting
- Clear error messages

---

## 🎯 Usage Examples

### Get Emotion-Based Recommendations
```javascript
import { recommendationAPI } from '../utils/api';

const getRecommendations = async () => {
  try {
    const response = await recommendationAPI.getRecommendations(
      'happy',           // emotion
      10,                // number of recommendations
      {                  // filters
        genre: ['pop'],
        tempo_min: 120,
        tempo_max: 140,
        energy_min: 0.7,
        energy_max: 1.0
      }
    );
    
    console.log(response.data);
    // {
    //   recommendations: [...],
    //   algorithm: "hybrid_pca_knn",
    //   diversity_score: 0.3,
    //   pca_variance_explained: 0.847
    // }
  } catch (error) {
    console.error(error);
  }
};
```

### Get Similar Songs
```javascript
const getSimilar = async () => {
  try {
    const response = await recommendationAPI.getSimilarSongs(
      'The Beatles',     // artist
      'Hey Jude',        // song
      5                  // number of similar songs
    );
    
    console.log(response.data);
    // {
    //   similar_songs: [...],
    //   algorithm: "hybrid_multi_metric",
    //   reference_song: { artist: "...", title: "..." }
    // }
  } catch (error) {
    console.error(error);
  }
};
```

### Discover New Songs (Cluster-based)
```javascript
const discover = async () => {
  try {
    const response = await recommendationAPI.getClusterSongs(
      5,    // cluster_id
      20    // number of songs
    );
    
    console.log(response.data);
    // {
    //   cluster_songs: [...],
    //   cluster_id: 5,
    //   total_in_cluster: 750
    // }
  } catch (error) {
    console.error(error);
  }
};
```

### Search for Songs
```javascript
const search = async (query) => {
  try {
    const response = await recommendationAPI.searchSongs(query, 20);
    
    console.log(response.data);
    // {
    //   results: [...],
    //   total_found: 45,
    //   query: "beatles"
    // }
  } catch (error) {
    console.error(error);
  }
};
```

### Get Statistics
```javascript
const getStats = async () => {
  try {
    const response = await recommendationAPI.getStats();
    
    console.log(response.data);
    // {
    //   total_songs: 15000,
    //   emotions: { total: 8, distribution: {...} },
    //   genres: { total: 25, top_10: {...} },
    //   audio_features: { avg_tempo: 121.5, ... },
    //   model_metrics: {...}
    // }
  } catch (error) {
    console.error(error);
  }
};
```

---

## 🔄 Migration Checklist

- [x] Created enhanced API file
- [x] Updated frontend API wrapper
- [x] Updated MusicRecommendation component
- [x] Added configuration system
- [x] Added deployment guide
- [ ] Deploy enhanced API to Render
- [ ] Update production config with new URL
- [ ] Test in production
- [ ] Archive old files (optional)

---

## 🧪 Testing

### 1. Test API Health
```javascript
const testHealth = async () => {
  const response = await recommendationAPI.getHealth();
  console.log(response.data.model_loaded); // Should be true
};
```

### 2. Test Options Loading
```javascript
const testOptions = async () => {
  const response = await recommendationAPI.getOptions();
  console.log(response.data.emotions.length > 0); // Should be true
};
```

### 3. Test Recommendations
```javascript
const testRecommend = async () => {
  const response = await recommendationAPI.getRecommendations('happy', 5);
  console.log(response.data.recommendations.length); // Should be 5
  console.log(response.data.algorithm); // Should be "hybrid_pca_knn"
};
```

---

## 📈 Performance Notes

### Caching
- The enhanced API caches 100 most recent queries
- Repeated requests are served instantly
- Cache is automatically managed

### Response Times
- First request: ~1-2 seconds (model computation)
- Cached requests: <100ms
- Subsequent requests: ~200-500ms

### Optimization Tips
1. Request reasonable number of recommendations (5-20)
2. Use filters to narrow results
3. Debounce search inputs
4. Cache results in frontend state when appropriate

---

## 🐛 Debugging

### Enable Debug Mode
```javascript
const debug = async () => {
  const response = await recommendationAPI.getDebug();
  console.log(response.data);
  // Shows model state, data availability, column names, etc.
};
```

### Common Issues

**Issue:** "Model not initialized"
- **Fix:** Check API health endpoint, wait for model to load

**Issue:** "No recommendations found"
- **Fix:** Check if emotion exists, verify filters aren't too restrictive

**Issue:** Slow responses
- **Fix:** Reduce number of recommendations, check server resources

**Issue:** CORS errors
- **Fix:** Verify API URL is correct, check CORS is enabled on backend

---

## 🎨 UI Components

### Recommendation Card
Shows enhanced metrics:
- Popularity badge (⭐)
- Ranking score badge (🎯)
- Similarity vs Ranking comparison
- Mood/positiveness percentage

### Model Info Banner
Shows:
- Total songs (📊)
- PCA components (🧠)
- Variance explained (📈)
- Cluster count (🎪)
- Model version

---

## 🔐 Security Notes

- No authentication required for recommendation API (public read-only)
- All other APIs (admin, user) require token authentication
- Token stored in localStorage
- Tokens verified by backend services

---

## 📚 Further Enhancements

Possible future additions:
1. User preference learning
2. Collaborative filtering
3. Real-time recommendation updates
4. A/B testing framework
5. Recommendation explanations
6. Playlist generation
7. Mood-based radio

---

## 📞 Support

For issues or questions:
1. Check console logs
2. Use `/api/debug` endpoint
3. Verify API is running (`/health`)
4. Check network tab in browser DevTools
5. Review error messages in UI

Happy coding! 🎵
