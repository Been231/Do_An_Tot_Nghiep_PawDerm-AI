import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Database, BarChart3 } from 'lucide-react';
import { adminService } from '../services/adminService';

import AdminDashboardTab from '../components/admin/AdminDashboardTab';
import UserManagementTab from '../components/admin/UserManagementTab';
import DiseaseDictionaryTab from '../components/admin/DiseaseDictionaryTab';
import DiseaseModal from '../components/admin/DiseaseModal';
import DatasetRetrainTab from '../components/admin/DatasetRetrainTab';

export default function AdminPage({ currentUser }) {
  const [adminTab, setAdminTab] = useState('dashboard'); // 'dashboard' | 'users' | 'dictionary' | 'dataset'
  
  // State Dashboard
  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // State Quản lý người dùng
  const [usersList, setUsersList] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('all'); // 'all' | 'customer' | 'doctor'
  const [loadingUsers, setLoadingUsers] = useState(false);

  // State Từ điển bệnh học
  const [diseases, setDiseases] = useState([]);
  const [loadingDiseases, setLoadingDiseases] = useState(false);
  const [showDiseaseModal, setShowDiseaseModal] = useState(false);
  const [editingDisease, setEditingDisease] = useState(null);
  const [diseaseForm, setDiseaseForm] = useState({
    disease_key: '',
    name_vi: '',
    name_en: '',
    cause: '',
    clinical_symptoms_text: '',
    severity_level: 'Trung bình',
    is_zoonotic: false,
    zoonotic_warning: '',
    home_first_aid_text: '',
    emergency_signs_text: ''
  });

  // State Quản lý Dataset Retrain
  const [dataset, setDataset] = useState([]);
  const [onlyCorrected, setOnlyCorrected] = useState(false);
  const [loadingDataset, setLoadingDataset] = useState(false);

  useEffect(() => {
    loadDashboard();
    loadUsers();
    loadDiseases();
    loadDataset();
  }, []);

  const loadDashboard = async () => {
    setLoadingMetrics(true);
    try {
      const data = await adminService.getDashboardMetrics();
      setMetrics(data);
    } catch (e) {
      console.warn('Lỗi dashboard:', e);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await adminService.getAdminUsers();
      setUsersList(data || []);
    } catch (e) {
      console.warn('Lỗi tải danh sách người dùng:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadDiseases = async () => {
    setLoadingDiseases(true);
    try {
      const data = await adminService.getDiseaseDictionary();
      setDiseases(data || []);
    } catch (e) {
      console.warn('Lỗi tải từ điển bệnh:', e);
    } finally {
      setLoadingDiseases(false);
    }
  };

  const loadDataset = async (filterCorrected = onlyCorrected) => {
    setLoadingDataset(true);
    try {
      const data = await adminService.getAdminDataset(filterCorrected);
      setDataset(data || []);
    } catch (e) {
      console.warn('Lỗi tải dataset:', e);
    } finally {
      setLoadingDataset(false);
    }
  };

  const handleToggleUserStatus = async (user) => {
    const newStatus = user.status === 'locked' ? 'active' : 'locked';
    const actionName = newStatus === 'locked' ? 'khóa' : 'mở khóa';
    if (!window.confirm(`Bạn có chắc muốn ${actionName} tài khoản "${user.username}"?`)) return;

    try {
      await adminService.setUserStatus(user.id, newStatus);
      setUsersList(usersList.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (e) {
      alert('Lỗi cập nhật: ' + e.message);
    }
  };

  const handleApproveDoctor = async (user) => {
    try {
      await adminService.setUserStatus(user.id, 'active');
      alert(`✅ Đã phê duyệt cấp quyền Bác sĩ cho "${user.full_name || user.username}"!`);
      setUsersList(usersList.map(u => u.id === user.id ? { ...u, status: 'active' } : u));
    } catch (e) {
      alert('Lỗi: ' + e.message);
    }
  };

  const handleOpenDiseaseModal = (d = null) => {
    if (d) {
      setEditingDisease(d);
      setDiseaseForm({
        disease_key: d.disease_key,
        name_vi: d.name_vi,
        name_en: d.name_en,
        cause: d.cause || '',
        clinical_symptoms_text: Array.isArray(d.clinical_symptoms) ? d.clinical_symptoms.join('\n') : '',
        severity_level: d.severity_level || 'Trung bình',
        is_zoonotic: d.is_zoonotic || false,
        zoonotic_warning: d.zoonotic_warning || '',
        home_first_aid_text: Array.isArray(d.home_first_aid) ? d.home_first_aid.join('\n') : '',
        emergency_signs_text: Array.isArray(d.emergency_signs) ? d.emergency_signs.join('\n') : ''
      });
    } else {
      setEditingDisease(null);
      setDiseaseForm({
        disease_key: '',
        name_vi: '',
        name_en: '',
        cause: '',
        clinical_symptoms_text: '',
        severity_level: 'Trung bình',
        is_zoonotic: false,
        zoonotic_warning: '',
        home_first_aid_text: '',
        emergency_signs_text: ''
      });
    }
    setShowDiseaseModal(true);
  };

  const handleSaveDisease = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        disease_key: diseaseForm.disease_key.toLowerCase().trim(),
        name_vi: diseaseForm.name_vi,
        name_en: diseaseForm.name_en,
        cause: diseaseForm.cause,
        clinical_symptoms: diseaseForm.clinical_symptoms_text.split('\n').filter(s => s.trim()),
        severity_level: diseaseForm.severity_level,
        severity_badge: diseaseForm.severity_level === 'Nguy hiểm' ? 'badge-danger' : 'badge-warning',
        is_zoonotic: diseaseForm.is_zoonotic,
        zoonotic_warning: diseaseForm.zoonotic_warning,
        home_first_aid: diseaseForm.home_first_aid_text.split('\n').filter(s => s.trim()),
        emergency_signs: diseaseForm.emergency_signs_text.split('\n').filter(s => s.trim())
      };

      await adminService.saveDisease(payload);
      alert('Đã lưu thông tin bệnh vào từ điển thành công!');
      setShowDiseaseModal(false);
      loadDiseases();
    } catch (e) {
      alert('Lỗi lưu từ điển: ' + e.message);
    }
  };

  const handleDeleteDisease = async (key) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bệnh "${key}" khỏi từ điển?`)) return;
    try {
      await adminService.deleteDisease(key);
      setDiseases(diseases.filter(d => d.disease_key !== key));
    } catch (e) {
      alert('Lỗi xóa: ' + e.message);
    }
  };

  const handleExportDataset = async () => {
    try {
      const data = await adminService.exportDataset();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `pawderm_retrain_dataset_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      alert(`📥 Đã xuất thành công tập dữ liệu gồm ${data.total_samples} ca bệnh (${data.hard_cases_count} ca Bác sĩ sửa lại) để đưa vào Retrain YOLOv8!`);
    } catch (e) {
      alert('Lỗi xuất dữ liệu: ' + e.message);
    }
  };

  const filteredUsers = usersList.filter(u => {
    if (userRoleFilter === 'all') return true;
    return u.role === userRoleFilter;
  });

  return (
    <div className="portal-container admin-portal">
      {/* Sub Navigation Admin */}
      <div className="sub-nav-tabs">
        <button 
          className={`sub-tab-btn ${adminTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setAdminTab('dashboard')}
        >
          <BarChart3 size={16} />
          <span>Bảng điều khiển</span>
        </button>
        <button 
          className={`sub-tab-btn ${adminTab === 'users' ? 'active' : ''}`}
          onClick={() => setAdminTab('users')}
        >
          <Users size={16} />
          <span>Quản lý người dùng</span>
        </button>
        <button 
          className={`sub-tab-btn ${adminTab === 'dictionary' ? 'active' : ''}`}
          onClick={() => setAdminTab('dictionary')}
        >
          <BookOpen size={16} />
          <span>Từ điển bệnh</span>
        </button>
        <button 
          className={`sub-tab-btn ${adminTab === 'dataset' ? 'active' : ''}`}
          onClick={() => setAdminTab('dataset')}
        >
          <Database size={16} />
          <span>Quản lý data</span>
        </button>
      </div>

      {/* TAB 1: DASHBOARD */}
      {adminTab === 'dashboard' && (
        <AdminDashboardTab metrics={metrics} />
      )}

      {/* TAB 2: QUẢN LÝ NGƯỜI DÙNG */}
      {adminTab === 'users' && (
        <UserManagementTab
          filteredUsers={filteredUsers}
          userRoleFilter={userRoleFilter}
          setUserRoleFilter={setUserRoleFilter}
          handleApproveDoctor={handleApproveDoctor}
          handleToggleUserStatus={handleToggleUserStatus}
        />
      )}

      {/* TAB 3: TỪ ĐIỂN BỆNH HỌC */}
      {adminTab === 'dictionary' && (
        <DiseaseDictionaryTab
          diseases={diseases}
          onOpenDiseaseModal={handleOpenDiseaseModal}
          handleDeleteDisease={handleDeleteDisease}
        />
      )}

      {/* TAB 4: DATASET RETRAIN */}
      {adminTab === 'dataset' && (
        <DatasetRetrainTab
          dataset={dataset}
          onlyCorrected={onlyCorrected}
          setOnlyCorrected={setOnlyCorrected}
          loadDataset={loadDataset}
          handleExportDataset={handleExportDataset}
        />
      )}

      {/* MODAL THÊM / SỬA TỪ ĐIỂN BỆNH */}
      <DiseaseModal
        show={showDiseaseModal}
        onClose={() => setShowDiseaseModal(false)}
        onSubmit={handleSaveDisease}
        editingDisease={editingDisease}
        diseaseForm={diseaseForm}
        setDiseaseForm={setDiseaseForm}
      />
    </div>
  );
}
