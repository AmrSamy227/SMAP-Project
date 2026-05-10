import { fetchApi } from './apiClient';

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  summary?: string;
}

export const chatApi = {
  async getSessions(): Promise<ChatSession[]> {
    const res = await fetchApi('/chat/sessions', { method: 'GET' });
    if (!res.ok) throw new Error('Failed to fetch chat sessions');
    return res.json();
  },

  async deleteSession(sessionId: string): Promise<void> {
    const res = await fetchApi(`/chat/sessions/${sessionId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete chat session');
  }
};
