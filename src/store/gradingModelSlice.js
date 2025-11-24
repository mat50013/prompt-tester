import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { openRouterService } from '../services/openRouterService';
import { toggleSelfHosted } from './uiSlice.js';

export const fetchAvailableModelsGrading = createAsyncThunk(
  'models/fetchAvailableGrading',
  async ({ searchTerm, limit }) => {
    return await openRouterService.getAvailableModels(searchTerm, limit);
  },
);

const initialState = {
  availableModelsGrading: [],
  selectedModelsGrading: [],
  loadingGrading: false,
  errorGrading: null,
};

const modelsSlice = createSlice({
  name: 'modelsGrading',
  initialState,
  reducers: {
    toggleModelSelectionGrading: (state, action) => {
      const modelId = action.payload;
      const index = state.selectedModelsGrading.indexOf(modelId);
      if (index > -1) {
        state.selectedModelsGrading.splice(index, 1);
      } else {
        state.selectedModelsGrading.push(modelId);
      }
    },
    selectAllModelsGrading: (state) => {
      state.selectedModelsGrading = state.availableModelsGrading.map((m) => m.id);
    },
    deselectAllModelsGrading: (state) => {
      state.selectedModelsGrading = [];
    },
    setSelectedModelsGrading: (state, action) => {
      state.selectedModelsGrading = action.payload;
    },
    clearAvailableModelsGrading: (state) => {
      state.availableModelsGrading = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableModelsGrading.pending, (state) => {
        state.loadingGrading = true;
        state.errorGrading = null;
      })
      .addCase(fetchAvailableModelsGrading.fulfilled, (state, action) => {
        state.loadingGrading = false;
        state.availableModelsGrading = action.payload;
      })
      .addCase(fetchAvailableModelsGrading.rejected, (state, action) => {
        state.loadingGrading = false;
        state.errorGrading = action.error.message;
      })
      .addCase(toggleSelfHosted, (state) => {
        state.selectedModelsGrading = [];
        state.availableModelsGrading = [];
      });
  },
});

export const {
  toggleModelSelectionGrading,
  selectAllModelsGrading,
  deselectAllModelsGrading,
  setSelectedModelsGrading,
  clearAvailableModelsGrading,
} = modelsSlice.actions;

export default modelsSlice.reducer;
