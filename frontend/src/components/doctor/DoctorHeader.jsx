import React from 'react';
import { Stethoscope, UserCheck, Building, Award } from 'lucide-react';

export default function DoctorHeader({
  currentUser,
  clinicName,
  specialty,
  stats,
  onOpenProfileEdit
}) {
  return (
    <div className="doctor-header-card card mb-4">
      <div className="doctor-info-top">
        <div className="doctor-badge-avatar">
          <Stethoscope size={36} className="text-teal" />
        </div>
        <div className="doctor-title-group">
          <div className="flex-center-gap">
            <h2>{currentUser?.full_name || 'BS. CKII Nguyễn Thị Mai Hương'}</h2>
            <span className="badge-expert">
              <UserCheck size={14} /> Chuyên Gia Thú Y Đã Xác Thực
            </span>
          </div>
          <p className="doctor-sub">
            <Building size={14} className="inline mr-1" />
            {currentUser?.clinic_name || clinicName} &bull; 
            <Award size={14} className="inline mx-1" />
            {currentUser?.specialty || specialty}
          </p>
        </div>

        <button className="btn-outline-action" onClick={onOpenProfileEdit}>
          Cập nhật nơi công tác
        </button>
      </div>

      {/* THỐNG KÊ ĐÓNG GÓP CÁ NHÂN */}
      <div className="doctor-stats-row mt-3">
        <div className="stat-card-doc">
          <span className="doc-stat-num text-primary">{stats.total_reviewed}</span>
          <span className="doc-stat-lbl">Ca bệnh đã thẩm định</span>
        </div>
        <div className="stat-card-doc">
          <span className="doc-stat-num text-success">{stats.agreed_count}</span>
          <span className="doc-stat-lbl">Đồng ý với kết quả AI</span>
        </div>
        <div className="stat-card-doc">
          <span className="doc-stat-num text-warning">{stats.corrected_count}</span>
          <span className="doc-stat-lbl">Đã sửa lại (Re-labeled)</span>
        </div>
        <div className="stat-card-doc">
          <span className="doc-stat-num text-teal">{stats.agreement_rate}%</span>
          <span className="doc-stat-lbl">Tỷ lệ đồng thuận với AI</span>
        </div>
      </div>
    </div>
  );
}
