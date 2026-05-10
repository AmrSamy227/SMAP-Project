import { create } from 'zustand';
import { chatApi, ChatSession } from '../api/chatApi';

export interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
  specialistSuggestion?: {
    specialty: string;
    confidence: number;
  };
}

export interface Session {
  id: string;
  title: string;
  date: string;
  preview: string;
}

interface ChatState {
  sessions: Session[];
  activeSessionId: string | null;
  messages: Message[];
  isTyping: boolean;
  addMessage: (msg: Message) => void;
  setTyping: (isTyping: boolean) => void;
  setActiveSession: (id: string | null) => void;
  clearChat: () => void;
  loadSessionMessages: (sessionId: string) => void;
  fetchSessions: () => Promise<void>;
}

// Store
export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  messages: [],
  isTyping: false,
  addMessage: (msg) =>
  set((state) => ({
    messages: [...state.messages, msg]
  })),
  setTyping: (isTyping) => set({ isTyping }),
  setActiveSession: (id) => {
    set({ activeSessionId: id });
    if (id) {
      get().loadSessionMessages(id);
    } else {
      set({ messages: [] });
    }
  },
  clearChat: () => set({ messages: [], activeSessionId: null }),
  loadSessionMessages: (sessionId) => {
    // Mock loading messages based on session ID
    if (sessionId === '1') {
      set({
        messages: [
        {
          id: 'm1',
          role: 'user',
          content:
          'I have been experiencing a severe headache and a mild fever since yesterday.',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'm2',
          role: 'bot',
          content:
          'I understand you are experiencing a headache and fever. Are you also experiencing any neck stiffness, sensitivity to light, or nausea?',
          timestamp: new Date(Date.now() - 3500000).toISOString()
        }]

      });
    } else if (sessionId === '2') {
      set({
        messages: [
        {
          id: 'm3',
          role: 'user',
          content:
          'My right knee hurts when I go down stairs after my run yesterday.',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'm4',
          role: 'bot',
          content:
          "Pain when descending stairs is often associated with patellofemoral pain syndrome (runner's knee). Have you noticed any swelling or clicking sounds?",
          timestamp: new Date(Date.now() - 86300000).toISOString(),
          specialistSuggestion: {
            specialty: 'Orthopedics',
            confidence: 85
          }
        }]

      });
    } else {
      set({ messages: [] });
    }
  },
  fetchSessions: async () => {
    try {
      const data = await chatApi.getSessions();
      const mappedSessions: Session[] = data.map((s: ChatSession) => ({
        id: s.id,
        title: s.title || 'Untitled Session',
        date: s.created_at,
        preview: s.summary || ''
      }));
      set({ sessions: mappedSessions });
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error);
    }
  }
}));