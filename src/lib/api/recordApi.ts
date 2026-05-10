import { fetchApi } from './apiClient';

export interface DiagnosticRecord {
  date: string;
  key_readings: Record<string, { value: number; unit: string }>;
  result: {
    risk_level: string;  // "0" = Low, "1" = High
    confidence_score: number; // 0–1
  };
}

export interface RadiologyFinding {
  id: string;
  finding_name: string;
  confidence_score: number;
}

export interface RadiologyRecord {
  id: string;
  image_path: string;
  uploaded_at: string;
  findings: RadiologyFinding[];
}

export interface BackendMedicalRecord {
  id: string;
  user_id: string;
  record: {
    diagnostics: DiagnosticRecord[];
    radiology: RadiologyRecord[];
  };
  generated_at: string;
}

class RecordApi {
  async getMyMedicalRecord(): Promise<BackendMedicalRecord | null> {
    try {
      const response = await fetchApi('/records/me', {
        method: 'GET',
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch medical record');
      }
      return await response.json();
    } catch (error) {
      console.error('RecordApi Error:', error);
      return null;
    }
  }

  async getMedicalRecordPdfUrl(): Promise<string> {
    const response = await fetchApi('/records/me/export-pdf', {
      method: 'GET',
    });
    if (!response.ok) throw new Error('Failed to fetch PDF');
    const blob = await response.blob();
    return window.URL.createObjectURL(blob);
  }

  async exportMedicalRecordPdf(): Promise<void> {
    try {
      const response = await fetchApi('/records/me/export-pdf', {
        method: 'GET',
      });

      if (!response.ok) throw new Error('Failed to export PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medical_record_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF Export Error:', error);
      throw error;
    }
  }

  async exportUserMedicalRecordPdf(userId: string): Promise<void> {
    try {
      const response = await fetchApi(`/records/user/${userId}/export-pdf`, {
        method: 'GET',
      });

      if (!response.ok) throw new Error('Failed to export PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medical_record_${userId}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF Export Error:', error);
      throw error;
    }
  }
  async getUserMedicalRecordPdfUrl(userId: string): Promise<string> {
    const response = await fetchApi(`/records/user/${userId}/export-pdf`, {
      method: 'GET',
    });
    if (!response.ok) throw new Error('Failed to fetch PDF');
    const blob = await response.blob();
    return window.URL.createObjectURL(blob);
  }
}

export const recordApi = new RecordApi();
