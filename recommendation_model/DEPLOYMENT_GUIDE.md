# Enhanced Recommendation API - Deployment Guide

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   cd recommendation_model
   pip install -r requirements.txt
   ```

2. **Run the enhanced API:**
   ```bash
   python enhanced_recommendation_api.py
   ```

   The server will start at `http://localhost:5005`

3. **Test the API:**
   ```bash
   curl http://localhost:5005/health
   ```

---

## 🌐 Deploy to Render.com

### Step 1: Prepare Files

Ensure these files are in your `recommendation_model/` folder:
- ✅ `enhanced_recommendation_api.py`
- ✅ `requirements.txt`
- ✅ `light_spotify_dataset.csv`

### Step 2: Update requirements.txt

Make sure your `requirements.txt` includes:
```
flask==3.0.0
flask-cors==4.0.0
pandas==2.1.3
numpy==1.26.2
scikit-learn==1.3.2
```

### Step 3: Deploy on Render

1. **Go to [Render.com](https://render.com)** and login
2. **Create New Web Service**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name:** `enhanced-music-recommendation`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python enhanced_recommendation_api.py`
   - **Root Directory:** `recommendation_model`
   
5. **Environment Variables:**
   - `PYTHON_VERSION`: `3.11.0`
   - `PORT`: `5005` (Render auto-assigns, but you can specify)
   - `FLASK_ENV`: `production`

6. **Click "Create Web Service"**

### Step 4: Wait for Deployment

- First deployment takes 5-10 minutes
- Render will install dependencies and train the model
- Watch logs for: `✅ Enhanced model initialized successfully!`

### Step 5: Get Your API URL

Once deployed, you'll get a URL like:
```
https://enhanced-music-recommendation.onrender.com
```

### Step 6: Update Frontend

In `frontend/src/config/api.config.js`, update:
```javascript
production: {
  recommendation: 'https://enhanced-music-recommendation.onrender.com',
}
```

---

## 🧪 Testing Your Deployment

### 1. Health Check
```bash
curl https://your-app.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_info": {
    "total_songs": 15000,
    "pca_components": 15,
    "model_version": "2.0_enhanced"
  }
}
```

### 2. Get Options
```bash
curl https://your-app.onrender.com/api/options
```

### 3. Test Recommendations
```bash
curl -X POST https://your-app.onrender.com/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "emotion": "happy",
    "num_recommendations": 5
  }'
```

### 4. Test Similar Songs
```bash
curl -X POST https://your-app.onrender.com/api/similar \
  -H "Content-Type: application/json" \
  -d '{
    "artist": "Artist Name",
    "song": "Song Title",
    "num_recommendations": 5
  }'
```

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check API health & model status |
| GET | `/api/options` | Get available emotions, genres, filters |
| GET | `/api/model-info` | Get detailed model information |
| GET | `/api/stats` | Get dataset statistics |
| POST | `/api/recommend` | Get emotion-based recommendations |
| POST | `/api/similar` | Get similar songs |
| GET | `/api/cluster/<id>` | Get songs from cluster (discovery) |
| POST | `/api/search` | Search for songs |
| GET | `/api/debug` | Get debug information |

---

## 🔧 Troubleshooting

### Issue: Model not loading
**Solution:** Check that `light_spotify_dataset.csv` is in the same directory as the Python file

### Issue: Out of memory
**Solution:** 
1. Reduce dataset size in the code (change `max_size=20000` to `max_size=10000`)
2. Reduce PCA components (change `n_components=15` to `n_components=10`)
3. Upgrade Render plan for more RAM

### Issue: Slow first request
**Solution:** This is normal - Render spins down free tier services. First request wakes it up (takes ~30s)

### Issue: CORS errors
**Solution:** The API has `CORS(app, origins=["*"])` enabled. If issues persist, check browser console

---

## 🎯 Performance Optimization

### For Production:

1. **Pre-train the model:**
   - Run locally and generate `enhanced_music_model.pkl`
   - Upload the pickle file to Render
   - Model will load instantly instead of training on startup

2. **Enable caching:**
   - Already implemented in the code
   - Caches 100 most recent queries

3. **Use environment variables:**
   ```python
   DIVERSITY_WEIGHT = float(os.getenv('DIVERSITY_WEIGHT', '0.3'))
   PCA_COMPONENTS = int(os.getenv('PCA_COMPONENTS', '15'))
   ```

---

## 📈 Monitoring

Check logs in Render dashboard for:
- ✅ `Model initialized successfully!`
- ⚠️ Warning messages
- ❌ Error traces

Monitor metrics:
- Response times
- Memory usage
- Request counts

---

## 🔄 Updating

To deploy changes:
1. Push code to GitHub
2. Render auto-deploys (if enabled)
3. Or manually trigger deploy in Render dashboard

---

## 💡 Tips

1. **Keep the old API running** during migration
2. **Test with Postman** before connecting frontend
3. **Use `/api/debug`** endpoint for troubleshooting
4. **Check `/health`** regularly
5. **Monitor response times** and optimize if needed

---

## 📞 Support

If you encounter issues:
1. Check Render logs
2. Test with curl commands
3. Use `/api/debug` endpoint
4. Check that CSV file is properly formatted
