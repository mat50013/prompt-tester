import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { openRouterService } from '../services/openRouterService';
import { toggleSelfHosted } from './uiSlice.js';

export const fetchAvailableModelsTranslation = createAsyncThunk(
  'models/fetchAvailableTranslation',
  async ({ searchTerm, limit }) => {
    return await openRouterService.getAvailableModels(searchTerm, limit);
  },
);

const initialState = {
  availableModelsTranslation: [],
  selectedModelsTranslation: [],
  loadingTranslation: false,
  errorTranslation: null,
};

const modelsSlice = createSlice({
  name: 'modelsTranslation',
  initialState,
  reducers: {
    toggleModelSelectionTranslation: (state, action) => {
      const modelId = action.payload;
      const index = state.selectedModelsTranslation.indexOf(modelId);
      if (index > -1) {
        state.selectedModelsTranslation.splice(index, 1);
      } else {
        state.selectedModelsTranslation.push(modelId);
      }
    },
    selectAllModelsTranslation: (state) => {
      state.selectedModelsTranslation = state.availableModelsTranslation.map((m) => m.id);
    },
    deselectAllModelsTranslation: (state) => {
      state.selectedModelsTranslation = [];
    },
    setSelectedModelsTranslation: (state, action) => {
      state.selectedModelsTranslation = action.payload;
    },
    clearAvailableModelsTranslation: (state) => {
      state.availableModelsTranslation = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableModelsTranslation.pending, (state) => {
        state.loadingTranslation = true;
        state.errorTranslation = null;
      })
      .addCase(fetchAvailableModelsTranslation.fulfilled, (state, action) => {
        state.loadingTranslation = false;
        state.availableModelsTranslation = action.payload;
      })
      .addCase(fetchAvailableModelsTranslation.rejected, (state, action) => {
        state.loadingTranslation = false;
        state.errorTranslation = action.error.message;
      })
      .addCase(toggleSelfHosted, (state) => {
        state.selectedModelsTranslation = [];
        state.availableModelsTranslation = [];
      });
  },
});

export const {
  toggleModelSelectionTranslation,
  selectAllModelsTranslation,
  deselectAllModelsTranslation,
  setSelectedModelsTranslation,
  clearAvailableModelsTranslation,
} = modelsSlice.actions;

export default modelsSlice.reducer;
