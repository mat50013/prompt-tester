import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  testCases: [],
  activeTestCaseId: null,
};

const testCasesSlice = createSlice({
  name: 'testCases',
  initialState,
  reducers: {
    addTestCase: {
      reducer: (state, action) => {
        const newTestCase = action.payload;
        state.testCases.push(newTestCase);
        state.activeTestCaseId = newTestCase.id;
      },
      prepare: (payload) => {
        const newTestCase = {
          id: uuidv4(),
          name: payload.name || 'New Test Case',
          systemPrompt: payload.systemPrompt || '',
          userPrompt: payload.userPrompt || '',
          sourceText: payload.sourceText || '',
          expectedResult: payload.expectedResult || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return { payload: newTestCase };
      },
    },
    updateTestCase: (state, action) => {
      const { id, ...updates } = action.payload;
      const testCase = state.testCases.find((tc) => tc.id === id);
      if (testCase) {
        Object.assign(testCase, updates, { updatedAt: new Date().toISOString() });
      }
    },
    deleteTestCase: (state, action) => {
      state.testCases = state.testCases.filter((tc) => tc.id !== action.payload);
      if (state.activeTestCaseId === action.payload) {
        state.activeTestCaseId = state.testCases[0]?.id || null;
      }
    },
    setActiveTestCase: (state, action) => {
      state.activeTestCaseId = action.payload;
    },
    loadTestCases: (state, action) => {
      state.testCases = action.payload;
      state.activeTestCaseId = action.payload[0]?.id || null;
    },
  },
});

export const { addTestCase, updateTestCase, deleteTestCase, setActiveTestCase, loadTestCases } =
  testCasesSlice.actions;

export default testCasesSlice.reducer;
