import React, { useState, useEffect } from 'react';
import { Home, Sparkles, Heart, Clock, Activity } from 'lucide-react';
import { petService } from '../services/petService';
import { diagnosisService } from '../services/diagnosisService';

import HomeTab from '../components/customer/HomeTab';
import DiagnosisTab from '../components/customer/DiagnosisTab';
import ProgressionTab from '../components/customer/ProgressionTab';
import PetManagementTab from '../components/customer/PetManagementTab';
import HistoryTab from '../components/customer/HistoryTab';
import AddPetModal from '../components/customer/AddPetModal';

export default function CustomerPage({ currentUser }) {
  const [activeSubTab, setActiveSubTab] = useState('home'); // 'home' | 'diagnose' | 'progression' | 'pets' | 'history'
  
  // State quản lý thú cưng
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [loadingPets, setLoadingPets] = useState(false);
  
  // Form thêm thú cưng
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState('Chó 🐶');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetAge, setNewPetAge] = useState('1.5 tuổi');
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

  useEffect(() => {
    if (currentUser?.id) {
      loadPets();
      loadHistory();
    }
  }, [currentUser]);

  const loadPets = async () => {
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
    try {
      const data = await diagnosisService.getHistory(currentUser.id);
      setHistoryRecords(data || []);
    } catch (e) {
      console.warn('Lỗi tải lịch sử:', e);
    }
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    if (!newPetName.trim()) return;
    try {
      const res = await petService.createPet(currentUser.id, {
        name: newPetName,
        species: newPetSpecies,
        breed: newPetBreed || 'Chưa rõ',
        age: newPetAge,
        weight: newPetWeight,
        notes: newPetNotes
      });
      if (res.pet) {
        setPets([res.pet, ...pets]);
        setSelectedPetId(res.pet.id);
      }
      setShowAddPetModal(false);
      setNewPetName('');
      setNewPetBreed('');
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

  const handleRunDiagnosis = async () => {
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
      loadHistory();
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
          className={`sub-tab-btn ${activeSubTab === 'progression' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('progression')}
        >
          <Activity size={16} />
          <span>Theo dõi tiến triển</span>
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
          onOpenAddPetModal={() => setShowAddPetModal(true)}
          onGoToPets={() => setActiveSubTab('pets')}
          onGoToProgression={() => setActiveSubTab('progression')}
        />
      )}

      {/* TAB 1: CHẨN ĐOÁN AI */}
      {activeSubTab === 'diagnose' && (
        <DiagnosisTab
          pets={pets}
          selectedPetId={selectedPetId}
          setSelectedPetId={setSelectedPetId}
          onOpenAddPetModal={() => setShowAddPetModal(true)}
          dayNumber={dayNumber}
          setDayNumber={setDayNumber}
          selectedSymptoms={selectedSymptoms}
          toggleSymptom={toggleSymptom}
          progressionNotes={progressionNotes}
          setProgressionNotes={setProgressionNotes}
          imagePreview={imagePreview}
          handleImageChange={handleImageChange}
          diagError={diagError}
          analyzing={analyzing}
          handleRunDiagnosis={handleRunDiagnosis}
          diagnosisResult={diagnosisResult}
        />
      )}

      {/* TAB 2: TIẾN TRIỂN THEO NGÀY */}
      {activeSubTab === 'progression' && (
        <ProgressionTab
          pets={pets}
          selectedProgressionPet={selectedProgressionPet}
          setSelectedProgressionPet={setSelectedProgressionPet}
          progressionRecords={progressionRecords}
          onGoToDiagnose={() => setActiveSubTab('diagnose')}
        />
      )}

      {/* TAB 3: HỒ SƠ THÚ CƯNG */}
      {activeSubTab === 'pets' && (
        <PetManagementTab
          pets={pets}
          onOpenAddPetModal={() => setShowAddPetModal(true)}
          handleDeletePet={handleDeletePet}
          onSelectPetToDiagnose={(id) => {
            setSelectedPetId(id);
            setActiveSubTab('diagnose');
          }}
        />
      )}

      {/* TAB 4: LỊCH SỬ CHẨN ĐOÁN */}
      {activeSubTab === 'history' && (
        <HistoryTab
          historyRecords={historyRecords}
          loadHistory={loadHistory}
        />
      )}

      {/* MODAL THÊM THÚ CƯNG MỚI */}
      <AddPetModal
        show={showAddPetModal}
        onClose={() => setShowAddPetModal(false)}
        onSubmit={handleAddPet}
        petName={newPetName}
        setPetName={setNewPetName}
        species={newPetSpecies}
        setSpecies={setNewPetSpecies}
        breed={newPetBreed}
        setBreed={setNewPetBreed}
        age={newPetAge}
        setAge={setNewPetAge}
        weight={newPetWeight}
        setWeight={setNewPetWeight}
        notes={newPetNotes}
        setNotes={setNewPetNotes}
      />
    </div>
  );
}
