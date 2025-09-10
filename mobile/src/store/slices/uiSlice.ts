import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  isOnline: boolean;
  isAppActive: boolean;
  loadingStates: {
    [key: string]: boolean;
  };
  modals: {
    [key: string]: boolean;
  };
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>;
  bottomSheet: {
    isVisible: boolean;
    content: string | null;
    data: any;
  };
  searchQuery: string;
  lastSearchTime: number | null;
}

const initialState: UIState = {
  theme: 'light',
  language: 'en',
  isOnline: true,
  isAppActive: true,
  loadingStates: {},
  modals: {},
  toasts: [],
  bottomSheet: {
    isVisible: false,
    content: null,
    data: null,
  },
  searchQuery: '',
  lastSearchTime: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setAppActiveStatus: (state, action: PayloadAction<boolean>) => {
      state.isAppActive = action.payload;
    },
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      const { key, loading } = action.payload;
      state.loadingStates[key] = loading;
    },
    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loadingStates[action.payload];
    },
    clearAllLoading: (state) => {
      state.loadingStates = {};
    },
    showModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
    },
    hideModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
    },
    toggleModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = !state.modals[action.payload];
    },
    clearModals: (state) => {
      state.modals = {};
    },
    addToast: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
      duration?: number;
    }>) => {
      const toast = {
        id: Date.now().toString(),
        ...action.payload,
        duration: action.payload.duration || 3000,
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
    showBottomSheet: (state, action: PayloadAction<{
      content: string;
      data?: any;
    }>) => {
      state.bottomSheet = {
        isVisible: true,
        content: action.payload.content,
        data: action.payload.data || null,
      };
    },
    hideBottomSheet: (state) => {
      state.bottomSheet = {
        isVisible: false,
        content: null,
        data: null,
      };
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.lastSearchTime = Date.now();
    },
    clearSearchQuery: (state) => {
      state.searchQuery = '';
      state.lastSearchTime = null;
    },
    resetUI: (state) => {
      return { ...initialState, theme: state.theme, language: state.language };
    },
  },
});

export const {
  setTheme,
  setLanguage,
  setOnlineStatus,
  setAppActiveStatus,
  setLoading,
  clearLoading,
  clearAllLoading,
  showModal,
  hideModal,
  toggleModal,
  clearModals,
  addToast,
  removeToast,
  clearToasts,
  showBottomSheet,
  hideBottomSheet,
  setSearchQuery,
  clearSearchQuery,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
