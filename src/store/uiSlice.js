import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light',
  language: 'en',
  enableRoundTrip: false,
  translationModel: '',
  autoGradingModel: 'openai/gpt-4.1',
  showDiffView: true,
  activeTab: 'editor',
  enabledSelfHosted: false,
  filters: {
    modelFilter: [],
    scoreFilter: null,
    statusFilter: 'all',
  },
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    toggleRoundTrip: (state) => {
      state.enableRoundTrip = !state.enableRoundTrip;
    },
    toggleSelfHosted: (state) => {
        state.enabledSelfHosted = !state.enabledSelfHosted;
    },
    setTranslationModel: (state, action) => {
      state.translationModel = action.payload;
    },
    setAutoGradingModel: (state, action) => {
      state.autoGradingModel = action.payload;
    },
    toggleDiffView: (state) => {
      state.showDiffView = !state.showDiffView;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    updateFilters: (state, action) => {
      Object.assign(state.filters, action.payload);
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        n => n.id !== action.payload
      );
    },
  },
});

export const {
  setTheme,
  setLanguage,
  toggleRoundTrip,
  setTranslationModel,
  toggleDiffView,
  setActiveTab,
  updateFilters,
  addNotification,
  removeNotification,
  toggleSelfHosted,
  setAutoGradingModel
} = uiSlice.actions;

export default uiSlice.reducer;