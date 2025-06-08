import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.pipeline import Pipeline
import pickle
import warnings
warnings.filterwarnings('ignore')

print("🎵 Music Emotion Classification Model Training")
print("=" * 50)

# Create a sample dataframe based on the provided data
data = pd.read_csv("light_spotify_dataset.csv")

# Create a sample dataframe
sample_df = pd.DataFrame(data)

print("Sample data format:")
print(sample_df.head())

# In a real scenario, we would load the full dataset
print("\n🔍 Loading and exploring the dataset...")
# For demonstration, let's generate a larger synthetic dataset based on the sample
np.random.seed(42)
n_samples = 1000

# Define emotion classes and their distributions
emotions = ['joy', 'love', 'sadness', 'anger', 'fear', 'surprise']
emotion_dist = [0.3, 0.25, 0.2, 0.1, 0.1, 0.05]  # Distribution of emotions

# Generate synthetic data
synthetic_data = []

for _ in range(n_samples):
    emotion = np.random.choice(emotions, p=emotion_dist)
    
    # Base audio features that vary by emotion
    if emotion == 'joy':
        energy_base = np.random.normal(75, 10)
        danceability_base = np.random.normal(65, 15)
        positiveness_base = np.random.normal(80, 15)
        tempo_base = np.random.normal(125, 15)
    elif emotion == 'love':
        energy_base = np.random.normal(45, 15)
        danceability_base = np.random.normal(55, 15)
        positiveness_base = np.random.normal(60, 20)
        tempo_base = np.random.normal(100, 15)
    elif emotion == 'sadness':
        energy_base = np.random.normal(35, 15)
        danceability_base = np.random.normal(40, 15)
        positiveness_base = np.random.normal(30, 15)
        tempo_base = np.random.normal(90, 20)
    elif emotion == 'anger':
        energy_base = np.random.normal(85, 10)
        danceability_base = np.random.normal(50, 15)
        positiveness_base = np.random.normal(25, 15)
        tempo_base = np.random.normal(140, 20)
    elif emotion == 'fear':
        energy_base = np.random.normal(60, 20)
        danceability_base = np.random.normal(35, 15)
        positiveness_base = np.random.normal(20, 10)
        tempo_base = np.random.normal(110, 30)
    else:  # surprise
        energy_base = np.random.normal(70, 20)
        danceability_base = np.random.normal(60, 20)
        positiveness_base = np.random.normal(65, 25)
        tempo_base = np.random.normal(120, 25)
    
    # Clamp values to reasonable ranges
    energy = max(0, min(100, energy_base))
    danceability = max(0, min(100, danceability_base))
    positiveness = max(0, min(100, positiveness_base))
    tempo = max(60, min(200, tempo_base))
    
    # Generate other features
    record = {
        'artist': f'Artist_{np.random.randint(1, 101)}',
        'song': f'Song_{np.random.randint(1, 1001)}',
        'emotion': emotion,
        'variance': np.random.uniform(0.1, 0.5),
        'Genre': np.random.choice(['pop', 'rock', 'hip-hop', 'electronic', 'jazz', 'classical', 'folk']),
        'Release Date': np.random.randint(1960, 2023),
        'Key': np.random.choice(['C Maj', 'C# Maj', 'D Maj', 'D# Maj', 'E Maj', 'F Maj', 'F# Maj', 'G Maj', 'G# Maj', 'A Maj', 'A# Maj', 'B Maj']),
        'Tempo': tempo,
        'Loudness': np.random.uniform(-20, 0),
        'Explicit': np.random.choice(['Yes', 'No'], p=[0.2, 0.8]),
        'Popularity': np.random.randint(1, 101),
        'Energy': energy,
        'Danceability': danceability,
        'Positiveness': positiveness,
        'Speechiness': np.random.randint(1, 20),
        'Liveness': np.random.randint(1, 100),
        'Acousticness': np.random.randint(1, 100),
        'Instrumentalness': np.random.randint(0, 100)
    }
    synthetic_data.append(record)

# Create DataFrame from synthetic data
df = pd.DataFrame(synthetic_data)

print(f"\n📊 Generated synthetic dataset with {len(df)} songs and {len(df.columns)} features")
print(f"Emotion distribution:")
print(df['emotion'].value_counts())

# Data exploration
print("\n📈 Basic statistics:")
numeric_cols = df.select_dtypes(include=[np.number]).columns
print(df[numeric_cols].describe().round(2))

# Visualize emotion distribution
plt.figure(figsize=(10, 6))
sns.countplot(data=df, x='emotion')
plt.title('Distribution of Emotions in Dataset')
plt.xlabel('Emotion')
plt.ylabel('Count')
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()

# Visualize key audio features by emotion
plt.figure(figsize=(15, 10))

features_to_plot = ['Energy', 'Danceability', 'Positiveness', 'Tempo']
for i, feature in enumerate(features_to_plot):
    plt.subplot(2, 2, i+1)
    sns.boxplot(data=df, x='emotion', y=feature)
    plt.title(f'{feature} by Emotion')
    plt.xticks(rotation=45)

plt.tight_layout()
plt.show()

# Correlation heatmap of audio features
plt.figure(figsize=(12, 10))
audio_features = ['Tempo', 'Loudness', 'Popularity', 'Energy', 'Danceability', 
                 'Positiveness', 'Speechiness', 'Liveness', 'Acousticness', 'Instrumentalness']
correlation = df[audio_features].corr()
sns.heatmap(correlation, annot=True, cmap='coolwarm', fmt='.2f')
plt.title('Correlation Between Audio Features')
plt.tight_layout()
plt.show()

# Data preprocessing
print("\n🔧 Preprocessing data...")

# Select features for model training
features = ['Tempo', 'Loudness', 'Energy', 'Danceability', 'Positiveness', 
           'Speechiness', 'Liveness', 'Acousticness', 'Instrumentalness']

X = df[features]
y = df['emotion']

# Encode the target variable
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded)

print(f"Training set: {X_train.shape[0]} samples")
print(f"Test set: {X_test.shape[0]} samples")

# Model training
print("\n🤖 Training machine learning models...")

# Define models to try
models = {
    'Random Forest': RandomForestClassifier(random_state=42),
    'Gradient Boosting': GradientBoostingClassifier(random_state=42),
    'SVM': SVC(probability=True, random_state=42)
}

# Create pipelines with preprocessing
pipelines = {}
for name, model in models.items():
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', model)
    ])
    pipelines[name] = pipeline

# Train and evaluate each model
results = {}
for name, pipeline in pipelines.items():
    print(f"\nTraining {name}...")
    pipeline.fit(X_train, y_train)
    
    # Evaluate
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    results[name] = accuracy
    
    print(f"Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))
    
    # Confusion Matrix
    plt.figure(figsize=(10, 8))
    cm = confusion_matrix(y_test, y_pred)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=label_encoder.classes_, 
                yticklabels=label_encoder.classes_)
    plt.title(f'Confusion Matrix - {name}')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.show()

# Find the best model
best_model_name = max(results, key=results.get)
best_accuracy = results[best_model_name]
print(f"\n🏆 Best model: {best_model_name} with accuracy {best_accuracy:.4f}")

# Hyperparameter tuning for the best model
print(f"\n⚙️ Fine-tuning {best_model_name} model...")

if best_model_name == 'Random Forest':
    param_grid = {
        'classifier__n_estimators': [100, 200, 300],
        'classifier__max_depth': [None, 10, 20, 30],
        'classifier__min_samples_split': [2, 5, 10]
    }
elif best_model_name == 'Gradient Boosting':
    param_grid = {
        'classifier__n_estimators': [100, 200, 300],
        'classifier__learning_rate': [0.01, 0.1, 0.2],
        'classifier__max_depth': [3, 5, 7]
    }
else:  # SVM
    param_grid = {
        'classifier__C': [0.1, 1, 10, 100],
        'classifier__gamma': ['scale', 'auto', 0.1, 0.01],
        'classifier__kernel': ['rbf', 'linear']
    }

# Grid search
grid_search = GridSearchCV(pipelines[best_model_name], param_grid, cv=5, scoring='accuracy', n_jobs=-1)
grid_search.fit(X_train, y_train)

print(f"Best parameters: {grid_search.best_params_}")
print(f"Best cross-validation accuracy: {grid_search.best_score_:.4f}")

# Evaluate the tuned model
best_model = grid_search.best_estimator_
y_pred = best_model.predict(X_test)
final_accuracy = accuracy_score(y_test, y_pred)

print(f"\n📊 Final model accuracy: {final_accuracy:.4f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

# Feature importance (for tree-based models)
if best_model_name in ['Random Forest', 'Gradient Boosting']:
    feature_importances = best_model.named_steps['classifier'].feature_importances_
    feature_importance_df = pd.DataFrame({
        'Feature': features,
        'Importance': feature_importances
    }).sort_values('Importance', ascending=False)
    
    plt.figure(figsize=(10, 6))
    sns.barplot(data=feature_importance_df, x='Importance', y='Feature')
    plt.title(f'Feature Importance - {best_model_name}')
    plt.tight_layout()
    plt.show()
    
    print("\n🔍 Feature Importance:")
    print(feature_importance_df)

# Save the model
print("\n💾 Saving the trained model...")

model_package = {
    'model': best_model,
    'label_encoder': label_encoder,
    'features': features,
    'accuracy': final_accuracy,
    'model_type': best_model_name
}

with open('music_emotion_classifier.pkl', 'wb') as f:
    pickle.dump(model_package, f)

print("✅ Model saved successfully as 'music_emotion_classifier.pkl'")

# Test prediction function
print("\n🧪 Testing prediction function...")

def predict_emotion(song_features, model_package):
    """Predict emotion for a song based on its audio features"""
    # Extract components from model package
    model = model_package['model']
    label_encoder = model_package['label_encoder']
    features = model_package['features']
    
    # Ensure features are in the correct order
    features_array = np.array([song_features[feature] for feature in features]).reshape(1, -1)
    
    # Predict
    emotion_id = model.predict(features_array)[0]
    emotion = label_encoder.inverse_transform([emotion_id])[0]
    
    # Get probabilities
    proba = model.predict_proba(features_array)[0]
    emotion_probs = {label_encoder.inverse_transform([i])[0]: prob for i, prob in enumerate(proba)}
    
    return {
        'predicted_emotion': emotion,
        'confidence': proba.max(),
        'emotion_probabilities': emotion_probs
    }

# Test with a happy song
happy_song = {
    'Tempo': 130,
    'Loudness': -5,
    'Energy': 85,
    'Danceability': 75,
    'Positiveness': 90,
    'Speechiness': 5,
    'Liveness': 20,
    'Acousticness': 10,
    'Instrumentalness': 0
}

# Test with a sad song
sad_song = {
    'Tempo': 85,
    'Loudness': -12,
    'Energy': 30,
    'Danceability': 35,
    'Positiveness': 20,
    'Speechiness': 3,
    'Liveness': 10,
    'Acousticness': 80,
    'Instrumentalness': 5
}

print("\nPrediction for a happy song:")
happy_prediction = predict_emotion(happy_song, model_package)
print(f"Predicted emotion: {happy_prediction['predicted_emotion']}")
print(f"Confidence: {happy_prediction['confidence']:.4f}")
print("Emotion probabilities:")
for emotion, prob in happy_prediction['emotion_probabilities'].items():
    print(f"  {emotion}: {prob:.4f}")

print("\nPrediction for a sad song:")
sad_prediction = predict_emotion(sad_song, model_package)
print(f"Predicted emotion: {sad_prediction['predicted_emotion']}")
print(f"Confidence: {sad_prediction['confidence']:.4f}")
print("Emotion probabilities:")
for emotion, prob in sad_prediction['emotion_probabilities'].items():
    print(f"  {emotion}: {prob:.4f}")

print("\n🎉 Model Training Complete!")
print("The model is ready to be integrated into the music recommendation system.")