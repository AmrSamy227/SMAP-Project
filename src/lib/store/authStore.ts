import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile, ClinicAccount, DoctorAccount } from '../api/profileApi';
import { removeCookie } from '../utils/cookieUtils';

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
  token?: string; // Add token here for convenience
}

interface AuthState {
  user: User | null;
  token: string | null; // Explicitly store token
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null, token?: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeAuth: (user: User | null, token?: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true, // Start with loading true to allow useAuthInit to run
      error: null,

      setUser: (user, token) => {
        if (user) {
          set((state) => ({ 
            user, 
            token: token || state.token, 
            isAuthenticated: true, 
            isLoading: false 
          }));
        } else {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },

      login: (user, token) => {
        set({ user, token, isAuthenticated: true, error: null, isLoading: false });
      },

      logout: () => {
        removeCookie('access_token');
        set({ user: null, token: null, isAuthenticated: false, error: null, isLoading: false });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      initializeAuth: (user, token) => {
        set((state) => ({ 
          user, 
          token: token || state.token, 
          isAuthenticated: !!user, 
          isLoading: false 
        }));
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);