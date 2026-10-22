import React, { useState, useEffect } from 'react';
import { Home, Sparkles, Heart, Clock, CalendarCheck, LogIn, UserPlus } from 'lucide-react';
import { petService } from '../services/petService';
import { diagnosisService } from '../services/diagnosisService';

import HomeTab from '../components/customer/HomeTab';
import DiagnosisTab from '../components/customer/DiagnosisTab';
import AppointmentBookingTab from '../components/customer/AppointmentBookingTab';
import PetManagementTab from '../components/customer/PetManagementTab';
import HistoryTab from '../components/customer/HistoryTab';
import AddPetModal from '../components/customer/AddPetModal';

function GuestPromptCard({ title, desc, onRequireAuth }) {
  return (
    <div className="guest-feature-lock-card animate-fadeIn">
      <div className="guest-lock-art">🐾🔐</div>
      <h3 className="guest-lock-title">{title}</h3>
      <p className="guest-lock-desc">{desc}</p>
      <div className="guest-lock-btns">
        <button type="button" className="ht-btn-primary" onClick={() => onRequireAuth?.('login')}>
          <LogIn size={16} /> Đăng nhập ngay
        </button>
        <button type="button" className="ht-btn-ghost" onClick={() => onRequireAuth?.('register')}>
          <UserPlus size={16} /> Đăng ký tài khoản mới (Gmail OTP)
        </button>
      </div>
    </div>
  );
}

export default function CustomerPage({ currentUser, onRequireAuth }) {
  const [activeSubTab, setActiveSubTab] = useState('home'); // 'home' | 'diagnose' | 'appointments' | 'pets' | 'history'
  
  // State quản lý thú cưng
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [loadingPets, setLoadingPets] = useState(false);
  
  // Form thêm thú cưng
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState('Chó 🐶');
  const [newPetWeight, setNewPetWeight] = useState('4.5 kg');
  const [newPetNotes, setNewPetNotes] = useState('');

  // State Chẩn đoán AI
  const [selectedSymptoms, setSelectedSymptoms] = useState(['Không có']);
  const [dayNumber, setDayNumber] = useState(1);
  const [progressionNotes, setProgressionNotes] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [diagError, setDiagError] = useState('');

  // State Lịch sử & Tiến triển
  const [historyRecords, setHistoryRecords] = useState([]);
  const [selectedProgressionPet, setSelectedProgressionPet] = useState('all');

  // Dữ liệu đặt lịch chuyển tiếp từ kết quả chẩn đoán AI
  const [bookingInitialData, setBookingInitialData] = useState(null);

  const handleBookFromDiagnosis = (data) => {
    setBookingInitialData(data);
    setActiveSubTab('appointments');
  };

  useEffect(() => {
    if (currentUser?.id) {
      loadPets();
      loadHistory();
    } else {
      setPets([]);
      setHistoryRecords([]);
    }
  }, [currentUser]);

  const loadPets = async () => {
    if (!currentUser?.id) return;
    setLoadingPets(true);
    try {
      const data = await petService.getPets(currentUser.id);
      setPets(data || []);
      if (data && data.length > 0 && !selectedPetId) {
        setSelectedPetId(data[0].id);
      }
    } catch (e) {
      console.warn('Lỗi tải danh sách thú cưng:', e);
    } finally {
      setLoadingPets(false);
    }
  };

  const loadHistory = async () => {
    if (!currentUser?.id) return;
    try {
      const data = await diagnosisService.getHistory(currentUser.id);
      setHistoryRecords(data || []);
    } catch (e) {
      console.warn('Lỗi tải lịch sử:', e);
    }
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setShowAddPetModal(false);
      onRequireAuth?.('login');
      return;
    }
    if (!newPetName.trim()) return;
    try {
      const res = await petService.createPet(currentUser.id, {
        name: newPetName.trim(),
        species: newPetSpecies,
        breed: '',
        age: '',
        weight: newPetWeight.trim() || 'Chưa rõ cân nặng',
        notes: newPetNotes.trim()
      });
      if (res.pet) {
        setPets([res.pet, ...pets]);
        setSelectedPetId(res.pet.id);
      }
      setShowAddPetModal(false);
      setNewPetName('');
      setNewPetWeight('4.5 kg');
      setNewPetNotes('');
    } catch (err) {
      alert('Lỗi tạo thú cưng: ' + err.message);
    }
  };

  const handleDeletePet = async (petId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hồ sơ thú cưng này?')) return;
    try {
      await petService.deletePet(petId);
      setPets(pets.filter(p => p.id !== petId));
      if (selectedPetId === petId && pets.length > 1) {
        setSelectedPetId(pets.find(p => p.id !== petId)?.id || '');
      }
    } catch (e) {
      alert('Không thể xóa thú cưng: ' + e.message);
    }
  };

  const toggleSymptom = (sym) => {
    if (sym === 'Không có' || sym === 'Không có triệu chứng') {
      if (selectedSymptoms.includes(sym)) {
        setSelectedSymptoms([]);
      } else {
        setSelectedSymptoms([sym]);
      }
      return;
    }

    const withoutNone = selectedSymptoms.filter(s => s !== 'Không có' && s !== 'Không có triệu chứng');
    if (withoutNone.includes(sym)) {
      setSelectedSymptoms(withoutNone.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...withoutNone, sym]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setDiagnosisResult(null);
    setDiagError('');
  };

  const handleCapturedImage = (file, dataUrl) => {
    setImageFile(file);
    setImagePreview(dataUrl);
    setDiagnosisResult(null);
    setDiagError('');
  };

  const handleRunDiagnosis = async () => {
    if (!currentUser) {
      setDiagError('Vui lòng đăng nhập để thực hiện phân tích và lưu kết quả vào bệnh án bé cưng!');
      onRequireAuth?.('login');
      return;
    }

    if (!imageFile) {
      setDiagError('Vui lòng tải lên hoặc chụp ảnh vùng da tổn thương của thú cưng!');
      return;
    }
    setDiagError('');
    setAnalyzing(true);

    try {
      const pet = pets.find(p => p.id === selectedPetId) || {};
      const formData = new FormData();
      formData.append('user_id', currentUser.id);
      if (selectedPetId) formData.append('pet_id', selectedPetId);
      formData.append('pet_name', pet.name || 'Bé cưng');
      formData.append('species', pet.species || 'Chó 🐶');
      formData.append('breed', pet.breed || 'Chưa rõ');
      formData.append('symptoms', JSON.stringify(selectedSymptoms));
      formData.append('day_number', dayNumber);
      formData.append('progression_notes', progressionNotes);
      formData.append('image', imageFile);

      const res = await diagnosisService.runDiagnosis(formData);
      setDiagnosisResult(res.diagnosis);
      if (res.is_valid_image !== false) {
        loadHistory();
      }
    } catch (err) {
      setDiagError(err.message || 'Lỗi phân tích AI!');
    } finally {
      setAnalyzing(false);
    }
  };

  const progressionRecords = historyRecords.filter(r => {
    if (selectedProgressionPet === 'all') return true;
    return r.pet_id === selectedProgressionPet;
  });

  const handleStartDiagnose = (petId = null) => {
    if (petId) {
      setSelectedPetId(petId);
    }
    setActiveSubTab('diagnose');
  };

  const handleOpenAddPet = () => {
    if (!currentUser) {
      onRequireAuth?.('login');
    } else {
      setShowAddPetModal(true);
    }
  };

  return (
    <div className="portal-container customer-portal">
      {/* Sub Navigation Bar */}
      <div className="sub-nav-tabs">
        <button 
          className={`sub-tab-btn ${activeSubTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('home')}
        >
          <Home size={16} />
          <span>Trang chủ</span>
        </button>
        <button 
          className={`sub-tab-btn ${activeSubTab === 'diagnose' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('diagnose')}
        >
          <Sparkles size={16} />
          <span>Chẩn đoán AI</span>
        </button>
        <button 
          className={`sub-tab-btn ${activeSubTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('appointments')}
        >
          <CalendarCheck size={16} />
          <span>Đặt lịch khám Bệnh viện</span>
        </button>
        <button 
          className={`sub-tab-btn ${activeSubTab === 'pets' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('pets')}
        >
          <Heart size={16} />
          <span>Hồ sơ thú cưng</span>
        </button>
        <button 
          className={`sub-tab-btn ${activeSubTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('history')}
        >
          <Clock size={16} />
          <span>Lịch sử</span>
        </button>
      </div>

      {/* TAB 0: TRANG CHỦ */}
      {activeSubTab === 'home' && (
        <HomeTab
          currentUser={currentUser}
          pets={pets}
          historyRecords={historyRecords}
          onStartDiagnose={handleStartDiagnose}
          onOpenAddPetModal={handleOpenAddPet}
          onGoToPets={() => setActiveSubTab('pets')}
          onGoToAppointments={() => setActiveSubTab('appointments')}
          onRequireAuth={onRequireAuth}
        />
      )}

      {/* TAB 1: CHẨN ĐOÁN AI */}
      {activeSubTab === 'diagnose' && (
        <DiagnosisTab
          currentUser={currentUser}
          pets={pets}
          selectedPetId={selectedPetId}
          setSelectedPetId={setSelectedPetId}
          onOpenAddPetModal={handleOpenAddPet}
          dayNumber={dayNumber}
          setDayNumber={setDayNumber}
          selectedSymptoms={selectedSymptoms}
          toggleSymptom={toggleSymptom}
          progressionNotes={progressionNotes}
          setProgressionNotes={setProgressionNotes}
          imagePreview={imagePreview}
          handleImageChange={handleImageChange}
          handleCapturedImage={handleCapturedImage}
          diagError={diagError}
          analyzing={analyzing}
          handleRunDiagnosis={handleRunDiagnosis}
          diagnosisResult={diagnosisResult}
          onBookAppointment={handleBookFromDiagnosis}
        />
      )}

      {/* TAB 2: ĐẶT LỊCH KHÁM TẠI BỆNH VIỆN PAWDERM */}
      {activeSubTab === 'appointments' && (
        !currentUser ? (
          <GuestPromptCard
            title="Đặt Lịch Khám Tại Bệnh Viện Thú Y PawDerm"
            desc="Đăng nhập để đặt lịch khám trực tiếp với Bác sĩ chuyên khoa, nhận kết quả khám sơ bộ và hướng dẫn chuẩn bị điều trị."
            onRequireAuth={onRequireAuth}
          />
        ) : (
          <AppointmentBookingTab
            currentUser={currentUser}
            pets={pets}
            initialBookingData={bookingInitialData}
            onOpenAddPetModal={handleOpenAddPet}
            onRequireAuth={onRequireAuth}
            recentDiagnosis={diagnosisResult}
            historyRecords={historyRecords}
          />
        )
      )}

      {/* TAB 3: HỒ SƠ THÚ CƯNG */}
      {activeSubTab === 'pets' && (
        !currentUser ? (
          <GuestPromptCard
            title="Quản Lý Hồ Sơ Thú Cưng Cá Nhân"
            desc="Đăng nhập để thêm danh sách chó mèo của bạn, ghi chú cân nặng, chủng loài và theo dõi lịch sử bệnh án chi tiết."
            onRequireAuth={onRequireAuth}
          />
        ) : (
          <PetManagementTab
            pets={pets}
            onOpenAddPetModal={() => setShowAddPetModal(true)}
            handleDeletePet={handleDeletePet}
            onSelectPetToDiagnose={(id) => {
              setSelectedPetId(id);
              setActiveSubTab('diagnose');
            }}
          />
        )
      )}

      {/* TAB 4: LỊCH SỬ CHẨN ĐOÁN */}
      {activeSubTab === 'history' && (
        !currentUser ? (
          <GuestPromptCard
            title="Lịch Sử Chẩn Đoán & Ý Kiến Bác Sĩ"
            desc="Đăng nhập để xem lại toàn bộ các lần quét bệnh bằng AI, kết quả thẩm định và đơn thuốc hướng dẫn từ bác sĩ thú y."
            onRequireAuth={onRequireAuth}
          />
        ) : (
          <HistoryTab
            historyRecords={historyRecords}
            loadHistory={loadHistory}
          />
        )
      )}

      {/* MODAL THÊM THÚ CƯNG MỚI */}
      {currentUser && (
        <AddPetModal
          show={showAddPetModal}
          onClose={() => setShowAddPetModal(false)}
          onSubmit={handleAddPet}
          petName={newPetName}
          setPetName={setNewPetName}
          species={newPetSpecies}
          setSpecies={setNewPetSpecies}
          weight={newPetWeight}
          setWeight={setNewPetWeight}
          notes={newPetNotes}
          setNotes={setNewPetNotes}
        />
      )}
    </div>
  );
}
