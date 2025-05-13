import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.neighbors import NearestNeighbors
from sklearn.metrics.pairwise import cosine_similarity

# Dữ liệu mẫu lớn
history_data = [
    {'user_id': 1, 'book_id': 1, 'rating': 5},
    {'user_id': 1, 'book_id': 2, 'rating': 4},
    {'user_id': 1, 'book_id': 5, 'rating': 3},
    {'user_id': 1, 'book_id': 6, 'rating': 4},
    {'user_id': 2, 'book_id': 1, 'rating': 4},
    {'user_id': 2, 'book_id': 2, 'rating': 5},
    {'user_id': 2, 'book_id': 7, 'rating': 4},
    {'user_id': 2, 'book_id': 8, 'rating': 5},
    {'user_id': 3, 'book_id': 3, 'rating': 5},
    {'user_id': 3, 'book_id': 4, 'rating': 4},
    {'user_id': 3, 'book_id': 9, 'rating': 4},
    {'user_id': 3, 'book_id': 10, 'rating': 5},
    {'user_id': 4, 'book_id': 5, 'rating': 5},
    {'user_id': 4, 'book_id': 6, 'rating': 5},
    {'user_id': 4, 'book_id': 11, 'rating': 4},
    {'user_id': 5, 'book_id': 7, 'rating': 5},
    {'user_id': 5, 'book_id': 8, 'rating': 4},
    {'user_id': 5, 'book_id': 12, 'rating': 3},
    {'user_id': 6, 'book_id': 9, 'rating': 5},
    {'user_id': 6, 'book_id': 10, 'rating': 4},
    {'user_id': 6, 'book_id': 13, 'rating': 5},
    {'user_id': 7, 'book_id': 14, 'rating': 5},
    {'user_id': 7, 'book_id': 15, 'rating': 4},
    {'user_id': 8, 'book_id': 16, 'rating': 5},
    {'user_id': 8, 'book_id': 17, 'rating': 4},
    {'user_id': 9, 'book_id': 18, 'rating': 5},
    {'user_id': 9, 'book_id': 19, 'rating': 4},
    {'user_id': 10, 'book_id': 20, 'rating': 5},
]

books_data = [
    {'id': 1, 'title': 'Book A', 'author': 'Author A', 'genre': 'Fiction'},
    {'id': 2, 'title': 'Book B', 'author': 'Author B', 'genre': 'Fiction'},
    {'id': 3, 'title': 'Book C', 'author': 'Author C', 'genre': 'Science'},
    {'id': 4, 'title': 'Book D', 'author': 'Author D', 'genre': 'Science'},
    {'id': 5, 'title': 'Book E', 'author': 'Author E', 'genre': 'Romance'},
    {'id': 6, 'title': 'Book F', 'author': 'Author F', 'genre': 'Romance'},
    {'id': 7, 'title': 'Book G', 'author': 'Author G', 'genre': 'Horror'},
    {'id': 8, 'title': 'Book H', 'author': 'Author H', 'genre': 'Horror'},
    {'id': 9, 'title': 'Book I', 'author': 'Author I', 'genre': 'Fantasy'},
    {'id': 10, 'title': 'Book J', 'author': 'Author J', 'genre': 'Fantasy'},
    {'id': 11, 'title': 'Book K', 'author': 'Author K', 'genre': 'History'},
    {'id': 12, 'title': 'Book L', 'author': 'Author L', 'genre': 'History'},
    {'id': 13, 'title': 'Book M', 'author': 'Author M', 'genre': 'Mystery'},
    {'id': 14, 'title': 'Book N', 'author': 'Author N', 'genre': 'Mystery'},
    {'id': 15, 'title': 'Book O', 'author': 'Author O', 'genre': 'Biography'},
    {'id': 16, 'title': 'Book P', 'author': 'Author P', 'genre': 'Biography'},
    {'id': 17, 'title': 'Book Q', 'author': 'Author Q', 'genre': 'Poetry'},
    {'id': 18, 'title': 'Book R', 'author': 'Author R', 'genre': 'Poetry'},
    {'id': 19, 'title': 'Book S', 'author': 'Author S', 'genre': 'Adventure'},
    {'id': 20, 'title': 'Book T', 'author': 'Author T', 'genre': 'Adventure'}
]


# DataFrame
history_df = pd.DataFrame(history_data)
books_df = pd.DataFrame(books_data)

# Encode
user_encoder = LabelEncoder()
book_encoder = LabelEncoder()
genre_encoder = LabelEncoder()

history_df['user_encoded'] = user_encoder.fit_transform(history_df['user_id'])
history_df['book_encoded'] = book_encoder.fit_transform(history_df['book_id'])
books_df['book_encoded'] = book_encoder.transform(books_df['id'])

# Interaction Matrix
interaction_matrix = history_df.pivot(index='user_encoded', columns='book_encoded', values='rating').fillna(0)

# Collaborative model
model = NearestNeighbors(n_neighbors=3, metric='cosine')
model.fit(interaction_matrix)

# Genre similarity matrix
books_df['genre_encoded'] = genre_encoder.fit_transform(books_df['genre'])
book_genre_matrix = books_df[['genre_encoded']].values
cos_sim = cosine_similarity(book_genre_matrix)

# ---- Recommend ----
all_users = interaction_matrix.index.tolist()

for user_id in all_users:
    print(f"\n⭐ Đề xuất cho User {user_encoder.inverse_transform([user_id])[0]}:")

    # Step 1: Collaborative Filtering
    user_vector = interaction_matrix.iloc[user_id].values.reshape(1, -1)
    distances, indices = model.kneighbors(user_vector)

    collab_scores = {}
    for idx, dist in zip(indices[0], distances[0]):
        if idx != user_id:
            similarity = 1 - dist  # cosine distance -> similarity
            similar_user_vector = interaction_matrix.iloc[idx]
            for book_idx, rating in enumerate(similar_user_vector):
                if rating > 0 and interaction_matrix.iloc[user_id, book_idx] == 0:
                    collab_scores[book_idx] = collab_scores.get(book_idx, 0) + similarity

    # Step 2: Content-Based Filtering
    content_scores = {}
    read_books_indices = history_df[history_df['user_encoded'] == user_id]['book_encoded'].tolist()

    for read_idx in read_books_indices:
        similar_books_idx = np.argsort(cos_sim[read_idx])[::-1]
        for sim_idx in similar_books_idx:
            if sim_idx != read_idx and interaction_matrix.iloc[user_id, sim_idx] == 0:
                score = cos_sim[read_idx, sim_idx]
                content_scores[sim_idx] = content_scores.get(sim_idx, 0) + score

    # Step 3: Merge Hybrid
    hybrid_scores = {}

    for book_idx in set(list(collab_scores.keys()) + list(content_scores.keys())):
        hybrid_scores[book_idx] = 0.6 * collab_scores.get(book_idx, 0) + 0.4 * content_scores.get(book_idx, 0)

    # Step 4: Rank và show kết quả
    sorted_books = sorted(hybrid_scores.items(), key=lambda x: x[1], reverse=True)

    if sorted_books:
        print("📚 Top gợi ý:")
        for book_idx, score in sorted_books[:5]:  # lấy top 5
            book_info = books_df[books_df['book_encoded'] == book_idx].iloc[0]
            print(f"  - {book_info['title']} (Genre: {book_info['genre']}) - Score: {score:.2f}")
    else:
        print("  Không có gợi ý.")
