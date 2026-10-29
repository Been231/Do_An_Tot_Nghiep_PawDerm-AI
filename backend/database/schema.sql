-- ============================================================
-- PawDerm AI — Supabase Database Schema V2 (Nâng cấp toàn diện)
-- Hỗ trợ 3 phân hệ: Khách hàng, Bác sĩ thú y, Quản trị viên (Admin)
-- Chạy toàn bộ script này trong: Supabase Dashboard → SQL Editor → New query
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. CẬP NHẬT HOẶC TẠO BẢNG users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username        TEXT NOT NULL UNIQUE,
    password        TEXT NOT NULL,           -- lưu plaintext cho MVP/đồ án
    full_name       TEXT NOT NULL DEFAULT '',
    phone           TEXT NOT NULL DEFAULT '',
    email           TEXT DEFAULT '',
    address         TEXT DEFAULT '',
    role            TEXT NOT NULL DEFAULT 'customer', -- 'customer' | 'doctor' | 'admin'
    status          TEXT NOT NULL DEFAULT 'active',   -- 'active' | 'locked' | 'pending_approval'
    specialty       TEXT DEFAULT '',                  -- Chuyên môn bác sĩ
    clinic_name     TEXT DEFAULT '',                  -- Tên phòng khám/bệnh viện bác sĩ công tác
    certificate_url TEXT DEFAULT '',                  -- Chứng chỉ hành nghề nếu có
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Thêm các cột nếu bảng users đã tồn tại từ trước
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE public.users ADD COLUMN role TEXT NOT NULL DEFAULT 'customer';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='status') THEN
        ALTER TABLE public.users ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='specialty') THEN
        ALTER TABLE public.users ADD COLUMN specialty TEXT DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='clinic_name') THEN
        ALTER TABLE public.users ADD COLUMN clinic_name TEXT DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='certificate_url') THEN
        ALTER TABLE public.users ADD COLUMN certificate_url TEXT DEFAULT '';
    END IF;
END $$;

-- ============================================================
-- 2. TẠO TÀI KHOẢN MẪU CHO 3 VAI TRÒ
-- ============================================================
-- Tài khoản 1: Khách hàng (Chủ nuôi thú cưng)
INSERT INTO public.users (username, password, full_name, phone, email, address, role, status)
VALUES (
    'khachhang',
    '123',
    'Nguyễn Văn Khách',
    '0901234567',
    'khachhang@pawderm.vn',
    '123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh',
    'customer',
    'active'
)
ON CONFLICT (username) DO UPDATE SET
    role = 'customer',
    status = 'active';

-- Tài khoản 2: Bác sĩ thú y (Chuyên gia)
INSERT INTO public.users (username, password, full_name, phone, email, address, role, status, specialty, clinic_name)
VALUES (
    'bacsi',
    '123',
    'BS. CKII Nguyễn Thị Mai Hương',
    '0918889999',
    'bs.maihuong@pawderm.vn',
    'Bệnh viện Thú Y Sài Gòn Pet Hospital',
    'doctor',
    'active',
    'Chuyên khoa Da liễu & Ký sinh trùng thú nhỏ',
    'Bệnh viện Thú Y PawCare TP. Hồ Chí Minh'
)
ON CONFLICT (username) DO UPDATE SET
    role = 'doctor',
    status = 'active',
    specialty = 'Chuyên khoa Da liễu & Ký sinh trùng thú nhỏ',
    clinic_name = 'Bệnh viện Thú Y PawCare TP. Hồ Chí Minh';

-- Tài khoản 3: Quản trị viên (Admin)
INSERT INTO public.users (username, password, full_name, phone, email, address, role, status)
VALUES (
    'admin',
    '123',
    'Quản trị viên Hệ thống PawDerm',
    '0988001122',
    'admin@pawderm.vn',
    'Trung tâm Điều hành PawDerm AI',
    'admin',
    'active'
)
ON CONFLICT (username) DO UPDATE SET
    role = 'admin',
    status = 'active';

-- ============================================================
-- 3. BẢNG pets: Hồ sơ thú cưng
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    species         TEXT NOT NULL DEFAULT 'Chó 🐶',
    breed           TEXT DEFAULT 'Chưa rõ',
    age             TEXT DEFAULT '1 tuổi',
    weight          TEXT DEFAULT 'Chưa cân',
    avatar          TEXT DEFAULT '🐾',
    health_status   TEXT DEFAULT 'Khỏe mạnh bình thường',
    status_badge    TEXT DEFAULT 'badge-success',
    notes           TEXT DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pets_user_id ON public.pets(user_id);

-- ============================================================
-- 4. BẢNG diseases: Từ điển bệnh học ngoài da (Quản lý CRUD bởi Admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.diseases (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disease_key             TEXT NOT NULL UNIQUE,
    name_vi                 TEXT NOT NULL,
    name_en                 TEXT NOT NULL,
    cause                   TEXT NOT NULL DEFAULT '',
    clinical_symptoms       JSONB DEFAULT '[]'::JSONB,
    default_probabilities   JSONB DEFAULT '[]'::JSONB,
    severity_level          TEXT NOT NULL DEFAULT 'Trung bình',
    severity_badge          TEXT NOT NULL DEFAULT 'badge-warning',
    is_zoonotic             BOOLEAN NOT NULL DEFAULT FALSE,
    zoonotic_warning        TEXT DEFAULT '',
    home_first_aid          JSONB DEFAULT '[]'::JSONB,
    emergency_signs         JSONB DEFAULT '[]'::JSONB,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Nạp dữ liệu ban đầu cho bảng diseases
INSERT INTO public.diseases (disease_key, name_vi, name_en, cause, clinical_symptoms, default_probabilities, severity_level, severity_badge, is_zoonotic, zoonotic_warning, home_first_aid, emergency_signs)
VALUES 
(
    'ringworm',
    'Nhiễm nấm da',
    'Ringworm (Dermatophytosis)',
    'Do các chủng vi nấm sợi khoáng (chủ yếu là Microsporum canis, Trichophyton mentagrophytes) xâm nhập và ký sinh tại lớp tế bào sừng của da, móng và thân lông.',
    '["Vùng tổn thương rụng lông hình tròn hoặc bầu dục giống như đồng tiền xu (ring-like).", "Bề mặt da đóng vảy xám trắng như gàu hoặc ửng đỏ, viền ngoài hơi gồ cao.", "Ngứa ngáy từ nhẹ đến dữ dội khiến thú cưng gãi, cọ xát vào tường hoặc liếm liên tục.", "Lông xung quanh khô ráp, giòn và dễ gãy sát gốc chân lông."]'::JSONB,
    '[{"label": "Nhiễm nấm da (Ringworm)", "percent": 85.0, "color": "#0284c7"}, {"label": "Ghẻ Demodex (Mange)", "percent": 11.5, "color": "#f59e0b"}, {"label": "Viêm da cơ địa dị ứng", "percent": 3.5, "color": "#64748b"}]'::JSONB,
    'Trung bình',
    'badge-warning',
    TRUE,
    '⚠️ Bệnh CÓ NGUY CƠ LÂY SANG NGƯỜI (đặc biệt trẻ em và người già). Cần cách ly bé tạm thời và mang găng tay khi chăm sóc!',
    '["Đeo loa chống liếm (vòng Elizabeth) ngay lập tức để ngăn lây lan bào tử nấm sang các vùng da lành khác.", "Vệ sinh nhẹ nhàng bằng nước muối sinh lý 0.9% hoặc dung dịch Povidine pha loãng tỷ lệ màu cánh gián.", "Người chăm sóc bắt buộc đeo găng tay y tế khi bôi thuốc hoặc tắm cho thú cưng.", "Giặt sạch đệm ngủ, khử trùng đồ chơi và chuồng nuôi bằng xịt khử trùng chuyên dụng."]'::JSONB,
    '["Tổn thương nấm lan rộng chiếm trên 30% diện tích bề mặt cơ thể.", "Vùng da chảy dịch mủ vàng tanh hôi, lở loét sâu do nhiễm trùng thứ cấp (bội nhiễm vi khuẩn).", "Thú cưng sốt cao trên 39.5°C, lờ đờ, bỏ ăn, suy kiệt sức lực."]'::JSONB
),
(
    'demodicosis',
    'Bệnh ghẻ Demodex',
    'Demodectic Mange (Demodicosis)',
    'Do ve bao lông Demodex canis sinh sôi bùng phát với mật độ dày đặc trong nang lông và tuyến bã nhờn, thường khởi phát khi hệ thống miễn dịch của thú cưng bị suy yếu.',
    '["Rụng lông khởi phát quanh vùng mắt (tạo thành quầng kính râm), quanh mõm và kẽ móng chân.", "Vùng da tổn thương chuyển màu sẫm xám (sạm da), dày sần sùi và thô ráp.", "Xuất hiện các nốt mụn mủ nhỏ li ti, da tiết dịch nhờn rít có mùi hôi tanh đặc trưng.", "Ngứa ngáy dữ dội dẫn đến gãi làm rách da và chảy máu rỉ rả."]'::JSONB,
    '[{"label": "Ghẻ Demodex (Mange)", "percent": 82.0, "color": "#0284c7"}, {"label": "Viêm nang lông vi khuẩn", "percent": 12.0, "color": "#f59e0b"}, {"label": "Nhiễm nấm da Ringworm", "percent": 6.0, "color": "#64748b"}]'::JSONB,
    'Nguy hiểm - Cần can thiệp y tế',
    'badge-danger',
    FALSE,
    'Bệnh thường không lây sang người do ký sinh trùng đặc hiệu theo loài, nhưng có thể lây từ mẹ sang con qua bú sữa.',
    '["Bổ sung chế độ ăn giàu dinh dưỡng, vitamin E, kẽm và dầu cá Omega-3 để phục hồi hệ miễn dịch.", "Giữ vệ sinh khô thoáng chỗ ở, tuyệt đối không tự ý dùng thuốc bôi chứa Corticoid làm trầm trọng thêm ghẻ.", "Cắt ngắn móng chân và đeo loa bảo vệ tránh cào rách da vùng mặt."]'::JSONB,
    '["Ghẻ toàn thân lan kín cơ thể, sốt cao do viêm mô tế bào dưới da.", "Da sưng phù nề, chảy máu hoặc mủ vàng liên tục, các hạch bạch huyết sưng to bất thường."]'::JSONB
),
(
    'dermatitis',
    'Viêm da mủ & Dị ứng',
    'Pyoderma & Allergic Dermatitis',
    'Phản ứng viêm quá mẫn dị ứng với thức ăn, bọ chét, phấn hoa môi trường kết hợp nhiễm trùng tụ cầu khuẩn (Staphylococcus pseudintermedius).',
    '["Các mảng da bụng, bẹn, nách ửng đỏ rực và nóng rát.", "Xuất hiện nhiều mụn mủ trắng hoặc mụn nước nhỏ vỡ ra tạo thành vảy cứng đóng cục.", "Thú cưng liên tục liếm láp bàn chân và cắn vào vùng đuôi/bụng."]'::JSONB,
    '[{"label": "Viêm da dị ứng & Bội nhiễm", "percent": 78.5, "color": "#0284c7"}, {"label": "Nhiễm nấm men Malassezia", "percent": 15.0, "color": "#f59e0b"}, {"label": "Viêm da tiếp xúc", "percent": 6.5, "color": "#64748b"}]'::JSONB,
    'Trung bình',
    'badge-warning',
    FALSE,
    'Không lây sang người. Là phản ứng dị ứng và bội nhiễm cơ địa của thú cưng.',
    '["Cách ly khỏi thảm len, bãi cỏ nghi ngờ có thuốc trừ sâu hoặc thức ăn lạ vừa đổi.", "Chườm mát bằng gạc y tế thấm nước muối sinh lý để xoa dịu cơn ngứa rát cục bộ.", "Tắm bằng dầu gội dược liệu dịu nhẹ có độ pH 6.5 - 7.5 cân bằng cho da chó mèo."]'::JSONB,
    '["Mụn mủ vỡ lan rộng khắp bụng và ngực tạo thành mảng viêm loét rỉ dịch vàng.", "Thú cưng bồn chồn rên rỉ, không thể ngủ do ngứa rát và đau đớn."]'::JSONB
)
ON CONFLICT (disease_key) DO NOTHING;

-- ============================================================
-- 5. BẢNG diagnosis_records: Lịch sử, kết quả AI & Thẩm định Bác sĩ
-- ============================================================
CREATE TABLE IF NOT EXISTS public.diagnosis_records (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id                      UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    user_id                     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    disease_key                 TEXT NOT NULL DEFAULT '',
    disease_name_vi             TEXT NOT NULL DEFAULT '',
    disease_name_en             TEXT NOT NULL DEFAULT '',
    confidence                  FLOAT8 NOT NULL DEFAULT 0.0,
    probabilities               JSONB DEFAULT '[]'::JSONB,
    recovery_score              INT DEFAULT 0,
    severity                    TEXT DEFAULT 'Trung bình',
    severity_badge              TEXT DEFAULT 'badge-warning',
    clinical_notes              TEXT DEFAULT '',
    treatment_applied           TEXT DEFAULT '',
    image_url                   TEXT DEFAULT '',
    -- Cột bổ sung cho phân hệ Bác sĩ & Tiến triển bệnh
    review_status               TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'agreed' | 'corrected'
    reviewed_by                 UUID REFERENCES public.users(id) ON DELETE SET NULL,
    doctor_name                 TEXT DEFAULT '',
    doctor_corrected_disease    TEXT DEFAULT '',
    doctor_notes                TEXT DEFAULT '',
    reviewed_at                 TIMESTAMPTZ,
    day_number                  INT DEFAULT 1,
    progression_notes           TEXT DEFAULT '',
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Thêm các cột nếu bảng diagnosis_records đã tồn tại
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diagnosis_records' AND column_name='review_status') THEN
        ALTER TABLE public.diagnosis_records ADD COLUMN review_status TEXT NOT NULL DEFAULT 'pending';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diagnosis_records' AND column_name='reviewed_by') THEN
        ALTER TABLE public.diagnosis_records ADD COLUMN reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diagnosis_records' AND column_name='doctor_name') THEN
        ALTER TABLE public.diagnosis_records ADD COLUMN doctor_name TEXT DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diagnosis_records' AND column_name='doctor_corrected_disease') THEN
        ALTER TABLE public.diagnosis_records ADD COLUMN doctor_corrected_disease TEXT DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diagnosis_records' AND column_name='doctor_notes') THEN
        ALTER TABLE public.diagnosis_records ADD COLUMN doctor_notes TEXT DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diagnosis_records' AND column_name='reviewed_at') THEN
        ALTER TABLE public.diagnosis_records ADD COLUMN reviewed_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diagnosis_records' AND column_name='day_number') THEN
        ALTER TABLE public.diagnosis_records ADD COLUMN day_number INT DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diagnosis_records' AND column_name='progression_notes') THEN
        ALTER TABLE public.diagnosis_records ADD COLUMN progression_notes TEXT DEFAULT '';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_diag_pet_id        ON public.diagnosis_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_diag_user_id       ON public.diagnosis_records(user_id);
CREATE INDEX IF NOT EXISTS idx_diag_review_status ON public.diagnosis_records(review_status);
CREATE INDEX IF NOT EXISTS idx_diag_created       ON public.diagnosis_records(created_at DESC);

-- ============================================================
-- 6. BẢNG appointments: Lịch hẹn khám & Thanh toán VietQR
-- ============================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id                      TEXT PRIMARY KEY,
    user_id                 TEXT NOT NULL,
    owner_name              TEXT DEFAULT 'Khách hàng',
    phone                   TEXT DEFAULT '',
    pet_id                  TEXT DEFAULT '',
    pet_name                TEXT NOT NULL,
    pet_species             TEXT DEFAULT 'Chó / Mèo',
    service_title           TEXT NOT NULL,
    appointment_date        TEXT NOT NULL,
    appointment_time        TEXT NOT NULL,
    hospital_address        TEXT DEFAULT '1A Lê Thị Xuyến, quận Thanh Khuê, Đà Nẵng',
    hospital_phone          TEXT DEFAULT '0795477302',
    hospital_hours          TEXT DEFAULT '8h-17h',
    notes                   TEXT DEFAULT '',
    status                  TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'confirmed' | 'completed' | 'cancelled'
    doctor_id               TEXT DEFAULT '',
    doctor_name             TEXT DEFAULT 'BS. CKII Nguyễn Thị Mai Hương',
    doctor_pre_diagnosis    TEXT DEFAULT '',
    severity_level          TEXT DEFAULT 'Chờ bác sĩ tiếp nhận',
    doctor_advice           TEXT DEFAULT '',
    payment_status          TEXT NOT NULL DEFAULT 'pending_payment', -- 'pending_payment' | 'paid' | 'expired'
    payment_amount          NUMERIC DEFAULT 200000,
    payment_memo            TEXT DEFAULT '',
    payment_qr_url          TEXT DEFAULT '',
    payment_qr_expires_at   TIMESTAMPTZ,
    paid_at                 TIMESTAMPTZ,
    payment_method          TEXT DEFAULT 'VietQR Online',
    bank_info               JSONB DEFAULT '{}'::JSONB,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at            TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_payment_status ON public.appointments(payment_status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);

-- ============================================================
-- 7. TẮT ROW LEVEL SECURITY (RLS) ĐỂ APP TRUY XUẤT TỰ DO
-- ============================================================
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.diseases DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.diagnosis_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.appointments DISABLE ROW LEVEL SECURITY;


