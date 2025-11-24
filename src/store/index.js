import { configureStore } from '@reduxjs/toolkit';
import testCasesReducer from './testCasesSlice';
import modelsReducer from './modelsSlice';
import resultsReducer from './resultsSlice';
import uiReducer from './uiSlice';
import modelsGradingReducer from './gradingModelSlice.js';
import modelsTranslationReducer from './translationModelSlice.js';

export const store = configureStore({
  reducer: {
    testCases: testCasesReducer,
    models: modelsReducer,
    results: resultsReducer,
    ui: uiReducer,
    modelsGrading: modelsGradingReducer,
    modelsTranslation: modelsTranslationReducer,
  },
});

export default store;
