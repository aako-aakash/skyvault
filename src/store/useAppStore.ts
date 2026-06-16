import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type {
  AppStore, AppPage, LoanData, PersonalData, KycData,
  AddressData, EmploymentData, CoApplicantData, DocumentsData,
} from '@/types';
import { saveDraft, loadDraft as loadDraftUtil, clearDraft } from '@/utils';

const INITIAL_STATE = {
  page: 'apply' as AppPage,
  currentStep: 1,
  loan: {} as LoanData,
  personal: {} as PersonalData,
  kyc: { panVerified: false, aadhaarVerified: false, aadhaarConsent: false } as KycData,
  address: {} as AddressData,
  employment: {} as EmploymentData,
  coApplicant: { required: false } as CoApplicantData,
  documents: { files: [], signature: null } as DocumentsData,
};

export const useAppStore = create<AppStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...INITIAL_STATE,

      setPage: (page) => set({ page }, false, 'setPage'),

      setStep: (step) => set({ currentStep: step }, false, 'setStep'),

      updateLoan: (data) =>
        set((s) => ({ loan: { ...s.loan, ...data } }), false, 'updateLoan'),

      updatePersonal: (data) =>
        set((s) => ({ personal: { ...s.personal, ...data } }), false, 'updatePersonal'),

      updateKyc: (data) =>
        set((s) => ({ kyc: { ...s.kyc, ...data } }), false, 'updateKyc'),

      updateAddress: (data) =>
        set((s) => ({ address: { ...s.address, ...data } }), false, 'updateAddress'),

      updateEmployment: (data) =>
        set((s) => ({ employment: { ...s.employment, ...data } }), false, 'updateEmployment'),

      updateCoApplicant: (data) =>
        set((s) => ({ coApplicant: { ...s.coApplicant, ...data } }), false, 'updateCoApplicant'),

      updateDocuments: (data) =>
        set((s) => ({ documents: { ...s.documents, ...data } }), false, 'updateDocuments'),

      resetApplication: () => {
        clearDraft();
        set({ ...INITIAL_STATE }, false, 'resetApplication');
      },

      loadDraft: () => {
        const draft = loadDraftUtil<Partial<AppStore>>();
        if (draft) {
          const { setPage, setStep, updateLoan, updatePersonal, updateKyc,
                  updateAddress, updateEmployment, updateCoApplicant, updateDocuments,
                  resetApplication, loadDraft: _ld, ...data } = draft;
          set({ ...INITIAL_STATE, ...data }, false, 'loadDraft');
        }
      },
    })),
    { name: 'SkyVaultStore' }
  )
);

// Auto-save subscription — saves every 30s or on any state change
let _saveTimer: ReturnType<typeof setTimeout> | null = null;
useAppStore.subscribe(
  (state) => state,
  (state) => {
    if (_saveTimer) clearTimeout(_saveTimer);
    _saveTimer = setTimeout(() => {
      const { setPage, setStep, updateLoan, updatePersonal, updateKyc,
              updateAddress, updateEmployment, updateCoApplicant,
              updateDocuments, resetApplication, loadDraft, ...data } = state;
      saveDraft(data);
    }, 30_000);
  }
);

export default useAppStore;
