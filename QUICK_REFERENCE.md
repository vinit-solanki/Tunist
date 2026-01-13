# 🎵 Quick Reference - Enhanced Recommendation System

## 🚀 Start Commands

### Local Development
```bash
# Start Enhanced API (Terminal 1)
cd recommendation_model
python enhanced_recommendation_api.py
# Runs on: http://localhost:5005

# Start Frontend (Terminal 2)
cd frontend
npm run dev
# Runs on: http://localhost:5173
```

### Test API
```bash
# Health check
curl http://localhost:5005/health

# Get options
curl http://localhost:5005/api/options

# Get recommendations
curl -X POST http://localhost:5005/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"emotion":"happy","num_recommendations":5}'
```

---

## 📊 Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Server & model status |
| `/api/options` | GET | Available emotions, genres, filters |
| `/api/model-info` | GET | Model details & metrics |
| `/api/stats` | GET | Dataset statistics |
| `/api/recommend` | POST | Get recommendations by emotion |
| `/api/similar` | POST | Get similar songs |
| `/api/cluster/<id>` | GET | Discover songs from cluster |
| `/api/search` | POST | Search songs |
| `/api/debug` | GET | Debug information |

---

## 💻 Frontend Usage

```javascript
import { recommendationAPI } from '../utils/api';

// Get recommendations
const recs = await recommendationAPI.getRecommendations('happy', 10, {
  genre: ['pop'],
  tempo_min: 120,
  energy_min: 0.7
});

// Get similar songs
const similar = await recommendationAPI.getSimilarSongs('Artist', 'Song', 5);

// Discover from cluster
const cluster = await recommendationAPI.getClusterSongs(5, 20);

// Search
const results = await recommendationAPI.searchSongs('beatles', 20);
```

---

## 🎯 Algorithm Overview

```
Input: User selects emotion (e.g., "happy")
  ↓
1. Filter songs by emotion
  ↓
2. Get top 5 popular songs as references
  ↓
3. For each reference:
   - Find neighbors using cosine similarity (70% weight)
   - Find neighbors using euclidean distance (30% weight)
   - Combine with hybrid scoring
  ↓
4. Apply ranking:
   - Base similarity score
   - × Popularity boost (1.0-1.2)
   - × Diversity penalty (based on cluster)
  ↓
5. Sort by final ranking score
  ↓
Output: Top N diverse, relevant recommendations
```

---

## 📈 Metrics Explained

| Metric | Range | Meaning |
|--------|-------|---------|
| `similarity_score` | 0-1 | Raw cosine/euclidean similarity |
| `ranking_score` | 0-1.2 | Final weighted score |
| `popularity` | 0-100 | Track popularity |
| `energy` | 0-1 | Intensity & activity |
| `danceability` | 0-1 | Suitability for dancing |
| `positiveness` | 0-1 | Musical mood (valence) |
| `tempo` | 40-200 | Beats per minute |

---

## 🔧 Configuration

### Update API URL
```javascript
// src/config/api.config.js
production: {
  recommendation: 'https://YOUR-APP.onrender.com',
}
```

### Adjust Diversity
```python
# In enhanced_recommendation_api.py, line 24
model = EnhancedMusicRecommendationModel(
    n_components=15,
    diversity_weight=0.3  # 0.0 = no diversity, 1.0 = max diversity
)
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Model not loading | Check `light_spotify_dataset.csv` exists |
| Slow responses | Reduce `num_recommendations` or check server resources |
| No recommendations | Verify emotion exists with `/api/options` |
| CORS errors | Check API URL is correct |
| Empty results | Filters may be too restrictive |

---

## 📦 Deploy to Render

1. **Create Web Service** on [Render.com](https://render.com)
2. **Configure:**
   - Build: `pip install -r requirements.txt`
   - Start: `python enhanced_recommendation_api.py`
   - Root: `recommendation_model`
3. **Deploy** and wait ~5-10 minutes
4. **Update** frontend config with your URL
5. **Test** with `/health` endpoint

---

## 🎓 Interview Talking Points

1. **"Why hybrid similarity?"**
   - Cosine captures style/direction, euclidean captures intensity
   - Combined provides richer similarity measurement

2. **"How do you ensure diversity?"**
   - K-Means clustering groups similar songs
   - Diversity penalty discourages multiple picks from same cluster
   - Configurable weight balances relevance vs variety

3. **"How is it evaluated?"**
   - PCA variance (data quality)
   - Cluster distribution (diversity)
   - Ranking vs similarity scores (transparency)
   - Can add offline metrics (NDCG, MAP) and A/B testing

4. **"How does it scale?"**
   - LRU caching for frequent queries
   - Stratified sampling for large datasets
   - Ball tree algorithm for fast searches
   - Can add Redis for distributed caching

5. **"What makes it production-ready?"**
   - Error handling & validation
   - Health checks & monitoring
   - CORS enabled
   - Environment configuration
   - Comprehensive logging

---

## 📚 File Structure

```
Spotify_Clone/
├── recommendation_model/
│   ├── enhanced_recommendation_api.py  ← Main API (use this)
│   ├── light_spotify_dataset.csv
│   ├── requirements.txt
│   ├── DEPLOYMENT_GUIDE.md
│   ├── model.py                        ← Can archive
│   └── flask_ml_api.py                 ← Can archive
├── frontend/
│   ├── src/
│   │   ├── config/
│   │   │   └── api.config.js           ← API URLs
│   │   ├── utils/
│   │   │   └── api.js                  ← API wrapper
│   │   └── pages/
│   │       └── MusicRecommendation.jsx ← UI component
│   └── INTEGRATION_README.md
└── ENHANCEMENT_SUMMARY.md
```

---

## ⚡ Quick Commands Cheat Sheet

```bash
# Install dependencies
pip install -r requirements.txt

# Run API locally
python enhanced_recommendation_api.py

# Test health
curl http://localhost:5005/health

# Get model info
curl http://localhost:5005/api/model-info

# Deploy check
curl https://YOUR-APP.onrender.com/health

# Frontend build
npm run build

# Frontend dev
npm run dev
```

---

**Need help?** Check:
1. DEPLOYMENT_GUIDE.md for deployment
2. INTEGRATION_README.md for frontend usage
3. ENHANCEMENT_SUMMARY.md for overview
