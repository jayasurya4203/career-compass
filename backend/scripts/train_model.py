import pandas as pd
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

def train_model():
    # Load dataset
    data_path = os.path.join(os.path.dirname(__file__), '../data/career_dataset.csv')
    df = pd.read_csv(data_path)

    # Features and Target
    X = df.drop('career_role', axis=1)
    y = df['career_role']

    # Encode labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

    # Train Random Forest
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Save model and label encoder
    model_path = os.path.join(os.path.dirname(__file__), '../data/career_model.pkl')
    le_path = os.path.join(os.path.dirname(__file__), '../data/label_encoder.pkl')

    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    with open(le_path, 'wb') as f:
        pickle.dump(le, f)

    print(f"Model trained and saved to {model_path}")
    print(f"Label encoder saved to {le_path}")

if __name__ == "__main__":
    train_model()
