import React from 'react';
import { 
  Sparkles, 
  Plus, 
  Heart, 
  Activity, 
  Camera, 
  Stethoscope, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight,
  ChevronRight,
  Info
} from 'lucide-react';

export default function HomeTab({ 
  currentUser, 
  pets = [], 
  historyRecords = [], 
  onStartDiagnose, 
  onOpenAddPetModal, 
  onGoToPets,
  onGoToProgression
}) {
  const userName = currentUser?.full_name?.split(' ')[0] || currentUser?.username || 'Bạn';

  // Tính toán số liệu thống kê nhanh
  const totalPets = pets.length;
  const totalDiagnoses = historyRecords.length;
  
  // Ca đang điều trị (ngày gần nhất có độ nghiêm trọng Trung bình/Nặng hoặc chưa khỏi)
  const activeTreatments = historyRecords.filter(r => 
    r.severity_level?.toLowerCase().includes('nặng') || 
    r.severity_level?.toLowerCase().includes('trung bình') ||
    r.severity_badge?.toLowerCase().includes('warning') ||
    r.severity_badge?.toLowerCase().includes('danger')
  ).length;

  const healthyPets = Math.max(0, totalPets - (activeTreatments > totalPets ? totalPets : activeTreatments));

  return (
    <div className="customer-home-tab animate-fadeIn">
      {/* 1. HERO BANNER CHÀO MỪNG */}
      <section className="home-hero-banner">
        <div className="hero-content">
          <div className="hero-pill-badge">
            <Sparkles size={14} className="sparkle-icon" />
            <span>Chào mừng trở lại, {userName}! 🐶🐱</span>
          </div>
          <h1 className="hero-title">
            Phát Hiện Sớm Bệnh Da Liễu Thú Cưng Bằng AI
          </h1>
          <p className="hero-subtitle">
            Chụp ảnh vùng da tổn thương, ngứa ngáy hay rụng lông — nhận ngay phân tích xác suất vi nấm, ghẻ Demodex cùng phác đồ sơ cứu y khoa an toàn tại nhà.
          </p>
          <div className="hero-actions">
            <button 
              type="button" 
              className="btn-hero-primary"
              onClick={() => onStartDiagnose()}
            >
              <Sparkles size={18} />
              <span>Bắt đầu Khám bệnh ngay</span>
            </button>
            <button 
              type="button" 
              className="btn-hero-secondary"
              onClick={onOpenAddPetModal}
            >
              <Plus size={18} />
              <span>Thêm hồ sơ bé cưng</span>
            </button>
          </div>
        </div>
        <div className="hero-art-side">
          <div className="hero-pet-badges">
            <span className="floating-badge badge-dog">🐕 Chó cưng</span>
            <span className="floating-badge badge-cat">🐈 Mèo yêu</span>
            <span className="floating-badge badge-ai">⚡ AI YOLOv8</span>
          </div>
        </div>
      </section>

      {/* 2. STATS OVERVIEW CARDS */}
      <section className="home-stats-grid">
        <div className="stat-overview-card card-orange" onClick={onGoToPets} title="Bấm để xem danh sách thú cưng">
          <div className="stat-icon-wrapper orange">
            <Heart size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{totalPets}</div>
            <div className="stat-label">Bé cưng của bạn</div>
          </div>
          <ChevronRight size={18} className="stat-arrow" />
        </div>

        <div className="stat-overview-card card-teal" onClick={() => onStartDiagnose()} title="Bấm để chẩn đoán">
          <div className="stat-icon-wrapper teal">
            <Activity size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{totalDiagnoses}</div>
            <div className="stat-label">Lượt quét AI đã lưu</div>
          </div>
          <ChevronRight size={18} className="stat-arrow" />
        </div>

        <div className="stat-overview-card card-amber" onClick={onGoToProgression} title="Bấm để theo dõi tiến triển">
          <div className="stat-icon-wrapper amber">
            <AlertTriangle size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{activeTreatments}</div>
            <div className="stat-label">Ca cần theo dõi</div>
          </div>
          <ChevronRight size={18} className="stat-arrow" />
        </div>

        <div className="stat-overview-card card-green" onClick={onGoToPets} title="Bấm để xem tình trạng bé">
          <div className="stat-icon-wrapper green">
            <ShieldCheck size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{healthyPets}</div>
            <div className="stat-label">Bé khỏe mạnh</div>
          </div>
          <ChevronRight size={18} className="stat-arrow" />
        </div>
      </section>

      {/* 3. QUY TRÌNH 3 BƯỚC KHÁM BỆNH AI */}
      <section className="home-section-card">
        <div className="section-header-row">
          <div>
            <h3 className="section-title">
              <span className="section-icon-pill">📋</span>
              Quy Trình Khám Bệnh Nhanh Bằng AI
            </h3>
            <p className="section-desc">Chỉ mất chưa đầy 30 giây để kiểm tra sơ bộ tình trạng da liễu của bé cưng</p>
          </div>
        </div>

        <div className="home-steps-grid">
          <div className="step-card-item">
            <div className="step-badge-num">1</div>
            <div className="step-icon-box orange">
              <Camera size={24} />
            </div>
            <h4 className="step-title">Chụp ảnh vùng da</h4>
            <p className="step-text">
              Tải lên hoặc chụp rõ nét vùng da bị rụng lông, mẩn đỏ, vảy gàu hoặc mụn mủ.
            </p>
          </div>

          <div className="step-card-item">
            <div className="step-badge-num">2</div>
            <div className="step-icon-box teal">
              <Sparkles size={24} />
            </div>
            <h4 className="step-title">AI Quét & Phân tích</h4>
            <p className="step-text">
              Mô hình YOLOv8 phân loại tổn thương, tính toán độ tin cậy và mức độ nghiêm trọng lâm sàng.
            </p>
          </div>

          <div className="step-card-item">
            <div className="step-badge-num">3</div>
            <div className="step-icon-box green">
              <Stethoscope size={24} />
            </div>
            <h4 className="step-title">Nhận phác đồ sơ cứu</h4>
            <p className="step-text">
              Xem hướng dẫn chăm sóc tại nhà, cảnh báo nguy cấp và kết nối đặt lịch khám với Bác sĩ thú y.
            </p>
          </div>
        </div>
      </section>

      {/* 4. LỐI TẮT KHÁM CHO TỪNG BÉ CƯNG */}
      <section className="home-section-card">
        <div className="section-header-row">
          <div>
            <h3 className="section-title">
              <span className="section-icon-pill">🐾</span>
              Bé Cưng Của Bạn
            </h3>
            <p className="section-desc">Chọn trực tiếp một bé để vào ngay giao diện khám AI</p>
          </div>
          <button 
            type="button" 
            className="btn-subtle-link" 
            onClick={onGoToPets}
          >
            <span>Xem tất cả ({pets.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {pets.length === 0 ? (
          <div className="home-empty-pets">
            <span className="empty-pet-icon">🐶🐱</span>
            <h4>Bạn chưa thêm hồ sơ bé cưng nào</h4>
            <p>Hãy thêm thông tin bé cưng để hệ thống lưu trữ lịch sử bệnh án và theo dõi tiến triển phục hồi.</p>
            <button 
              type="button" 
              className="btn-create-pet-inline"
              onClick={onOpenAddPetModal}
            >
              <Plus size={16} />
              <span>Thêm bé cưng đầu tiên</span>
            </button>
          </div>
        ) : (
          <div className="home-quick-pets-grid">
            {pets.slice(0, 4).map((pet) => (
              <div key={pet.id} className="home-pet-quick-card">
                <div className="pet-quick-avatar">
                  {pet.species?.includes('Mèo') || pet.species?.includes('🐱') ? '🐱' : '🐶'}
                </div>
                <div className="pet-quick-info">
                  <h4 className="pet-quick-name">{pet.name}</h4>
                  <div className="pet-quick-tags">
                    <span className="pet-tag-species">{pet.species || 'Chó'}</span>
                    <span className="pet-tag-breed">{pet.breed || 'Chưa rõ giống'}</span>
                  </div>
                  <div className="pet-quick-meta">
                    <span>{pet.age || 'Chưa rõ tuổi'}</span> &bull; <span>{pet.weight || 'Chưa rõ cân nặng'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-quick-diagnose"
                  onClick={() => onStartDiagnose(pet.id)}
                  title={`Bắt đầu khám cho ${pet.name}`}
                >
                  <Sparkles size={14} />
                  <span>Khám cho {pet.name}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. CẨM NANG Y KHOA & PHÒNG BỆNH DA LIỄU */}
      <section className="home-tips-grid">
        <div className="tip-card tip-ringworm">
          <div className="tip-header">
            <span className="tip-tag-danger">⚠️ Nguy cơ lây sang người (Zoonosis)</span>
            <h4 className="tip-title">🍄 Phòng ngừa Bệnh Vi Nấm (Ringworm)</h4>
          </div>
          <p className="tip-content">
            Nấm da có thể lây trực tiếp sang chủ nuôi (gây vòng tròn ngứa đỏ). Hãy sấy thật khô lông sát tận chân lông sau khi tắm, thường xuyên phơi nắng đệm nằm và cách ly thú cưng nhiễm nấm khi bôi thuốc.
          </p>
          <div className="tip-footer">
            <span className="tip-badge">Lời khuyên từ Bác sĩ thú y</span>
          </div>
        </div>

        <div className="tip-card tip-demodex">
          <div className="tip-header">
            <span className="tip-tag-warning">🔍 Nhận biết sớm</span>
            <h4 className="tip-title">🐛 Dấu hiệu Ghẻ Demodex & Ký sinh trùng</h4>
          </div>
          <p className="tip-content">
            Nếu nhận thấy thú cưng rụng lông hình kính râm quanh hốc mắt, kẽ ngón chân ửng đỏ hoặc có mùi hôi tanh nồng — hãy dùng PawDerm AI kiểm tra ngay để tránh tình trạng ghẻ bội nhiễm toàn thân.
          </p>
          <div className="tip-footer">
            <span className="tip-badge">Sơ cứu y khoa chuẩn phác đồ</span>
          </div>
        </div>
      </section>
    </div>
  );
}
