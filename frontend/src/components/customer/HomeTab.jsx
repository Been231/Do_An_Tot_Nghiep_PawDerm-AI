import React from 'react';
import {
  Sparkles, Plus, Heart, Activity, Camera, Stethoscope,
  ShieldCheck, AlertTriangle, ArrowRight, ChevronRight,
  Zap, Bell, LogIn, UserPlus, CalendarCheck
} from 'lucide-react';

export default function HomeTab({
  currentUser,
  pets = [],
  historyRecords = [],
  onStartDiagnose,
  onOpenAddPetModal,
  onGoToPets,
  onGoToAppointments,
  onRequireAuth
}) {
  const isGuest = !currentUser;
  const userName = currentUser?.full_name?.split(' ').slice(-1)[0] || currentUser?.username || 'Bạn';

  const totalPets = pets.length;
  const totalDiagnoses = historyRecords.length;
  const activeTreatments = historyRecords.filter(r =>
    r.severity_level?.toLowerCase().includes('nặng') ||
    r.severity_level?.toLowerCase().includes('trung bình') ||
    r.severity_badge?.toLowerCase().includes('warning') ||
    r.severity_badge?.toLowerCase().includes('danger')
  ).length;
  const healthyPets = Math.max(0, totalPets - Math.min(activeTreatments, totalPets));

  const lastRecord = historyRecords[0];
  const daysSinceLast = lastRecord
    ? Math.floor((Date.now() - new Date(lastRecord.created_at || Date.now())) / 86400000)
    : null;

  return (
    <div className="ht-root">

      {/* ── HERO SECTION ──────────────────────────────────────── */}
      <section className="ht-hero">
        {/* Decorative blobs */}
        <div className="ht-blob ht-blob-1" />
        <div className="ht-blob ht-blob-2" />
        <div className="ht-blob ht-blob-3" />

        {/* Floating ring */}
        <div className="ht-ring ht-ring-1" />
        <div className="ht-ring ht-ring-2" />

        {/* Left content */}
        <div className="ht-hero-left">
          <div className="ht-greeting-badge">
            <Sparkles size={14} className="ht-sparkle" />
            <span>{isGuest ? 'Chào mừng bạn đến với PawDerm AI! 🐾' : `Xin chào, ${userName}! 🐾`}</span>
          </div>

          <h1 className="ht-hero-title">
            Chăm Sóc Da Liễu<br />
            Thú Cưng Bằng <span className="ht-title-highlight">AI</span>
          </h1>

          <p className="ht-hero-desc">
            Chụp ảnh vùng da tổn thương và nhận ngay kết quả phân tích từ mô hình <strong>YOLOv8</strong> — phát hiện nấm da, ghẻ Demodex, viêm da trong vòng 30 giây.
          </p>

          <div className="ht-hero-btns">
            <button type="button" className="ht-btn-primary" onClick={() => onStartDiagnose()}>
              <Zap size={18} />
              <span>Bắt đầu Chẩn đoán AI</span>
            </button>
            {isGuest ? (
              <button type="button" className="ht-btn-ghost" onClick={() => onRequireAuth?.('register')}>
                <UserPlus size={17} />
                <span>Đăng ký thành viên</span>
              </button>
            ) : (
              <button type="button" className="ht-btn-ghost" onClick={onOpenAddPetModal}>
                <Plus size={17} />
                <span>Thêm bé cưng</span>
              </button>
            )}
          </div>

          {/* trust bar */}
          <div className="ht-trust-bar">
            <span className="ht-trust-item">✅ YOLOv8 Object Detection</span>
            <span className="ht-trust-dot" />
            <span className="ht-trust-item">🩺 Bác sĩ thẩm định</span>
            <span className="ht-trust-dot" />
            <span className="ht-trust-item">🔒 Xác thực Gmail an toàn</span>
          </div>
        </div>

        {/* Right floating cards */}
        <div className="ht-hero-right">
          <div className="ht-float-card ht-float-card-1">
            <span className="ht-float-emoji">🐶</span>
            <div>
              <div className="ht-float-label">Chó cưng</div>
              <div className="ht-float-sub">Golden, Corgi, Poodle...</div>
            </div>
          </div>
          <div className="ht-float-card ht-float-card-2">
            <span className="ht-float-emoji">🐱</span>
            <div>
              <div className="ht-float-label">Mèo yêu</div>
              <div className="ht-float-sub">British, Munchkin...</div>
            </div>
          </div>
          <div className="ht-float-card ht-float-card-3">
            <Sparkles size={14} style={{ color: '#f97316' }} />
            <div>
              <div className="ht-float-label" style={{ color: '#ea580c' }}>⚡ AI YOLOv8</div>
              <div className="ht-float-sub">Độ chính xác cao</div>
            </div>
          </div>

          {/* Paw decoration */}
          <div className="ht-paw-art">🐾</div>
        </div>
      </section>

      {/* ── STAT CARDS ─────────────────────────────────────────── */}
      <section className="ht-stats-row">
        {isGuest ? (
          <>
            <div className="ht-stat-card ht-stat-orange" onClick={() => onRequireAuth?.('register')} role="button" tabIndex={0}>
              <div className="ht-stat-icon"><Heart size={22} /></div>
              <div className="ht-stat-body">
                <span className="ht-stat-num">4+</span>
                <span className="ht-stat-lbl">Bệnh da liễu nhận diện</span>
              </div>
              <ChevronRight size={16} className="ht-stat-arrow" />
              <div className="ht-stat-glow ht-glow-orange" />
            </div>

            <div className="ht-stat-card ht-stat-teal" onClick={() => onStartDiagnose()} role="button" tabIndex={0}>
              <div className="ht-stat-icon"><Activity size={22} /></div>
              <div className="ht-stat-body">
                <span className="ht-stat-num">&lt; 30s</span>
                <span className="ht-stat-lbl">Tốc độ quét AI</span>
              </div>
              <ChevronRight size={16} className="ht-stat-arrow" />
              <div className="ht-stat-glow ht-glow-teal" />
            </div>

            <div className="ht-stat-card ht-stat-amber" onClick={() => onStartDiagnose()} role="button" tabIndex={0}>
              <div className="ht-stat-icon"><AlertTriangle size={22} /></div>
              <div className="ht-stat-body">
                <span className="ht-stat-num">YOLOv8</span>
                <span className="ht-stat-lbl">Mô hình AI thị giác</span>
              </div>
              <ChevronRight size={16} className="ht-stat-arrow" />
              <div className="ht-stat-glow ht-glow-amber" />
            </div>

            <div className="ht-stat-card ht-stat-green" onClick={() => onRequireAuth?.('login')} role="button" tabIndex={0}>
              <div className="ht-stat-icon"><ShieldCheck size={22} /></div>
              <div className="ht-stat-body">
                <span className="ht-stat-num">100%</span>
                <span className="ht-stat-lbl">Bác sĩ thú y thẩm định</span>
              </div>
              <ChevronRight size={16} className="ht-stat-arrow" />
              <div className="ht-stat-glow ht-glow-green" />
            </div>
          </>
        ) : (
          <>
            <div className="ht-stat-card ht-stat-orange" onClick={onGoToPets} role="button" tabIndex={0}>
              <div className="ht-stat-icon"><Heart size={22} /></div>
              <div className="ht-stat-body">
                <span className="ht-stat-num">{totalPets}</span>
                <span className="ht-stat-lbl">Bé cưng của bạn</span>
              </div>
              <ChevronRight size={16} className="ht-stat-arrow" />
              <div className="ht-stat-glow ht-glow-orange" />
            </div>

            <div className="ht-stat-card ht-stat-teal" onClick={() => onStartDiagnose()} role="button" tabIndex={0}>
              <div className="ht-stat-icon"><Activity size={22} /></div>
              <div className="ht-stat-body">
                <span className="ht-stat-num">{totalDiagnoses}</span>
                <span className="ht-stat-lbl">Lượt quét AI</span>
              </div>
              <ChevronRight size={16} className="ht-stat-arrow" />
              <div className="ht-stat-glow ht-glow-teal" />
            </div>

            <div className="ht-stat-card ht-stat-amber" onClick={onGoToAppointments} role="button" tabIndex={0} title="Đặt lịch khám trực tiếp tại Bệnh viện PawDerm">
              <div className="ht-stat-icon"><CalendarCheck size={22} /></div>
              <div className="ht-stat-body">
                <span className="ht-stat-num">Bệnh viện</span>
                <span className="ht-stat-lbl">Đặt lịch khám PawDerm</span>
              </div>
              <ChevronRight size={16} className="ht-stat-arrow" />
              <div className="ht-stat-glow ht-glow-amber" />
            </div>

            <div className="ht-stat-card ht-stat-green" onClick={onGoToPets} role="button" tabIndex={0}>
              <div className="ht-stat-icon"><ShieldCheck size={22} /></div>
              <div className="ht-stat-body">
                <span className="ht-stat-num">{healthyPets}</span>
                <span className="ht-stat-lbl">Bé khỏe mạnh</span>
              </div>
              <ChevronRight size={16} className="ht-stat-arrow" />
              <div className="ht-stat-glow ht-glow-green" />
            </div>
          </>
        )}
      </section>

      {/* ── REMINDER BANNER (chỉ hiện khi đã đăng nhập và có lần khám gần nhất) ─────── */}
      {!isGuest && daysSinceLast !== null && daysSinceLast >= 7 && (
        <div className="ht-remind-banner">
          <Bell size={18} className="ht-remind-icon" />
          <span>
            Đã <strong>{daysSinceLast} ngày</strong> kể từ lần khám cuối — hãy kiểm tra lại tình trạng da cho bé nhé!
          </span>
          <button type="button" className="ht-remind-btn" onClick={() => onStartDiagnose()}>
            Khám ngay <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ── QUY TRÌNH 3 BƯỚC ───────────────────────────────────── */}
      <section className="ht-section">
        <div className="ht-section-hd">
          <div>
            <h3 className="ht-section-title"><span>📋</span> Quy Trình 3 Bước Khám Bệnh AI</h3>
            <p className="ht-section-sub">Hoàn tất chẩn đoán sơ bộ trong dưới 30 giây</p>
          </div>
        </div>

        <div className="ht-steps-grid">
          {[
            {
              num: '01', icon: <Camera size={26} />, color: 'orange',
              title: 'Chụp ảnh vùng da', emoji: '📸',
              text: 'Tải lên hoặc chụp rõ vùng rụng lông, mẩn đỏ, vảy gàu hoặc mụn mủ.',
            },
            {
              num: '02', icon: <Sparkles size={26} />, color: 'teal',
              title: 'AI Quét & Phân tích', emoji: '🤖',
              text: 'YOLOv8 phân loại tổn thương, tính độ tin cậy và mức độ nghiêm trọng lâm sàng.',
            },
            {
              num: '03', icon: <Stethoscope size={26} />, color: 'green',
              title: 'Nhận phác đồ sơ cứu', emoji: '💊',
              text: 'Hướng dẫn chăm sóc tại nhà, cảnh báo nguy cấp và kết nối bác sĩ thú y.',
            },
          ].map((s, i) => (
            <div key={i} className={`ht-step-card ht-step-${s.color}`}>
              <div className="ht-step-top">
                <span className="ht-step-num">{s.num}</span>
                <span className="ht-step-emoji">{s.emoji}</span>
              </div>
              <div className={`ht-step-icon-box ht-icon-${s.color}`}>{s.icon}</div>
              <h4 className="ht-step-title">{s.title}</h4>
              <p className="ht-step-text">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BÉ CƯNG CỦA BẠN (HOẶC BANNER MỜI ĐĂNG KÝ/ĐĂNG NHẬP CHO GUEST) ───────────────── */}
      <section className="ht-section">
        <div className="ht-section-hd">
          <div>
            <h3 className="ht-section-title"><span>🐾</span> Bé Cưng Của Bạn</h3>
            <p className="ht-section-sub">
              {isGuest ? 'Đăng nhập để theo dõi hồ sơ bệnh án thú cưng' : 'Chọn bé để bắt đầu khám ngay'}
            </p>
          </div>
          {!isGuest && (
            <button type="button" className="ht-link-btn" onClick={onGoToPets}>
              Xem tất cả ({pets.length}) <ArrowRight size={13} />
            </button>
          )}
        </div>

        {isGuest ? (
          <div className="ht-empty-pets guest-welcome-box">
            <div className="ht-empty-art">🐶🐱</div>
            <h4>Tạo hồ sơ thú cưng & Lưu lịch sử bệnh án</h4>
            <p>
              Đăng nhập hoặc tạo tài khoản để quản lý các bé cưng của bạn, lưu lại hình ảnh điều trị và nhận tư vấn chuyên môn từ bác sĩ thú y.
            </p>
            <div className="ht-guest-actions-row">
              <button type="button" className="ht-btn-primary" onClick={() => onRequireAuth?.('login')}>
                <LogIn size={16} /> Đăng nhập ngay
              </button>
              <button type="button" className="ht-btn-ghost" onClick={() => onRequireAuth?.('register')}>
                <UserPlus size={16} /> Đăng ký tài khoản (Gmail OTP)
              </button>
            </div>
          </div>
        ) : pets.length === 0 ? (
          <div className="ht-empty-pets">
            <div className="ht-empty-art">🐶🐱</div>
            <h4>Chưa có hồ sơ bé cưng nào</h4>
            <p>Thêm thông tin bé cưng để lưu lịch sử bệnh án và theo dõi tiến triển hồi phục.</p>
            <button type="button" className="ht-btn-add-pet" onClick={onOpenAddPetModal}>
              <Plus size={16} /> Thêm bé cưng đầu tiên
            </button>
          </div>
        ) : (
          <div className="ht-pets-grid">
            {pets.slice(0, 4).map((pet) => {
              const isCat = pet.species?.includes('Mèo') || pet.species?.includes('🐱');
              return (
                <div key={pet.id} className="ht-pet-card">
                  <div className="ht-pet-avatar-wrap">
                    <span className="ht-pet-emoji">{isCat ? '🐱' : '🐶'}</span>
                    <span className={`ht-pet-status-dot ${activeTreatments > 0 ? 'warning' : 'healthy'}`} />
                  </div>
                  <div className="ht-pet-info">
                    <h4 className="ht-pet-name">{pet.name}</h4>
                    <div className="ht-pet-tags">
                      <span className="ht-ptag orange">{pet.species || 'Chó'}</span>
                    </div>
                    <p className="ht-pet-meta">{pet.weight ? `Cân nặng: ${pet.weight}` : 'Chưa có thông tin cân nặng'}</p>
                  </div>
                  <button
                    type="button"
                    className="ht-btn-diagnose-pet"
                    onClick={() => onStartDiagnose(pet.id)}
                    title={`Khám cho ${pet.name}`}
                  >
                    <Sparkles size={14} />
                    <span>Khám ngay</span>
                  </button>
                </div>
              );
            })}
            {pets.length < 4 && (
              <button type="button" className="ht-pet-add-card" onClick={onOpenAddPetModal}>
                <Plus size={28} />
                <span>Thêm bé mới</span>
              </button>
            )}
          </div>
        )}
      </section>

      {/* ── CẨM NANG Y KHOA ────────────────────────────────────── */}
      <section className="ht-tips-grid">
        <div className="ht-tip-card ht-tip-red">
          <div className="ht-tip-icon-wrap">🍄</div>
          <div>
            <span className="ht-tip-badge danger">⚠️ Lây sang người (Zoonosis)</span>
            <h4 className="ht-tip-title">Phòng ngừa Bệnh Vi Nấm</h4>
            <p className="ht-tip-body">
              Nấm da có thể lây sang chủ nuôi. Sấy khô lông sát chân sau tắm, thường xuyên phơi nắng đệm nằm và cách ly thú cưng bị nấm khi bôi thuốc.
            </p>
            <span className="ht-tip-footer-lbl">💡 Lời khuyên từ Bác sĩ thú y</span>
          </div>
        </div>

        <div className="ht-tip-card ht-tip-amber">
          <div className="ht-tip-icon-wrap">🔬</div>
          <div>
            <span className="ht-tip-badge warning">🔍 Nhận biết sớm</span>
            <h4 className="ht-tip-title">Dấu hiệu Ghẻ Demodex & Ký sinh trùng</h4>
            <p className="ht-tip-body">
              Thú cưng rụng lông hình kính râm quanh mắt, kẽ ngón đỏ hoặc có mùi hôi tanh — hãy dùng PawDerm AI kiểm tra ngay để tránh ghẻ bội nhiễm toàn thân.
            </p>
            <span className="ht-tip-footer-lbl">💊 Sơ cứu y khoa chuẩn phác đồ</span>
          </div>
        </div>
      </section>

    </div>
  );
}
