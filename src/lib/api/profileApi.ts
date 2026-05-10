import { fetchApi } from './apiClient';

export interface UserProfile {
  id?: string;
  date_of_birth: string;
  gender: string;
  blood_type?: string;
  height_cm?: number;
  weight_kg?: number;
  known_allergies?: string;
  chronic_conditions?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface ClinicAccount {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  location?: string;
}

export interface DoctorAccount {
  id: string;
  user_id: string;
  full_name: string;
  specialization_id: string;
  language_spoken: string;
  bio_en?: string;
  bio_ar?: string;
  consultation_price_egp?: number;
  years_of_experience?: number;
  license_number?: string;
  is_active: boolean;
  is_verified: boolean;
  average_rating?: number;
  rating_count?: number;
  specialization?: {
    name_en: string;
    name_ar: string;
    id: string;
    created_at: string;
    updated_at: string;
  };
  created_at?: string;
  updated_at?: string;
  doctor_clinics?: {
    id: string;
    clinic_id: string;
    is_primary: boolean;
    is_active: boolean;
    clinic: {
      id: string;
      name: string;
      address: string;
    };
  }[];
}

export interface UserWithProfile {
  uuid: string;
  email: string;
  phone: string;
  full_name: string;
  language_preference: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profile_picture?: string;
  profile?: UserProfile;
  clinic_account?: ClinicAccount;
  doctor_account?: DoctorAccount;
}

class ProfileApi {
  async getCurrentUserWithProfile(): Promise<UserWithProfile | null> {
    try {
      const response = await fetchApi('/users/me', {
        method: 'GET',
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  }

  async updateUserProfile(_userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    const response = await fetchApi('/users/me/profile', {
      method: 'PATCH',
      body: JSON.stringify(profile),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return await response.json();
  }

  async updateClinicProfile(_userId: string, clinic: Partial<ClinicAccount>): Promise<ClinicAccount> {
    const response = await fetchApi('/users/me/clinic', {
      method: 'PATCH',
      body: JSON.stringify(clinic),
    });
    if (!response.ok) throw new Error('Failed to update clinic');
    return await response.json();
  }

  async updateDoctorProfile(_userId: string, doctor: Partial<DoctorAccount>): Promise<DoctorAccount> {
    const response = await fetchApi('/users/me/doctor', {
      method: 'PATCH',
      body: JSON.stringify(doctor),
    });
    if (!response.ok) throw new Error('Failed to update doctor profile');
    return await response.json();
  }

  async getDoctorProfile(doctorId?: string): Promise<DoctorAccount> {
    const url = doctorId ? `/users/me/doctor?doctor_id=${doctorId}` : '/users/me/doctor';
    const response = await fetchApi(url, {
      method: 'GET',
    });
    if (!response.ok) throw new Error('Failed to fetch doctor profile');
    return await response.json();
  }

  async updateUserInfo(userInfo: { full_name: string; email: string; phone: string }): Promise<any> {
    const response = await fetchApi('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userInfo),
    });
    if (!response.ok) throw new Error('Failed to update user info');
    return await response.json();
  }
}

export const profileApi = new ProfileApi();