import pandas as pd
import numpy as np
import json
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow import keras

# Load dữ liệu
with open('data/books.json', 'r') as f:
    books = json.load(f)

with open('data/history_reading.json', 'r') as f:
    history = json.load(f)

# Convert thành dataframe
books_df = pd.DataFrame(books)
history_df = pd.DataFrame(history)

# Merge data
df = history_df.merge(books_df, left_on='book_id', right_on='id')

# Encode dữ liệu
user_encoder = LabelEncoder()
book_encoder = LabelEncoder()
genre_encoder = LabelEncoder()

df['user'] = user_encoder.fit_transform(df['user_id'])
df['book'] = book_encoder.fit_transform(df['book_id'])
df['genre_encoded'] = genre_encoder.fit_transform(df['genre'])

# Input và output
X = df[['user', 'book', 'genre_encoded']].values
y = df['rating'].values

# Chia train/test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Model đơn giản
model = keras.Sequential([
    keras.layers.Dense(64, input_shape=(3,), activation='relu'),
    keras.layers.Dense(32, activation='relu'),
    keras.layers.Dense(1)  # output: rating
])

model.compile(optimizer='adam', loss='mse')

# Train model
model.fit(X_train, y_train, epochs=50, batch_size=8, validation_data=(X_test, y_test))

# Lưu model
os.makedirs('model', exist_ok=True)
model.save('model/recommend_model.h5')

print("✅ Train thành công và lưu model tại model/recommend_model.h5")
# Dự đoán tất cả các rating trên tập kiểm tra
predictions = model.predict(X_test)

# In ra tất cả các dự đoán cùng với người dùng, sách và rating thực tế
for i in range(len(predictions)):
    user_id = user_encoder.inverse_transform([X_test[i][0]])[0]
    book_id = book_encoder.inverse_transform([X_test[i][1]])[0]
    predicted_rating = predictions[i][0]
    actual_rating = y_test[i]

    # In ra thông tin
    print(f"User ID: {user_id}, Book ID: {book_id}, Predicted Rating: {predicted_rating:.2f}, Actual Rating: {actual_rating}")