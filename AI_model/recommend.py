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
        "_id": "682308dc60c78308be91103f",
        "title": "Tokyo hoàng đạo án",
        "author":"Soji Shimada",
        "genres": [
            "Trinh thám",
            "kinh dị"
        ],
        "description": "Tokyo hoàng đạo án là tiểu thuyết bí ẩn đầu tay của Shimada Soji, nhạc sĩ và nhà văn về chiêm tinh học, tác giả của hơn 100 tiểu thuyết bí ẩn. Bên cạnh là tiểu thuyết đầu tay và bán chạy nhất của Shimada, nó được đề cử Giải Edogawa Rampo danh giá dành cho tiểu thuyết bí ẩn",
        "coverImage": "http://172.20.10.2:9000/book-files/682308dc60c78308be91103f/Tokyo_hoang_dao_an.jpg",
        "rating": 5,
        "views": 22
    },
    {
        "_id": "6823137f60c78308be911185",
        "title": "Harry Potter",
        "author":"J. K. Rowling",
        "genres": [
            "Kỳ ảo"
        ],
        "description": "Harry James Potter là một nhân vật hư cấu và là nhân vật chính trong loạt tiểu thuyết cùng tên của J. K. Rowling.",
        "coverImage": "http://172.20.10.2:9000/book-files/67ffeae8742be33fe159e0c5/sach1.jpg",
        "rating": 0,
        "views": 17
    },
    {
        "_id": "6823190860c78308be911216",
        "title": "Chiếc Lồng Xương Thịt",
        "author": "Vĩ Ngư",
        "genres": [
            "Kinh dị"
        ],
        "description": "Nhục Cốt Phàn Lung (肉骨樊笼) là một thành ngữ Hán Việt có nghĩa là xương thịt như cũ mà bị giam cầm.Cụm từ này thường được dùng để miêu tả tình trạng người nào đó bị mắc kẹt trong một hoàn cảnh khổ sở, đau đớn, không thể thoát ra, dù tình trạng cơ thể bên ngoài không thay đổi nhiều. Trong một số trường hợp, nó cũng có thể ám chỉ sự giam cầm về tinh thần hay cảm xúc.",
        "coverImage": "http://172.20.10.2:9000/book-files/6823190860c78308be911216/chieclongxuongthit.jpg",
        "rating": 4,
        "views": 11
    },
    {
        "_id": "68235a1b4aced6ba087ada92",
        "title": "Hạt giống tâm hồn",
        "author": "Vĩ Ngư",
        "genres": [
            "Kỹ năng sống"
        ],
        "description": "Hạt Giống Tâm Hồn - Bản giao hưởng cuộc sống là ấn bản đặc biệt tuyển chọn những câu chuyện truyền cảm hứng hay nhất giúp ta có thêm sức mạnh, niềm tin và lòng dũng cảm.",
        "coverImage": "http://172.20.10.2:9000/book-files/68235a1b4aced6ba087ada92/hatgiongtamhon.jpeg",
        "rating": 0,
        "views": 1
    },
    {
        "_id": "68235d274aced6ba087adaa9",
        "title": "Cảnh sát đặc nhiệm Texas",
        "author": "Diana Palmer",
        "genres": [
            "Trinh thám"
        ],
        "description": "Một vụ phá án của đội cảnh sát đặc nhiệm Texas lồng trong câu chuyện tình của trung úy Marc Brannon và Josette Langley, nữ điều tra viên, hai nhân vật chính của truyện.Nhiều năm trước, những éo le trong hai vụ án có liên quan nhau đã khiến họ phải đứng trước tòa ở hai phía đối lập, điều đó cũng khiến cho mối tình của họ phải tan vỡ và danh tiết của Josette bị tổn hại nghiêm trọng. Những tưởng hai người sẽ không bao giờ gặp lại nhau nữa khi mỗi bên đều chuyển công tác và chỗ cư ngụ, nhưng số phận lần nữa lại đẩy đưa họ đối mặt với nhau. Lần này, là một vụ án rất phức tạp khiến họ phải luôn sát cánh bên nhau trong công việc. Và dẫu còn đầy tổn thương vì chuyện cũ, Josette vẫn không thể tự dối lòng rằng, trái tim cô vẫn chưa thể xóa đi hình bóng của con người phụ bạc ấy. Rằng, quá khứ sâu đậm ấy giờ đây đang lên tiếng...",
        "coverImage": "http://172.20.10.2:9000/book-files/68235d274aced6ba087adaa9/canhsatdacvu.jpg",
        "rating": 5,
        "views": 1
    },
    {
        "_id": "682360c14aced6ba087adabf",
        "title": "Ferdinand Magellan Là Ai?",
        "author":"Elizabeth Wolf",
        "genres": [
            "Khám phá"
        ],
        "description": "Thời niên thiếu Vào khoảng năm 1480, tại Bồ Đào Nha, cậu bé Ferdinand nhà Magellan cất tiếng khóc chào đời. Nhà Megellan thuộc dòng dõi quý tộc nhưng họ không giàu có gì, cũng chẳng có quyền lực.",
        "coverImage": "http://172.20.10.2:9000/book-files/682360c14aced6ba087adabf/ferdinand.jpg",
        "rating": 0,
        "views": 0
    },
    {
        "_id": "6823647f4aced6ba087adae1",
        "title": "Truyện ngắn A.P.Chekhov",
        "author": "Anton Chekhov",
        "genres": [
            "Hài hước"
        ],
        "description": "Thời niên thiếu Vào khoảng năm 1480, tại Bồ Đào Nha, cậu bé A.P.Chekhov nhà Magellan cất tiếng khóc chào đời. Nhà Megellan thuộc dòng dõi quý tộc nhưng họ không giàu có gì, cũng chẳng có quyền lực.",
        "coverImage": "http://172.20.10.2:9000/book-files/6823647f4aced6ba087adae1/apchekhov.jpg",
        "rating": 0,
        "views": 1
    },
    {
        "_id": "6823663e4aced6ba087adafa",
        "title": "Kính Vạn Hoa ",
        "author":"Nguyễn Nhật Ánh",
        "genres": [
            "Văn học"
        ],
        "description": "Tháng tư bao giờ cũng bắt đầu bằng những ngày oi bức khó chịu. Hằng năm, vào mùa này mọi cư dân trong thành phố thường trằn trọc khó ngủ. Dù nhà mở toang cửa sổ, suốt đêm cũng chỉ đón được dăm ba làn gió nhẹ thoảng qua và cứ đến gần sáng là mọi người thiếp đi trong giấc ngủ mê mệt",
        "coverImage": "http://172.20.10.2:9000/book-files/6823663e4aced6ba087adafa/kinhvanhoa.jpg",
        "rating": 0,
        "views": 0
    },
    {
        "_id": "682367b44aced6ba087adb11",
        "title": "Tôi thấy hoa vàng cỏ xanh",
        "author":"Nguyễn Nhật Ánh",
        "genres": [
            "Văn học"
        ],
        "description": "Chú Đàn tiếp tục kiểm tra từng ngón tay tôi, lần này chú cẩn thận hơn bao giờ hết. Cái không khí ngập tràn sự chăm chú và kỳ vọng, khiến tôi cảm thấy như mình đang tham gia vào một cuộc thám hiểm bí ẩn nào đó. Mỗi lần chú tìm thấy một cái hoa tay, nét mặt chú lại bừng sáng như phát hiện ra một kho báu.",
        "coverImage": "http://172.20.10.2:9000/book-files/682367b44aced6ba087adb11/Tôi_thấy_hoa_vàng_trên_cỏ_xanh.jpg",
        "rating": 0,
        "views": 0
    },
    {
        "_id": "6823693d4aced6ba087adb2a",
        "title": "Lũ Người Quỷ Ám",
        "author":"Fyodor Dostoevsky",
        "genres": [
            "Kinh dị"
        ],
        "description": "Trước khi mô tả những chuyện lạ lùng mới đây xảy ra trong cái tỉnh xưa nay vẫn vô sự của chúng tôi, tôi thấy phải lùi xa hơn nữa để cung cấp ít nhiều chi tiết về cuộc đời của con người đa tài và rất khả kính là ông Xtepan Trofimovitr Verkhovenxki. Điều này có thể xem như lời dẫn vào câu chuyện sắp tới.",
        "coverImage": "http://172.20.10.2:9000/book-files/6823693d4aced6ba087adb2a/lunguoiquyam.jpg",
        "rating": 1,
        "views": 5
    },
    {
        "_id": "68236a9b4aced6ba087adb43",
        "title": "Chiến Tranh Và Hòa Bình ",
        "author": "Lev Tolstoy",
        "genres": [
            "Văn học"
        ],
        "description": "Đấy công tước thấy chưa: Genes và Lucque nay chỉ còn là những thái ấp, những điền trang của dòng họ Buônapáctê mà thôi Này, tôi xin báo trước: hễ công tước còn cho rằng hiện nay chúng ta chưa ở trong tình trạng chiến tranh, hễ công tước còn dám bào chữ cho những hành động nhơ nhuốc và tàn bạo của tên Ma vương phản Cơ đốc ấy (quả tình tôi cũng tin rằng hắn chính là Ma vương.",
        "coverImage": "http://172.20.10.2:9000/book-files/68236a9b4aced6ba087adb43/chientranhhoabinh.jpg",
        "rating": 0,
        "views": 0
    },
    {
        "_id": "68236cb94aced6ba087adb5c",
        "title": "Danh Tướng Việt Nam",
        "author":"Nguyễn Khắc Thuần",
        "genres": [
            "Lịch sử"
        ],
        "description": "“Khi Lý Khắc Chính bắt được (Khúc) Thừa Mỹ, (Dương) Đình Nghệ bèn tìm cách đánh báo thù. Ông chiêu tập hào kiệt, dùng đại nghĩa để khuyến khích cùng hợp mưu để đánh đuổi tướng (Nam) Hán là Lý Khắc Chính. Vua (Nam) Hán sai Lý Tiến sang làm Thứ Sử Giao Châu (thay cho Lý Khắc Chính). Dương Đình Nghệ lại đem quân vây hãm Lý Tiến.",
        "coverImage": "http://172.20.10.2:9000/book-files/68236cb94aced6ba087adb5c/danhtuongvn.jpg",
        "rating": 0,
        "views": 0
    },
    {
        "_id": "68236e304aced6ba087adb75",
        "title": "Thế Giới Bình Thường ",
        "author": "Lộ Dao",
        "genres": [
            "Ngôn tình"
        ],
        "description": "Trong những ngày mưa tuyết thế này, nếu không có việc gì quan trọng, người ta thà ở trong nhà suốt cả ngày. Vì vậy, phố xá trong thị trấn cũng bớt ồn ào hơn thường lệ. Ở những nơi khuất bóng trong các con hẻm, lớp tuyết và băng còn sót lại của mùa đông đang dần tan chảy dưới những giọt mưa.",
        "coverImage": "http://172.20.10.2:9000/book-files/68236e304aced6ba087adb75/thegioibinhthuong.jpg",
        "rating": 0,
        "views": 3
    },
    {
        "_id": "68236fa14aced6ba087adb8e",
        "title": "Đất rừng phương Nam",
        "author": "Đoàn Giỏi",
        "genres": [
            "Văn học"
        ],
        "description": "Trong những ngày mưa tuyết thế này, nếu không có việc gì quan trọng, người ta thà ở trong nhà suốt cả ngày. Vì vậy, phố xá trong thị trấn cũng bớt ồn ào hơn thường lệ. Ở những nơi khuất bóng trong các con hẻm, lớp tuyết và băng còn sót lại của mùa đông đang dần tan chảy dưới những giọt mưa.",
        "coverImage": "http://172.20.10.2:9000/book-files/68236fa14aced6ba087adb8e/datrungphuongnam.jpg",
        "rating": 0,
        "views": 4
    },
    {
        "_id": "682371344aced6ba087adba7",
        "title": "Những Ngày Thơ Ấu",
        "author":"Nguyên Hồng",
        "genres": [
            "Văn học"
        ],
        "description": "Thầy tôi làm cai ngục. Mẹ tôi con một nhà buôn bán rau đậu, trầu cau lần hồi ở các chợ và trên đường sông Nam Định -Hải Phòng. Tuổi thầy tôi hơn ba mươi, gấp đôi tuổi mẹ tôi. Hai thân tôi lấy nhau không phải vì quen biết nhau lâu mà thương yêu nhau.",
        "coverImage": "http://172.20.10.2:9000/book-files/682371344aced6ba087adba7/nhungngaythoau.jpg",
        "rating": 3,
        "views": 5
    }
]

user_history = [
    {
        "userId": "68230e4860c78308be91104d",
        "bookId": "682308dc60c78308be91103f"
    },
    {
        "userId": "68230e4860c78308be91104d",
        "bookId": "6823137f60c78308be911185"
    },
    {
        "userId": "68230f5760c78308be91106d",
        "bookId": "682308dc60c78308be91103f"
    },
    {
        "userId": "68230f5760c78308be91106d",
        "bookId": "68235d274aced6ba087adaa9"
    },
    {
        "userId": "682374f8da83cd2f7ddd4a77",
        "bookId": "682371344aced6ba087adba7"
    },
    {
        "userId": "682374f8da83cd2f7ddd4a77",
        "bookId": "6823693d4aced6ba087adb2a"
    },
    {
        "userId": "682374f8da83cd2f7ddd4a77",
        "bookId": "6823190860c78308be911216"
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
embedding_dim = 50 # số chiều vector đặc trưng


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

result = []

for encoded_book_id, score in recommended_books:
    book_id = book_encoder.inverse_transform([encoded_book_id])[0]
    
    # Tìm thông tin sách gốc
    book_info = books_df[books_df['_id'] == book_id]
    
    if not book_info.empty:
        book_data = book_info.iloc[0].to_dict()  # Lấy hàng đầu tiên (vì lọc theo bookId thì chỉ có 1)
        book_data['predicted_score'] = float(score)  # Thêm điểm dự đoán vào
        result.append(book_data)

print(json.dumps(result))
