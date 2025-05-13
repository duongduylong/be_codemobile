# import os
# import sys
# import json
# import pandas as pd
# import numpy as np
# import tensorflow as tf
# from tensorflow.keras import layers, Model
# from sklearn.preprocessing import LabelEncoder
# from tensorflow.keras.models import load_model
# import joblib  # để lưu encoder

# # Nhận userId từ tham số dòng lệnh
# user_id = sys.argv[1]

# # ======= DỮ LIỆU MẪU ========
# books = [
#     {"bookId": "book1", "title": "Bí mật của may mắn", "author": "Álex Rovira", "rating": 3.4, "views": 122},
#     {"bookId": "book2", "title": "Bí mật", "author": "Álex Rovira", "rating": 3.8, "views": 134},
#     {"bookId": "book3", "title": "Cuộc sống không giới hạn", "author": "Tony Robbins", "rating": 4.5, "views": 200},
#     {"bookId": "book4", "title": "Sức mạnh tiềm thức", "author": "Joseph Murphy", "rating": 4.2, "views": 250},
#     {"bookId": "book5", "title": "Chìa khóa thành công", "author": "John C. Maxwell", "rating": 4.7, "views": 300},
# ]

# user_history = [
#     {"userId": "67ffeabb742be33fe159e0be", "bookId": "book1"},
#     {"userId": "67ffeabb742be33fe159e0be", "bookId": "book2"},
#     {"userId": "user2", "bookId": "book3"},
#     {"userId": "user2", "bookId": "book4"},
#     {"userId": "user3", "bookId": "book2"},
#     {"userId": "user3", "bookId": "book5"},
# ]

# # ======= TIỀN XỬ LÝ ========
# books_df = pd.DataFrame(books)
# user_history_df = pd.DataFrame(user_history)

# # Load hoặc tạo encoder
# if os.path.exists("AI_model/user_encoder.pkl") and os.path.exists("AI_model/book_encoder.pkl"):
#     user_encoder = joblib.load("AI_model/user_encoder.pkl")
#     book_encoder = joblib.load("AI_model/book_encoder.pkl")
# else:
#     user_encoder = LabelEncoder()
#     book_encoder = LabelEncoder()
#     user_encoder.fit(user_history_df['userId'])
#     book_encoder.fit(user_history_df['bookId'])
#     joblib.dump(user_encoder, "AI_model/user_encoder.pkl")
#     joblib.dump(book_encoder, "AI_model/book_encoder.pkl")

# user_history_df['user'] = user_encoder.transform(user_history_df['userId'])
# user_history_df['book'] = book_encoder.transform(user_history_df['bookId'])

# num_users = user_history_df['user'].nunique()
# num_books = user_history_df['book'].nunique()
# embedding_dim = 50

# # ======= LOAD hoặc TRAIN MODEL ========
# model_path = "AI_model/model/recommendation_model.h5"
# if os.path.exists(model_path):
#     model = load_model(model_path)
# else:
#     user_input = layers.Input(shape=(1,), name='user')
#     book_input = layers.Input(shape=(1,), name='book')

#     user_embedding = layers.Embedding(input_dim=num_users, output_dim=embedding_dim)(user_input)
#     book_embedding = layers.Embedding(input_dim=num_books, output_dim=embedding_dim)(book_input)

#     user_vec = layers.Flatten()(user_embedding)
#     book_vec = layers.Flatten()(book_embedding)

#     concat = layers.Concatenate()([user_vec, book_vec])
#     dense = layers.Dense(128, activation='relu')(concat)
#     output = layers.Dense(1, activation='sigmoid')(dense)

#     model = Model(inputs=[user_input, book_input], outputs=output)
#     model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

#     X = [np.array(user_history_df['user']), np.array(user_history_df['book'])]
#     y = np.array([1] * len(user_history_df))

#     model.fit(X, y, epochs=5, batch_size=64, validation_split=0.1, verbose=0)

#     # Lưu model sau khi huấn luyện
#     model.save(model_path)

# # ======= GỢI Ý SÁCH ========
# if user_id not in user_encoder.classes_:
#     print(json.dumps({"error": "User not found"}))
#     sys.exit()

# encoded_user_id = user_encoder.transform([user_id])[0]

# read_books = set(user_history_df[user_history_df['userId'] == user_id]['bookId'])
# read_books_encoded = set(book_encoder.transform(list(read_books)))

# predictions = []
# for book_id_encoded in range(num_books):
#     if book_id_encoded in read_books_encoded:
#         continue
#     pred = model.predict([np.array([encoded_user_id]), np.array([book_id_encoded])], verbose=0)
#     predictions.append((book_id_encoded, pred[0][0]))

# predictions = sorted(predictions, key=lambda x: x[1], reverse=True)
# recommended_books = predictions[:5]

# result = [
#     {
#         'bookId': book_encoder.inverse_transform([book_id])[0],
#         'predicted_score': float(score)
#     } for book_id, score in recommended_books
# ]

# print(json.dumps(result))
import os
import sys
import json
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, Model
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.models import load_model
import joblib  # để lưu encoder

# Nhận userId từ tham số dòng lệnh
user_id = sys.argv[1]

# ======= DỮ LIỆU MẪU ========
books = [
    {
        "bookId": "67ffeae8742be33fe159e0c5",
        "title": "Bí mật của may mắn",
        "author": "Álex Rovira",
        "genres": [
            "Kỹ năng sống",
            "Triết lí"
        ],
        "description": "Một câu chuyện ngụ ngôn sâu sắc về cơ hội và sự chuẩn bị.",
        "coverImage": "http://192.168.1.152:9000/book-files/67ffeae8742be33fe159e0c5/sach1.jpg",
        "rating": 3.4,
        "views": 122
    },
    {
        "bookId": "67fff6aa65ff9e567d9095c4",
        "title": "Bí mật ",
        "author": "Álex Rovirassss",
        "genres": [
            "Kỹ năng sống",
            "Triết lí"
        ],
        "description": "Một câu chuyện ngụ ngôn sâu sắc về cơ hội và sự chuẩn bị.",
        "coverImage": "http://192.168.1.152:9000/book-files/67ffeae8742be33fe159e0c5/sach1.jpg",
        "rating": 3.8,
        "views": 134
    },
    {
        "bookId": "6807da4427ab5af4145fd46c",
        "title": "ABCABC ",
        "author": "ABCs",
        "genres": [
            "Kỹ năng sống",
            "Triết lí"
        ],
        "description": "Một câu chuyện ngụ ngôn sâu sắc về cơ hội và sự chuẩn bị.",
        "coverImage": "http://192.168.1.152:9000/book-files/67ffeae8742be33fe159e0c5/sach1.jpg",
        "rating": 0,
        "views": 0
    },
    {
        "bookId": "6807dafe27ab5af4145fd484",
        "title": "ddddddddddddd",
        "author": "Duong Duy Long",
        "genres": [
            "Kỹ năng sống",
            "Triết lí"
        ],
        "description": "Một câu chuyện ngụ ngôn sâu sắc về cơ hội và sự chuẩn bị.",
        "coverImage": "http://192.168.1.152:9000/book-files/67ffeae8742be33fe159e0c5/sach1.jpg",
        "rating": 0,
        "views": 0
    },
    {
        "bookId": "680d3f8d7e77e222193557da",
        "title": "ee",
        "author":"Duong Duy Long",
        "genres": [
            "Kỹ năng sống",
            "Triết lí"
        ],
        "description": "Một câu chuyện ngụ ngôn sâu sắc về cơ hội và sự chuẩn bị.",
        "coverImage": "http://192.168.1.152:9000/book-files/67ffeae8742be33fe159e0c5/sach1.jpg",
        "rating": 0,
        "views": 0
    },
    {
        "bookId": "680d3f917e77e222193557dc",
        "title": "eeeeee",
        "author":"Duong Duy Long",
        "genres": [
            "Kỹ năng sống",
            "Triết lí"
        ],
        "description": "Một câu chuyện ngụ ngôn sâu sắc về cơ hội và sự chuẩn bị.",
        "coverImage": "http://192.168.1.152:9000/book-files/67ffeae8742be33fe159e0c5/sach1.jpg",
        "rating": 0,
        "views": 0
    },
    {
        "bookId": "680d3f957e77e222193557de",
        "title": "eeeeeeeeeeee",
        "author":"Duong Duy Long",
        "genres": [
            "Kỹ năng sống",
            "Triết lí"
        ],
        "description": "Một câu chuyện ngụ ngôn sâu sắc về cơ hội và sự chuẩn bị.",
        "coverImage": "http://192.168.1.152:9000/book-files/67ffeae8742be33fe159e0c5/sach1.jpg",
        "rating": 5,
        "views": 0
    },
    {
        "bookId": "680fa78f842c3ac158c8e8f1",
        "title": "Truyện ma",
        "author": "Duong Duy Long",
        "genres": [
            "Kinh dị"
        ],
        "description": "Một câu chuyện ngụ ngôn sâu sắc về cơ hội và sự chuẩn bị.",
        "coverImage": "http://192.168.1.152:9000/book-files/67ffeae8742be33fe159e0c5/sach1.jpg",
        "rating": 0,
        "views": 0
    },
    {
        "bookId": "680fa7a0842c3ac158c8e8f3",
        "title": "Truyện tình cảm",
        "author":"Duong Duy Long",
        "genres": [
            "Tình cảm"
        ],
        "description": "Một câu chuyện ngụ ngôn sâu sắc về cơ hội và sự chuẩn bị.",
        "coverImage": "http://192.168.1.152:9000/book-files/67ffeae8742be33fe159e0c5/sach1.jpg",
        "rating": 0,
        "views": 0
    }
]

user_history = [
    {
        "userId": "67ffeabb742be33fe159e0be",
        "bookId": "67ffeae8742be33fe159e0c5"
    },
    {
        "userId": "67ffeabb742be33fe159e0be",
        "bookId": "67fff6aa65ff9e567d9095c4"
    },
    {
        "userId": "67ffeac2742be33fe159e0c1",
        "bookId": "6807da4427ab5af4145fd46c"
    },
    {
        "userId": "67ffeac2742be33fe159e0c1",
        "bookId": "6807dafe27ab5af4145fd484"
    },
    {
        "userId": "680785e1ace01675f7971c3b",
        "bookId": "680d3f8d7e77e222193557da"
    },
    {
        "userId": "680785e1ace01675f7971c3b",
        "bookId": "680d3f917e77e222193557dc"
    },
    {
        "userId": "68079119bd80dc8d09b0ef1b",
        "bookId": "680d3f957e77e222193557de"
    },
    {
        "userId": "68079119bd80dc8d09b0ef1b",
        "bookId": "680fa78f842c3ac158c8e8f1"
    }
]

# ======= TIỀN XỬ LÝ ========
books_df = pd.DataFrame(books)
user_history_df = pd.DataFrame(user_history)

# Load hoặc tạo encoder
if os.path.exists("AI_model/user_encoder.pkl") and os.path.exists("AI_model/book_encoder.pkl"):
    user_encoder = joblib.load("AI_model/user_encoder.pkl")
    book_encoder = joblib.load("AI_model/book_encoder.pkl")
else:
    user_encoder = LabelEncoder()
    book_encoder = LabelEncoder()
    user_encoder.fit(user_history_df['userId'])
    book_encoder.fit(user_history_df['bookId'])
    joblib.dump(user_encoder, "AI_model/user_encoder.pkl")
    joblib.dump(book_encoder, "AI_model/book_encoder.pkl")

user_history_df['user'] = user_encoder.transform(user_history_df['userId'])
user_history_df['book'] = book_encoder.transform(user_history_df['bookId'])

num_users = user_history_df['user'].nunique()
num_books = user_history_df['book'].nunique()
embedding_dim = 50

# ======= LOAD hoặc TRAIN MODEL ========
model_path = "AI_model/model/recommendation_model.h5"
if os.path.exists(model_path):
    model = load_model(model_path)
else:
    user_input = layers.Input(shape=(1,), name='user')
    book_input = layers.Input(shape=(1,), name='book')

    user_embedding = layers.Embedding(input_dim=num_users, output_dim=embedding_dim)(user_input)
    book_embedding = layers.Embedding(input_dim=num_books, output_dim=embedding_dim)(book_input)

    user_vec = layers.Flatten()(user_embedding)
    book_vec = layers.Flatten()(book_embedding)

    concat = layers.Concatenate()([user_vec, book_vec])
    dense = layers.Dense(128, activation='relu')(concat)
    output = layers.Dense(1, activation='sigmoid')(dense)

    model = Model(inputs=[user_input, book_input], outputs=output)
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

    X = [np.array(user_history_df['user']), np.array(user_history_df['book'])]
    y = np.array([1] * len(user_history_df))

    model.fit(X, y, epochs=5, batch_size=64, validation_split=0.1, verbose=0)

    # Lưu model sau khi huấn luyện
    model.save(model_path)

# ======= GỢI Ý SÁCH ========
if user_id not in user_encoder.classes_:
    print(json.dumps({"error": "User not found"}))
    sys.exit()

encoded_user_id = user_encoder.transform([user_id])[0]

read_books = set(user_history_df[user_history_df['userId'] == user_id]['bookId'])
read_books_encoded = set(book_encoder.transform(list(read_books)))

predictions = []
for book_id_encoded in range(num_books):
    if book_id_encoded in read_books_encoded:
        continue
    pred = model.predict([np.array([encoded_user_id]), np.array([book_id_encoded])], verbose=0)
    predictions.append((book_id_encoded, pred[0][0]))

predictions = sorted(predictions, key=lambda x: x[1], reverse=True)
recommended_books = predictions[:4]

# result = [
#     {
#         'bookId': book_encoder.inverse_transform([book_id])[0],
#         'predicted_score': float(score)
#     } for book_id, score in recommended_books
# ]
result = []

for encoded_book_id, score in recommended_books:
    book_id = book_encoder.inverse_transform([encoded_book_id])[0]
    
    # Tìm thông tin sách gốc
    book_info = books_df[books_df['bookId'] == book_id]
    
    if not book_info.empty:
        book_data = book_info.iloc[0].to_dict()  # Lấy hàng đầu tiên (vì lọc theo bookId thì chỉ có 1)
        book_data['predicted_score'] = float(score)  # Thêm điểm dự đoán vào
        result.append(book_data)

print(json.dumps(result))
