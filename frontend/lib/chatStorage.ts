export interface AttachedPdf {
  filename: string;
  chunksCount: number;
  vectorsUpserted: number;
  uploadedAt: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: string;
  sources?: any[];
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  attachedPdfs: AttachedPdf[];
  messages: ChatMessage[];
}

const STORAGE_KEY = 'pdf_rag_chat_sessions_v1';

export const getChatSessions = (): ChatSession[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading chat sessions from localStorage:', e);
    return [];
  }
};

export const getChatSession = (id: string): ChatSession | undefined => {
  const sessions = getChatSessions();
  return sessions.find(s => s.id === id);
};

export const saveChatSessions = (sessions: ChatSession[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Error saving chat sessions to localStorage:', e);
  }
};

export const createChatSession = (title: string = 'New Chat'): ChatSession => {
  const sessions = getChatSessions();
  const newSession: ChatSession = {
    id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attachedPdfs: [],
    messages: [
      {
        id: `msg_welcome_${Date.now()}`,
        type: 'bot',
        text: 'Hello! How can I help you today? Upload or attach PDF documents to ask questions, extract insights, and analyze content.',
        timestamp: new Date().toISOString()
      }
    ]
  };

  saveChatSessions([newSession, ...sessions]);
  return newSession;
};

export const updateChatSession = (updatedSession: ChatSession): void => {
  const sessions = getChatSessions();
  const index = sessions.findIndex(s => s.id === updatedSession.id);
  if (index !== -1) {
    sessions[index] = {
      ...updatedSession,
      updatedAt: new Date().toISOString()
    };
  } else {
    sessions.unshift(updatedSession);
  }
  saveChatSessions(sessions);
};

export const addMessageToSession = (sessionId: string, message: ChatMessage): ChatSession | undefined => {
  const session = getChatSession(sessionId);
  if (!session) return undefined;

  // Auto update title based on first user question if title is "New Chat"
  let newTitle = session.title;
  if (session.title === 'New Chat' && message.type === 'user') {
    newTitle = message.text.length > 30 ? `${message.text.substring(0, 30)}...` : message.text;
  }

  const updatedSession: ChatSession = {
    ...session,
    title: newTitle,
    messages: [...session.messages, message],
    updatedAt: new Date().toISOString()
  };

  updateChatSession(updatedSession);
  return updatedSession;
};

export const addPdfToSession = (sessionId: string, pdf: AttachedPdf): ChatSession | undefined => {
  const session = getChatSession(sessionId);
  if (!session) return undefined;

  // Prevent duplicate PDF entries
  const existingIndex = session.attachedPdfs.findIndex(p => p.filename === pdf.filename);
  let updatedPdfs = [...session.attachedPdfs];
  if (existingIndex !== -1) {
    updatedPdfs[existingIndex] = pdf;
  } else {
    updatedPdfs.push(pdf);
  }

  const updatedSession: ChatSession = {
    ...session,
    attachedPdfs: updatedPdfs,
    updatedAt: new Date().toISOString()
  };

  updateChatSession(updatedSession);
  return updatedSession;
};

export const deleteChatSession = (id: string): ChatSession[] => {
  const sessions = getChatSessions();
  const filtered = sessions.filter(s => s.id !== id);
  saveChatSessions(filtered);
  return filtered;
};
