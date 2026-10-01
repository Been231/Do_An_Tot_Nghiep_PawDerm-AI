# 🐾 PawDerm AI - Hệ Thống Hỗ Trợ Chẩn Đoán Bệnh Da Liễu & Đề Xuất Dịch Vụ Y Tế Thú Cưng

> **Đồ án Tốt nghiệp Chuyên ngành Công nghệ Thông tin / Trí tuệ Nhân tạo**  
> Ứng dụng mô hình Deep Learning trong phân tích hình ảnh tổn thương da liễu ở chó mèo và kết nối dịch vụ chăm sóc y tế chuyên khoa.

---

## 📌 1. Giới thiệu Đề tài

Bệnh lý da liễu (nhiễm nấm da Ringworm, ghẻ Demodex, viêm da dị ứng, bội nhiễm vi khuẩn...) là nhóm bệnh phổ biến hàng đầu ở thú cưng nhưng thường khó phân biệt trong giai đoạn đầu. Đặc biệt, một số chứng bệnh như vi nấm có nguy cơ lây nhiễm sang người (Zoonosis).

**PawDerm AI** được xây dựng nhằm:
1. **Phát hiện sớm**: Ứng dụng thị giác máy tính và học sâu (Deep Learning) để phân loại nhanh các dạng tổn thương da qua ảnh chụp thực tế hoặc camera trực tiếp.
2. **Hướng dẫn y khoa**: Cung cấp phác đồ sơ cứu an toàn tại nhà, nhận diện các dấu hiệu nguy cấp cần đưa đến bệnh viện thú y.
3. **Kết nối dịch vụ**: Đề xuất các gói dịch vụ phòng khám phù hợp (soi tươi vi nấm, tắm trị liệu chuyên sâu, kê đơn điều trị).
4. **Active Learning & Retrain**: Hệ sinh thái kết nối Bác sĩ thẩm định, dán nhãn lại (Re-labeling) phục vụ tinh chỉnh mô hình AI liên tục.

---

## 📂 2. Cấu trúc Thư mục Đồ án (Frontend / Backend Clean Architecture)

Hệ thống được tổ chức phân tầng rõ ràng giữa **Client-side (Frontend)** và **Server-side (Backend)** theo chuẩn công nghiệp:

```text
Do_An_Tot_Nghiep_NNT/
│
├── frontend/                     # [FRONTEND] Ứng dụng Web Single Page App (React 18 + Vite)
│   ├── public/                   # Favicon & Vector SVG icons
│   ├── src/
│   │   ├── assets/               # Hình ảnh minh họa & biểu tượng
│   │   ├── components/           # 3 phân hệ Portal & Giao diện Auth
│   │   │   ├── CustomerPortal.jsx   # Cổng Chủ nuôi (Thú cưng, khám AI, timeline bệnh)
│   │   │   ├── DoctorPortal.jsx     # Cổng Bác sĩ (Thẩm định ca bệnh, Re-labeling Active Learning)
│   │   │   ├── AdminPortal.jsx      # Cổng Quản trị (Dashboard, Quản lý User, Export Retrain)
│   │   │   └── AuthSlider.jsx       # Giao diện Đăng nhập / Đăng ký trượt 60fps
│   │   ├── services/
│   │   │   └── api.js            # API Gateway kết nối Backend FastAPI
│   │   ├── styles/               # CSS modules & Keyframe animations
│   │   ├── App.jsx               # Điều phối các Portal theo vai trò (Role-based)
│   │   ├── main.jsx              # Entrypoint React
│   │   └── supabaseClient.js     # Fallback Supabase Client phía Frontend
│   ├── .env                      # Cấu hình API URL & Supabase Key Frontend
│   ├── package.json              # Khai báo thư viện phụ thuộc npm
│   └── vite.config.js            # Cấu hình Vite bundler
│
├── backend/                      # [BACKEND] Hệ thống REST API Gateway & Lõi AI (FastAPI)
│   ├── app/                      # Toàn bộ mã nguồn nghiệp vụ Backend
│   │   ├── core/
│   │   │   └── config.py         # Cấu hình hệ thống, đường dẫn lưu trữ, hằng số lâm sàng
│   │   ├── database/
│   │   │   ├── supabase_client.py   # Singleton kết nối Supabase Client
│   │   │   └── supabase_service.py  # Data Access Layer & Business CRUD (Khách hàng, Bác sĩ, Admin)
│   │   ├── services/
│   │   │   └── ai_inference.py   # Lõi suy luận AI (YOLOv8 Hook & Mock Heuristic lâm sàng)
│   │   └── data/
│   │       ├── disease_kb.py     # Từ điển tri thức bệnh học da liễu chó mèo chuẩn y khoa
│   │       └── sample_history.py # Dữ liệu khởi tạo mẫu
│   ├── database/                 # Toàn bộ tệp thiết kế CSDL (PostgreSQL / Supabase)
│   │   └── schema.sql            # Schema cơ sở dữ liệu V2 hoàn chỉnh (3 phân hệ + Tự động tắt RLS)
│   ├── scripts/                  # Kịch bản dòng lệnh quản trị & kiểm thử
│   │   ├── test_db_connection.py # Kiểm tra kết nối CSDL Supabase
│   │   └── seed_data.py          # Nạp tài khoản & dữ liệu mẫu khởi đầu
│   ├── main.py                   # Điểm khởi chạy FastAPI chính (Chạy tại: http://127.0.0.1:8000)
│   ├── requirements.txt          # Danh sách thư viện Python Backend
│   └── .env                      # Biến môi trường Backend (SUPABASE_URL, API_KEY)
│
├── streamlit_app/                # [DEMO PHỤ] Phiên bản giao diện demo Python thuần (Streamlit)
│   ├── auth/                     # Phân hệ đăng nhập / đăng ký Streamlit
│   ├── components/               # Giao diện khám bệnh, hồ sơ thú cưng, lịch sử
│   ├── services/                 # Services riêng của Streamlit
│   ├── .streamlit/               # Cấu hình theme sáng be sữa Streamlit
│   ├── config.py                 # Cấu hình CSS riêng cho Streamlit
│   └── app.py                    # Điểm khởi chạy: streamlit run streamlit_app/app.py
│
├── dataset/                      # [DATASET] Tập dữ liệu ảnh bệnh da liễu chó mèo (Train, Valid, Test)
├── uploads/                      # [STORAGE] Thư mục lưu ảnh người dùng tải lên
├── .gitignore                    # Bộ lọc tệp cho Git
└── requirements.txt              # File cài đặt thư viện Python ở thư mục gốc
```

---

## 🚀 3. Hướng dẫn Cài đặt & Khởi chạy

### Bước 1: Kích hoạt môi trường Python & Cài đặt thư viện
Yêu cầu Python phiên bản `>= 3.9`.
```bash
pip install -r requirements.txt
```

### Bước 2: Kiểm tra kết nối Cơ sở dữ liệu Supabase
```bash
python backend/scripts/test_db_connection.py
```

*(Tùy chọn) Nạp dữ liệu mẫu ban đầu:*
```bash
python backend/scripts/seed_data.py
```

---

### Bước 3: Khởi chạy Hệ thống

#### Cách 1: Khởi chạy Phiên bản Web Hiện đại (React + Vite + FastAPI) — *Khuyến nghị bảo vệ ĐATN*

**Cửa sổ Terminal 1 (Khởi động Backend FastAPI):**
```bash
cd backend
python main.py
```
*(Backend chạy tại: `http://127.0.0.1:8000` — Tài liệu API tương tác Swagger tại: `http://127.0.0.1:8000/docs`)*

**Cửa sổ Terminal 2 (Khởi động Frontend React):**
```bash
cd frontend
npm install   # (chỉ cần chạy lần đầu tiên)
npm run dev
```
*(Giao diện Web truy cập tại: `http://localhost:5173`)*

---

#### Cách 2: Khởi chạy Phiên bản Streamlit (Demo Python thuần)
```bash
streamlit run streamlit_app/app.py
```
*(Giao diện Streamlit truy cập tại: `http://localhost:8501`)*

---

## 🔑 4. Tài khoản Thử nghiệm Đồ Án (3 Phân Hệ)

| Vai trò | Tên đăng nhập | Mật khẩu | Chức năng nổi bật |
| :--- | :--- | :--- | :--- |
| **Khách hàng (Chủ nuôi)** | `khachhang` | `123` | Quản lý thú cưng, chẩn đoán bệnh AI, xem phác đồ sơ cứu & timeline hồi phục qua các ngày |
| **Bác sĩ thú y (Doctor)** | `bacsi` | `123` | Thẩm định ẩn danh hồ sơ bệnh án AI, dán nhãn sửa sai (Re-labeling Active Learning) |
| **Quản trị viên (Admin)** | `admin` | `123` | Thống kê Dashboard, quản lý người dùng, từ điển bệnh học, xuất Retrain Dataset Manifest |

---

## 🩺 5. Lưu ý Y khoa (Medical Disclaimer)
Kết quả từ hệ thống AI mang tính chất hỗ trợ chẩn đoán sơ bộ ban đầu giúp chủ nuôi phát hiện sớm nguy cơ. Chủ nuôi cần đưa thú cưng đến các phòng khám hoặc bệnh viện thú y uy tín để được xét nghiệm chuyên sâu và tiếp nhận phác đồ điều trị chính thức từ bác sĩ thú y.
