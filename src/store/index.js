import { configureStore } from '@reduxjs/toolkit';
import testCasesReducer from './testCasesSlice';
import modelsReducer from './modelsSlice';
import resultsReducer from './resultsSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    testCases: testCasesReducer,
    models: modelsReducer,
    results: resultsReducer,
    ui: uiReducer,
  },
});

export default store;