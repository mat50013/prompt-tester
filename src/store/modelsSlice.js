import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { openRouterService } from '../services/openRouterService';

export const fetchAvailableModels = createAsyncThunk(
  'models/fetchAvailable',
  async () => {
    const models = await openRouterService.getAvailableModels();
    return models;
  }
);

const initialState = {
  availableModels: [],
  selectedModels: [],
  loading: false,
  error: null,
};

const modelsSlice = createSlice({
  name: 'models',
  initialState,
  reducers: {
    toggleModelSelection: (state, action) => {
      const modelId = action.payload;
      const index = state.selectedModels.indexOf(modelId);
      if (index > -1) {
        state.selectedModels.splice(index, 1);
      } else {
        state.selectedModels.push(modelId);
      }
    },
    selectAllModels: (state) => {
      state.selectedModels = state.availableModels.map(m => m.id);
    },
    deselectAllModels: (state) => {
      state.selectedModels = [];
    },
    setSelectedModels: (state, action) => {
      state.selectedModels = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableModels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableModels.fulfilled, (state, action) => {
        state.loading = false;
        state.availableModels = action.payload;
      })
      .addCase(fetchAvailableModels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  toggleModelSelection,
  selectAllModels,
  deselectAllModels,
  setSelectedModels,
} = modelsSlice.actions;

export default modelsSlice.reducer;