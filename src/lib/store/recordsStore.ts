import { create } from 'zustand';
import { recordApi } from '../api/recordApi';

export interface RecordData {
  [key: string]: any;
}

export interface MedicalRecord {
  id: string;
  type: 'diabetesAnalysis' | 'xrayAnalysis' | 'chatSession' | 'doctorVisit';
  title: string;
  titleAr: string;
  date: string;
  data: RecordData;
  relatedBookingId?: string;
}

interface RecordsState {
  records: MedicalRecord[];
  isLoading: boolean;
  error: string | null;
  addRecord: (record: MedicalRecord) => void;
  setRecords: (records: MedicalRecord[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchRecords: () => Promise<void>;
}

export const useRecordsStore = create<RecordsState>((set) => ({
  records: [],
  isLoading: false,
  error: null,
  addRecord: (record) =>
    set((state) => ({ records: [record, ...state.records] })),
  setRecords: (records) => set({ records }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  fetchRecords: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await recordApi.getMyMedicalRecord();
      if (!data) {
        set({ records: [] });
        return;
      }

      const mappedRecords: MedicalRecord[] = [];

      // Map Diagnostics
      if (data.record.diagnostics) {
        data.record.diagnostics.forEach((d, idx) => {
          mappedRecords.push({
            id: `diag-${idx}`,
            type: 'diabetesAnalysis',
            title: 'Diabetes Analysis',
            titleAr: 'تحليل السكري',
            date: d.date,
            data: {
              ...d.key_readings,
              risk_level: d.result.risk_level,
              confidence_score: d.result.confidence_score
            }
          });
        });
      }

      // Map Radiology
      if (data.record.radiology) {
        data.record.radiology.forEach((r) => {
          mappedRecords.push({
            id: r.id,
            type: 'xrayAnalysis',
            title: 'X-Ray Analysis',
            titleAr: 'تحليل الأشعة',
            date: r.uploaded_at,
            data: {
              image_path: r.image_path,
              findings: r.findings
            }
          });
        });
      }

      set({ records: mappedRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) });
    } catch (error) {
      console.error('Failed to fetch records:', error);
      set({ error: 'Failed to fetch medical records' });
    } finally {
      set({ isLoading: false });
    }
  }
}));