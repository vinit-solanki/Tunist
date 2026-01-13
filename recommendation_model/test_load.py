import pandas as pd
import os

print("Current directory:", os.getcwd())
print("Files in directory:", os.listdir('.'))

csv_file = 'light_spotify_dataset.csv'
if os.path.exists(csv_file):
    print(f"\n✅ Found {csv_file}")
    df = pd.read_csv(csv_file)
    print(f"📊 Loaded {len(df)} rows")
    print(f"📋 Columns: {list(df.columns)}")
    
    if 'emotion' in df.columns:
        print(f"🎭 Emotions: {df['emotion'].unique().tolist()}")
        print(f"✅ Dataset looks good!")
    else:
        print("❌ Missing 'emotion' column!")
else:
    print(f"❌ {csv_file} not found!")

pkl_file = 'enhanced_music_model.pkl'
if os.path.exists(pkl_file):
    print(f"\n⚠️ Found {pkl_file} - this will be loaded instead of CSV")
    print("   Delete it if you want to retrain from CSV")
