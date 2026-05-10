import { fetchApi } from './apiClient';
import { setCookie, removeCookie } from '../utils/cookieUtils';

export interface User {
  uuid: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  is_active: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterResponse extends User {
  access_token: string;
  token_type: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  language_preference: string;
  profile?: {
    date_of_birth: string;
    gender: string;
    blood_type?: string;
    height_cm?: number;
    weight_kg?: number;
    known_allergies?: string;
    chronic_conditions?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
  };
  clinic?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    location?: string;
  };
}

export interface DoctorRegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  language_preference: string;
  specialization_id?: string | null;
  language_spoken: 'en' | 'ar' | 'both';
  bio_en?: string;
  bio_ar?: string;
  consultation_price_egp?: number;
  years_of_experience?: number;
  license_number?: string;
}

export interface ClinicRegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  language_preference: string;
  clinic: {
    name: string;
    address: string;
    phone: string;
    email: string;
    location?: string;
  };
}

export interface AuthResponse {
  uuid: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  is_active: boolean;
}

class AuthApi {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    try {
      const response = await fetchApi('/users/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Login failed: ${response.statusText}`);
      }

      const data: LoginResponse = await response.json();
      
      // Store access token in cookies
      if (data.access_token) {
        setCookie('access_token', data.access_token);
      }

      console.log('[v0] Login successful:', data.user);
      return data;
    } catch (error) {
      console.error('[v0] Login error:', error);
      throw error;
    }
  }

  async registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
    try {
      const response = await fetchApi('/users/register/user', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Registration failed: ${response.statusText}`);
      }

      const data: RegisterResponse = await response.json();
      
      if (data.access_token) {
        setCookie('access_token', data.access_token);
      }

      console.log('[v0] User registration successful:', data);
      return data;
    } catch (error) {
      console.error('[v0] User registration error:', error);
      throw error;
    }
  }

  async registerClinic(payload: ClinicRegisterPayload): Promise<RegisterResponse> {
    try {
      const response = await fetchApi('/users/register/clinic', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Registration failed: ${response.statusText}`);
      }
      const data: RegisterResponse = await response.json();
      if (data.access_token) setCookie('access_token', data.access_token);
      return data;
    } catch (error) {
      console.error('[v0] Clinic registration error:', error);
      throw error;
    }
  }

  async registerDoctor(payload: DoctorRegisterPayload): Promise<RegisterResponse> {
    try {
      const response = await fetchApi('/users/register/doctor', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Registration failed: ${response.statusText}`);
      }
      const data: RegisterResponse = await response.json();
      if (data.access_token) setCookie('access_token', data.access_token);
      return data;
    } catch (error) {
      console.error('[v0] Doctor registration error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await fetchApi('/users/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        console.warn(`Logout request failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[v0] Logout error:', error);
    } finally {
      removeCookie('access_token');
    }
  }

  async getCurrentUser(): Promise<AuthResponse | null> {
    try {
      const response = await fetchApi('/users/me', {
        method: 'GET',
      });

      if (!response.ok) {
        return null;
      }

      const data: AuthResponse = await response.json();
      return data;
    } catch (error) {
      console.error('[v0] Get current user error:', error);
      return null;
    }
  }

  async requestPasswordReset(payload: { email: string; method: 'email' | 'phone' }): Promise<void> {
    try {
      const response = await fetchApi('/users/password-reset/request', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Password reset request failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[v0] Password reset request error:', error);
      throw error;
    }
  }

  async verifyResetCode(payload: { email: string; code: string }): Promise<void> {
    try {
      const response = await fetchApi('/users/password-reset/verify', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Code verification failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[v0] Reset code verification error:', error);
      throw error;
    }
  }

  async resetPassword(payload: { email: string; code: string; new_password: string }): Promise<void> {
    try {
      const response = await fetchApi('/users/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Password reset failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[v0] Password reset error:', error);
      throw error;
    }
  }
}

export const authApi = new AuthApi();
