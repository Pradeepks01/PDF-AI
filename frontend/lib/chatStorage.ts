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

const getStorageKey = (email?: string): string => {
  if (!email || email.trim() === '') return 'pdf_rag_chat_sessions_guest';
  const clean = email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `pdf_rag_chat_sessions_${clean}`;
};

export const getChatSessions = (userEmail?: string): ChatSession[] => {
  if (typeof window === 'undefined') return [];
  try {
    const key = getStorageKey(userEmail);
    const data = localStorage.getItem(key);
    if (!data) return [];
    const parsed: ChatSession[] = JSON.parse(data);
    // Sanitize sessions by removing transient generating placeholders
    return parsed.map(sess => ({
      ...sess,
      messages: (sess.messages || []).filter(m => m.text !== '__GENERATING__')
    }));
  } catch (e) {
    console.error('Error reading chat sessions from localStorage:', e);
    return [];
  }
};

export const getChatSession = (id: string, userEmail?: string): ChatSession | undefined => {
  const sessions = getChatSessions(userEmail);
  return sessions.find(s => s.id === id);
};

export const saveChatSessions = (sessions: ChatSession[], userEmail?: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const key = getStorageKey(userEmail);
    localStorage.setItem(key, JSON.stringify(sessions));
  } catch (e) {
    console.error('Error saving chat sessions to localStorage:', e);
  }
};

export const createChatSession = (title: string = 'New Chat', userEmail?: string): ChatSession => {
  const sessions = getChatSessions(userEmail);
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

  saveChatSessions([newSession, ...sessions], userEmail);
  return newSession;
};

export const updateChatSession = (updatedSession: ChatSession, userEmail?: string): void => {
  const sessions = getChatSessions(userEmail);
  const index = sessions.findIndex(s => s.id === updatedSession.id);
  if (index !== -1) {
    sessions[index] = {
      ...updatedSession,
      updatedAt: new Date().toISOString()
    };
  } else {
    sessions.unshift(updatedSession);
  }
  saveChatSessions(sessions, userEmail);
};

export const addMessageToSession = (sessionId: string, message: ChatMessage, userEmail?: string): ChatSession | undefined => {
  const session = getChatSession(sessionId, userEmail);
  if (!session) return undefined;

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

  updateChatSession(updatedSession, userEmail);
  return updatedSession;
};

export const addPdfToSession = (sessionId: string, pdf: AttachedPdf, userEmail?: string): ChatSession | undefined => {
  const session = getChatSession(sessionId, userEmail);
  if (!session) return undefined;

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

  updateChatSession(updatedSession, userEmail);
  return updatedSession;
};

export const deleteChatSession = (id: string, userEmail?: string): ChatSession[] => {
  const sessions = getChatSessions(userEmail);
  const filtered = sessions.filter(s => s.id !== id);
  saveChatSessions(filtered, userEmail);
  return filtered;
};
