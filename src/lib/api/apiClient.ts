import { useAuthStore } from '../store/authStore';

const API_BASE_URL = 'https://yousefmohamed.pythonanywhere.com';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function fetchApi(endpoint: string, options: RequestOptions = {}) {
  const token = localStorage.getItem('access_token');
  
  const isFormData = options.body instanceof FormData;
  
  const headers = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      console.warn('[v0] Unauthorized! Redirecting to login...');
      
      // Clear auth state and storage
      useAuthStore.getState().logout();
      localStorage.removeItem('access_token');
      
      // Force redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        const locale = window.location.pathname.split('/')[1] || 'en';
        const targetUrl = `/${locale}/login`;
        window.location.href = targetUrl;
      }
      
      throw new Error('Unauthorized');
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    console.error(`[v0] API call failed: ${url}`, error);
    throw error;
  }
}
