import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Auth Store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'notebookai-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Workspace Store
export const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  isLoading: false,

  setWorkspaces: (workspaces) => set({ workspaces }),
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
  addWorkspace: (workspace) => set((s) => ({ workspaces: [workspace, ...s.workspaces] })),
  updateWorkspace: (id, updates) => set((s) => ({
    workspaces: s.workspaces.map(w => w._id === id ? { ...w, ...updates } : w),
    activeWorkspace: s.activeWorkspace?._id === id ? { ...s.activeWorkspace, ...updates } : s.activeWorkspace,
  })),
  removeWorkspace: (id) => set((s) => ({
    workspaces: s.workspaces.filter(w => w._id !== id),
    activeWorkspace: s.activeWorkspace?._id === id ? null : s.activeWorkspace,
  })),
  setLoading: (isLoading) => set({ isLoading }),
}));

// Document Store
export const useDocumentStore = create((set) => ({
  documents: [],
  isLoading: false,
  uploading: false,

  setDocuments: (documents) => set({ documents }),
  addDocument: (doc) => set((s) => ({ documents: [doc, ...s.documents] })),
  updateDocument: (id, updates) => set((s) => ({
    documents: s.documents.map(d => d._id === id ? { ...d, ...updates } : d),
  })),
  removeDocument: (id) => set((s) => ({ documents: s.documents.filter(d => d._id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
  setUploading: (uploading) => set({ uploading }),
}));

// Chat Store
export const useChatStore = create((set) => ({
  messages: [],
  chatId: null,
  isLoading: false,
  chatHistory: [],

  setMessages: (messages) => set({ messages }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setChatId: (chatId) => set({ chatId }),
  setChatHistory: (chatHistory) => set({ chatHistory }),
  clearChat: () => set({ messages: [], chatId: null }),
  setLoading: (isLoading) => set({ isLoading }),
}));

// UI Store
export const useUIStore = create((set) => ({
  rightPanelTab: 'sources',
  isMobileSidebarOpen: false,
  focusMode: false,

  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  toggleMobileSidebar: () => set((s) => ({ isMobileSidebarOpen: !s.isMobileSidebarOpen })),
  setFocusMode: (focusMode) => set({ focusMode }),
  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
}));