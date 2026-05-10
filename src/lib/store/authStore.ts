import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { UserProfile, ClinicAccount, DoctorAccount } from '../api/profileApi';
import { getCookie, setCookie, removeCookie } from '../utils/cookieUtils';

const cookieStorage: StateStorage = {
  getItem: (name) => getCookie(name),
  setItem: (name, value) => setCookie(name, value, 30),
  removeItem: (name) => removeCookie(name),
};

export interface User {
  uuid: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  is_active: boolean;
  profile_picture?: string;
  profile?: UserProfile;
  clinic_account?: ClinicAccount;
  doctor_account?: DoctorAccount;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeAuth: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => {
        if (user) {
          set({ user, isAuthenticated: true });
        } else {
          set({ user: null, isAuthenticated: false });
        }
      },

      login: (user) => {
        set({ user, isAuthenticated: true, error: null });
      },

      logout: () => {
        removeCookie('access_token');
        set({ user: null, isAuthenticated: false, error: null });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      initializeAuth: (user) => {
        set({ user, isAuthenticated: !!user, isLoading: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => cookieStorage),
    }
  )
);