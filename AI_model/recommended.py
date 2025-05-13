import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MultiLabelBinarizer, MinMaxScaler
import json
import sys
import os
# Tìm đường dẫn tuyệt đối đến thư mục hiện tại của script
script_dir = os.path.dirname(os.path.realpath(__file__))

# Đọc file bookss.json từ thư mục 'data' (cùng thư mục với script Python)
books_file_path = os.path.join(script_dir, 'data', 'bookss.json')
historys_file_path = os.path.join(script_dir, 'data', 'history.json')
with open(books_file_path, 'r', encoding='utf-8') as f:
    books = json.load(f)

with open(historys_file_path, "r", encoding="utf-8") as f:
    history = json.load(f)

# Mã hóa thể loại
all_genres = [book["genres"] for book in books]
mlb = MultiLabelBinarizer()
genre_features = mlb.fit_transform(all_genres)

# Mã hóa tác giả (tạo mapping author -> index)
authors = list({book["author"]["_id"] for book in books})
author_index = {aid: i for i, aid in enumerate(authors)}

# Chuyển sách thành vector đặc trưng
def book_to_vector(book, genre_vec):
    author_vec = np.zeros(len(authors))
    author_id = book["author"]["_id"]
    author_vec[author_index[author_id]] = 1

    rating = book.get("rating", 0) or 0
    rating = float(rating)
    
    return np.concatenate((genre_vec, author_vec, [rating]))

# Xây dựng ma trận đặc trưng cho tất cả sách
X = []
book_ids = []

for book, genre_vec in zip(books, genre_features):
    vec = book_to_vector(book, genre_vec)
    X.append(vec)
    book_ids.append(book["_id"])

X = np.array(X)
scaler = MinMaxScaler()
X = scaler.fit_transform(X)  # Chuẩn hóa các giá trị

# Bước 2: Gợi ý cho một user cụ thể
def get_user_read_books(user_id):
    # Lọc lịch sử đọc của user
    user_history = [entry for entry in history if entry["userId"] == user_id]
    read_book_ids = [entry["bookId"] for entry in user_history]
    return read_book_ids

def get_book_vector(book_id):
    # Lấy vector đặc trưng của sách từ ma trận X
    idx = book_ids.index(book_id)
    return X[idx]

def get_suggestions(user_id):
    # Lấy các sách mà user đã đọc
    read_book_ids = get_user_read_books(user_id)
    
    # Lấy vector trung bình của các sách đã đọc
    read_vectors = [get_book_vector(bid) for bid in read_book_ids]
    mean_vector = np.mean(read_vectors, axis=0).reshape(1, -1)

    # Tính cosine similarity giữa các sách và vector trung bình của user
    sims = cosine_similarity(X, mean_vector).flatten()

    # Lọc ra các sách chưa đọc
    suggestions = []
    for idx, sim in enumerate(sims):
        bid = book_ids[idx]
        if bid not in read_book_ids:  # Loại sách đã đọc
            suggestions.append((books[idx], sim))

    # Sắp xếp sách theo độ tương đồng giảm dần
    top_suggestions = sorted(suggestions, key=lambda x: -x[1])[:5]
    
    return top_suggestions

# Đọc user_id từ tham số truyền vào (dành cho Node.js)
user_id = sys.argv[1]  # Lấy user_id từ tham số dòng lệnh
suggestions = get_suggestions(user_id)

# Trả về kết quả gợi ý dưới dạng JSON
result = [{**book, "score": score} for book, score in suggestions]
print(json.dumps(result))  # In ra JSON kết quả
