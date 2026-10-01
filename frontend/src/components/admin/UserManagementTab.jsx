import React from 'react';
import { CheckCircle, Lock, Unlock } from 'lucide-react';

export default function UserManagementTab({
  filteredUsers,
  userRoleFilter,
  setUserRoleFilter,
  handleApproveDoctor,
  handleToggleUserStatus
}) {
  return (
    <div className="card users-mgmt-section">
      <div className="card-header flex-between">
        <div>
          <h2>👥 Quản Lý Tài Khoản Khách Hàng & Bác Sĩ Thú Y</h2>
          <p className="card-subtitle">Phê duyệt Bác sĩ, quản lý quyền hạn và khóa/mở khóa tài khoản</p>
        </div>

        <div className="filter-role-group">
          <label className="mr-2">Lọc vai trò:</label>
          <select 
            className="custom-select"
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value)}
          >
            <option value="all">Tất cả tài khoản</option>
            <option value="customer">Chỉ Khách Hàng (Chủ nuôi)</option>
            <option value="doctor">Chỉ Bác Sĩ Thú Y</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper mt-3">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Tài Khoản</th>
              <th>Họ Tên & Liên Hệ</th>
              <th>Vai Trò</th>
              <th>Nơi Công Tác / Chuyên Môn</th>
              <th>Trạng Thái</th>
              <th>Thao Tác Quản Trị</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id}>
                <td>
                  <strong>@{u.username}</strong>
                </td>
                <td>
                  <div><strong>{u.full_name || 'Người dùng'}</strong></div>
                  <span className="text-muted small">{u.phone || 'Chưa cập nhật SĐT'} • {u.email}</span>
                </td>
                <td>
                  {u.role === 'admin' ? (
                    <span className="badge-role admin">Quản trị viên</span>
                  ) : u.role === 'doctor' ? (
                    <span className="badge-role doctor">Bác Sĩ Thú Y</span>
                  ) : (
                    <span className="badge-role customer">Khách Hàng</span>
                  )}
                </td>
                <td>
                  {u.role === 'doctor' ? (
                    <div>
                      <strong>{u.clinic_name || 'Bệnh viện Thú Y'}</strong>
                      <div className="text-muted small">{u.specialty || 'Da liễu thú nhỏ'}</div>
                    </div>
                  ) : (
                    <span className="text-muted">Chủ nuôi thú cưng</span>
                  )}
                </td>
                <td>
                  {u.status === 'locked' ? (
                    <span className="badge-danger">Đã khóa</span>
                  ) : u.status === 'pending_approval' ? (
                    <span className="badge-warning">Chờ duyệt</span>
                  ) : (
                    <span className="badge-success">Đang hoạt động</span>
                  )}
                </td>
                <td>
                  <div className="table-actions">
                    {u.role === 'doctor' && u.status === 'pending_approval' && (
                      <button 
                        className="btn-sm btn-approve-doc"
                        onClick={() => handleApproveDoctor(u)}
                      >
                        <CheckCircle size={14} /> Duyệt Bác Sĩ
                      </button>
                    )}

                    {u.role !== 'admin' && (
                      <button 
                        className={`btn-sm ${u.status === 'locked' ? 'btn-unlock' : 'btn-lock'}`}
                        onClick={() => handleToggleUserStatus(u)}
                      >
                        {u.status === 'locked' ? (
                          <><Unlock size={14} /> Mở Khóa</>
                        ) : (
                          <><Lock size={14} /> Khóa TK</>
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
