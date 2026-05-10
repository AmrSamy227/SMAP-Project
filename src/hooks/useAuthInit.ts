import { useEffect } from 'react';
import { useAuthStore } from '../lib/store/authStore';
import { authApi } from '../lib/api/authApi';
import { profileApi } from '../lib/api/profileApi';
import { getCookie } from '../lib/utils/cookieUtils';

/**
 * Hook to initialize authentication from localStorage on app load
 * This ensures user remains logged in across page refreshes with all profile data
 */
export const useAuthInit = () => {
  const { isAuthenticated, user, setLoading: setIsLoading, login, logout, initializeAuth, setUser } = useAuthStore();

  useEffect(() => {
    const initializeAuthFromStorage = async () => {
      setIsLoading(true);
      const accessToken = getCookie('access_token');
      
      if (accessToken) {
        try {
          const response = await authApi.getCurrentUser();
          if (response) {
            try {
              const fullUserData = await profileApi.getCurrentUserWithProfile();
              if (fullUserData) {
                // Combine basic info with profile info
                const completeUser = {
                  ...response,
                  ...fullUserData,
                  profile: fullUserData.profile,
                  clinic_account: fullUserData.clinic_account,
                  doctor_account: fullUserData.doctor_account,
                };
                setUser(completeUser as any);
                console.log('[v0] Session verified with full profile');
              } else {
                initializeAuth(response);
              }
            } catch (profileError) {
              console.error('[v0] Failed to fetch profile:', profileError);
              initializeAuth(response);
            }
          } else {
            logout();
          }
        } catch (error) {
          console.error('[v0] Session verification failed:', error);
          logout();
        }
      } else {
        logout();
      }

      setIsLoading(false);
    };

    initializeAuthFromStorage();
  }, [setIsLoading, logout, initializeAuth, setUser]);

  return {
    isAuthenticated,
    user,
  };
};
