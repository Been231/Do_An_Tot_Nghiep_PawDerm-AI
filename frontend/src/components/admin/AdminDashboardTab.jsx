import React from 'react';

export default function AdminDashboardTab({ metrics }) {
  return (
    <div className="admin-dashboard-section">
      <div className="dashboard-metric-grid mb-4">
        <div className="card metric-box">
          <span className="metric-icon-bg bg-primary-soft">👥</span>
          <div className="metric-info">
            <span className="metric-title">Tổng Người Dùng</span>
            <strong className="metric-number">{metrics?.total_users || 48}</strong>
            <span className="metric-sub text-success">Khách hàng & Bác sĩ</span>
          </div>
        </div>

        <div className="card metric-box">
          <span className="metric-icon-bg bg-orange-soft">📸</span>
          <div className="metric-info">
            <span className="metric-title">Lượt Chẩn Đoán AI</span>
            <strong className="metric-number">{metrics?.total_diagnoses || 162}</strong>
            <span className="metric-sub text-primary">Toàn hệ thống</span>
          </div>
        </div>

        <div className="card metric-box">
          <span className="metric-icon-bg bg-teal-soft">🩺</span>
          <div className="metric-info">
            <span className="metric-title">Bác Sĩ Đang Hoạt Động</span>
            <strong className="metric-number">{metrics?.total_doctors || 6}</strong>
            <span className="metric-sub text-teal">Chuyên khoa da liễu</span>
          </div>
        </div>

        <div className="card metric-box">
          <span className="metric-icon-bg bg-warning-soft">🎯</span>
          <div className="metric-info">
            <span className="metric-title">Mẫu Sẵn Sàng Retrain</span>
            <strong className="metric-number text-warning">{metrics?.retrain_ready_samples || 18}</strong>
            <span className="metric-sub">Bác sĩ dán nhãn lại</span>
          </div>
        </div>
      </div>

      <div className="admin-charts-grid">
        {/* TOP BỆNH NGOÀI DA NHIỀU NHẤT */}
        <div className="card chart-card">
          <div className="card-header">
            <h3>📊 Top Bệnh Da Liễu Xuất Hiện Nhiều Nhất</h3>
            <p className="card-subtitle">Thống kê tần suất nhận diện từ các ca chẩn đoán thực tế</p>
          </div>

          <div className="disease-stats-list mt-3">
            {metrics?.top_diseases?.map((d, i) => (
              <div key={i} className="disease-stat-item">
                <div className="flex-between mb-1">
                  <strong>{d.name}</strong>
                  <span>{d.count} ca ({d.percent}%)</span>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${d.percent}%`,
                      backgroundColor: i === 0 ? '#0284c7' : i === 1 ? '#f59e0b' : '#0d9488'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LƯỢT CHẨN ĐOÁN TRONG TUẦN */}
        <div className="card chart-card">
          <div className="card-header">
            <h3>📈 Xu Hướng Chẩn Đoán Trong Tuần</h3>
            <p className="card-subtitle">Số lượng ảnh quét biểu bì mỗi ngày</p>
          </div>

          <div className="weekly-bars-container mt-4">
            {metrics?.weekly_trends?.map((item, idx) => (
              <div key={idx} className="weekly-bar-column">
                <div className="bar-wrapper">
                  <div 
                    className="bar-fill"
                    style={{ height: `${(item.scans / 45) * 100}%` }}
                    title={`${item.scans} lượt quét`}
                  >
                    <span className="bar-value">{item.scans}</span>
                  </div>
                </div>
                <span className="bar-label">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
