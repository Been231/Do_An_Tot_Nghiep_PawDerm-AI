/**
 * PawDerm AI - API Service Gateway (Aggregate & Backward-Compatibility Layer)
 * Tổng hợp toàn bộ các service nhỏ theo domain để tương thích ngược 100% với code hiện hữu.
 */

import { authService } from './authService';
import { petService } from './petService';
import { diagnosisService } from './diagnosisService';
import { doctorService } from './doctorService';
import { adminService } from './adminService';

export const apiService = {
  // 1. Auth & Profile
  login: authService.login,
  register: authService.register,
  updateProfile: authService.updateProfile,

  // 2. Pet Management
  getPets: petService.getPets,
  createPet: petService.createPet,
  deletePet: petService.deletePet,

  // 3. AI Diagnosis & History
  runDiagnosis: diagnosisService.runDiagnosis,
  getHistory: diagnosisService.getHistory,

  // 4. Doctor Review & Active Learning
  getDoctorQueue: doctorService.getDoctorQueue,
  submitDoctorReview: doctorService.submitDoctorReview,
  getDoctorStats: doctorService.getDoctorStats,

  // 5. Admin & Retrain
  getAdminUsers: adminService.getAdminUsers,
  setUserStatus: adminService.setUserStatus,
  getDiseaseDictionary: adminService.getDiseaseDictionary,
  saveDisease: adminService.saveDisease,
  deleteDisease: adminService.deleteDisease,
  getAdminDataset: adminService.getAdminDataset,
  exportDataset: adminService.exportDataset,
  getDashboardMetrics: adminService.getDashboardMetrics
};

export { authService, petService, diagnosisService, doctorService, adminService };
