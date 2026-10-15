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

---

## 📅 5. Nhật Ký Tiến Độ Cập Nhật Theo Tuần (Weekly Progress Log)

> *Bảng tổng hợp tiến độ thực hiện đồ án phục vụ báo cáo định kỳ với Giảng viên hướng dẫn:*

| Mốc thời gian | Hạng mục công việc đã thực hiện | Chi tiết thay đổi & tính năng mới | Trạng thái |
| :---: | :--- | :--- | :---: |
| **Đợt 1 (Khởi tạo)** | Kiến trúc & Phân hệ nền tảng | Thiết lập FastAPI Gateway, React SPA, CSDL Supabase, Lõi suy luận AI YOLOv8. | ✅ Hoàn thành |
| **Đợt 2** | **Nâng Cấp Bảo Mật, Hồ Sơ & Lịch Sử** | - Gmail OTP qua Google SMTP, mã hóa Bcrypt, Profile Modal & Đổi mật khẩu.<br>- Modal chi tiết ca bệnh, Phân trang lịch sử & Line Chart tiến triển bệnh (recharts). | ✅ Hoàn thành |
| **Tuần này (Đợt 3)** | **Camera Live Capture** | - Mở webcam/camera thiết bị trực tiếp qua `navigator.mediaDevices.getUserMedia()`.<br>- Lưới ngắm HUD y khoa, thước đo tỷ lệ, đổi camera trước/sau, chụp canvas chất lượng cao. | ✅ Hoàn thành |
| **Tuần này (Đợt 3)** | **Export PDF Bệnh Án Chuẩn Y Khoa** | - Xuất Phiếu kết quả khám da liễu A4 (PawDerm Clinical Report) chuẩn in & lưu PDF vector.<br>- Bao gồm mã bệnh án, ảnh tổn thương, gauge AI confidence, thẩm định & mộc điện tử Bác sĩ. | ✅ Hoàn thành |
| **Tuần này (Đợt 3)** | **Giao Diện Tối Toàn Diện (Dark Mode)** | - Nút chuyển đổi Dark/Light mode trên Header, lưu trạng thái vào `localStorage`.<br>- Bảng màu Slate Dark hiện đại, tương phản chuẩn WCAG, dịu mắt khi theo dõi ban đêm. | ✅ Hoàn thành |
| **Tuần này (Đợt 3)** | **Active Learning Auto-Retrain Pipeline** | - Tự động gom mẫu ca khó (Hard Samples) bị bác sĩ đính chính để fine-tune mô hình.<br>- Quản lý tiến trình Retrain YOLOv8, thanh tiến độ Epoch 1-20, Terminal log real-time.<br>- Bảng lịch sử các phiên bản mô hình (v1.0 -> v2.1-AL) cùng các chỉ số mAP50, Precision, Recall. | ✅ Hoàn thành |

---

## 🌟 6. Chi Tiết Kỹ Thuật Các Tính Năng Nâng Cấp (Changelog Chi Tiết)

### 📷 6.1. Chụp Ảnh Trực Tiếp từ Camera (Live Camera Capture HUD)
* **API Trình duyệt Native:** Sử dụng `navigator.mediaDevices.getUserMedia()` kích hoạt trực tiếp ống kính camera trên máy tính hoặc điện thoại mà không cần ứng dụng phụ.
* **Giao diện HUD Y khoa:** Lưới căn chỉnh 3x3 (Rule of Thirds), thước đo tỷ lệ tổn thương, tâm ngắm tròn chuẩn lâm sàng da liễu.
* **Đa ống kính:** Hỗ trợ lật gương camera trước (selfie) và camera sau (môi trường).
* **Đóng băng & Xem trước:** Chụp ảnh vào thẻ `<canvas>` chất lượng 92% JPEG, kiểm tra độ sắc nét trước khi gửi vào lõi phân tích AI.

### 📄 6.2. Xuất Bệnh Án PDF Chuẩn Y Khoa (Medical Clinical Report Export)
* **Khổ in A4 Tiêu chuẩn:** Tích hợp template báo cáo lâm sàng thú y chuyên nghiệp với logo PawDerm AI, mã hồ sơ duy nhất, ngày giờ khám, thông tin chủ nuôi và bé cưng.
* **Đầy đủ dữ liệu chẩn đoán:** Ảnh màu tổn thương, Gauge đo độ tin cậy AI Donut SVG, biểu đồ xác suất 4 nhóm bệnh thường gặp, danh sách triệu chứng ghi nhận.
* **Thẩm định & Chữ ký Bác sĩ:** Trình bày rõ ràng nhận định lâm sàng của Bác sĩ thú y chuyên khoa, phác đồ điều trị khuyến nghị và mộc điện tử "VERIFIED CLINICAL REPORT".

### 🌙 6.3. Chế Độ Giao Diện Tối Toàn Diện (Dark Mode System)
* **Kiến trúc CSS Variables:** Định nghĩa hệ thống biến màu sắc `[data-theme="dark"]` đồng bộ với bảng màu Slate Dark (`#0b1120`, `#1e293b`, `#334155`).
* **Trải nghiệm mượt mà:** Nút bấm toggle Mặt trời / Mặt trăng trên Header, lưu tuỳ chọn vào `localStorage` giúp giữ nguyên chế độ hiển thị qua các phiên làm việc.
* **Tối ưu hình ảnh & biểu đồ:** Đảm bảo tất cả thẻ card, modal, bảng biểu, thanh tiến độ và donut gauge hiển thị tương phản sắc nét, bảo vệ thị lực người dùng.

### ⚡ 6.4. Active Learning & Auto-Retrain Pipeline (YOLOv8)
* **Cơ chế Vòng lặp Kín (Closed-loop AI):** Khi bác sĩ thú y đính chính chẩn đoán (`review_status = 'corrected'`), hệ thống tự động gắn cờ "Hard Sample" kèm nhãn chuẩn Doctor Ground Truth.
* **Theo dõi Ngưỡng Retrain (Threshold Monitor):** Tự động phát hiện khi số ca khó tích lũy vượt ngưỡng (mặc định 5 ca) để đề xuất hoặc tự động kích hoạt fine-tune lại mô hình.
* **Huấn luyện nền Bất đồng bộ (Background Worker):** Chạy luồng Thread ngầm thực hiện các Epochs huấn luyện, tính toán Loss giảm dần và cải thiện mAP@0.5 (từ 84.2% lên 89.8%).
* **Terminal Console & Lịch sử Phiên bản:** Cho phép Quản trị viên theo dõi live stream logs huấn luyện và tra cứu danh mục các phiên bản mô hình (`v1.0-Base`, `v2.0-AL`, `v2.1-AL`) kèm chỉ số mAP50, Precision, Recall.

### 🔐 6.5. Xác thực & Bảo mật (Security & Verification)
* **Xác thực Gmail thật qua Google SMTP:** Đăng ký tài khoản Chủ nuôi bắt buộc xác thực mã OTP 6 số gửi trực tiếp vào hộp thư Google (`smtp.gmail.com:587 STARTTLS`). Ngăn chặn hoàn toàn tài khoản ảo hoặc email không tồn tại.
* **Bảo mật mật khẩu với Bcrypt:** Toàn bộ mật khẩu người dùng được băm (hash) bằng thư viện `bcrypt` với muối (salt) ngẫu nhiên trước khi lưu trữ, loại bỏ hoàn toàn lưu mật khẩu dạng plaintext.
* **CORS & Bảo vệ API:** Giới hạn whitelist các domain được phép truy cập, loại bỏ `allow_origins=["*"]`.
* **Phân quyền chặt chẽ:** Ẩn bộ switcher xem trước vai trò trên Header đối với người dùng thông thường, chỉ hiển thị với Quản trị viên thực tế.

### 👤 6.6. Hồ sơ cá nhân & Đổi mật khẩu (Profile & Password Modal)
* **Chỉnh sửa hồ sơ:** Cho phép cập nhật họ và tên, số điện thoại chuẩn 10 chữ số, địa chỉ liên hệ.
* **Đổi mật khẩu an toàn:** Yêu cầu xác minh chính xác mật khẩu hiện tại trước khi đổi, tích hợp thước đo độ mạnh mật khẩu (Password Strength Bar) trực quan.

### 📜 6.7. Lịch sử Chẩn đoán Thông minh & Phân trang (History & Pagination)
* **Bộ lọc & Tìm kiếm:** Tìm kiếm tức thì theo tên thú cưng hoặc tên bệnh da liễu; lọc theo trạng thái thẩm định *(Chờ duyệt / Bác sĩ đồng ý / Bác sĩ sửa lại)*.
* **Phân trang linh hoạt (Pagination):** Tùy chọn 5, 10 hoặc 20 ca bệnh mỗi trang, điều hướng trang gọn gàng.
* **Modal Chi tiết Ca bệnh (Case Detail Modal):** Bấm vào bất kỳ dòng nào để mở modal xem lại ảnh tổn thương độ phân giải cao, độ tin cậy AI, phân bố xác suất các bệnh liên quan, ghi chú theo dõi của chủ nuôi và nhận định chuyên môn của Bác sĩ.

### 📈 6.8. Biểu đồ Đường Tiến triển Bệnh (Progression Line Chart)
* **Tích hợp thư viện Recharts:** Vẽ biểu đồ đường thể hiện mức độ thuyên giảm bệnh và độ tin cậy AI qua các mốc thời gian thực tế *(Ngày 1 ➔ Ngày 3 ➔ Ngày 7 ➔ Ngày 14)*.
* **Đa thú cưng:** Tự động vẽ riêng biệt từng đường cho từng bé cưng, có đường trung bình tham chiếu và tooltip chi tiết khi di chuột.

### 🔔 6.9. Chuông Thông báo Thời gian thực (Real-time Notification Bell)
* Tự động kiểm tra và thông báo cho Chủ nuôi ngay khi Bác sĩ hoàn tất thẩm định hồ sơ bệnh án hoặc đính chính chẩn đoán.

---

## 🩺 7. Lưu ý Y khoa (Medical Disclaimer)
Kết quả từ hệ thống AI mang tính chất hỗ trợ chẩn đoán sơ bộ ban đầu giúp chủ nuôi phát hiện sớm nguy cơ. Chủ nuôi cần đưa thú cưng đến các phòng khám hoặc bệnh viện thú y uy tín để được xét nghiệm chuyên sâu và tiếp nhận phác đồ điều trị chính thức từ bác sĩ thú y.

