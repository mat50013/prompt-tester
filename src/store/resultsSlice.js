import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { openRouterService } from '../services/openRouterService';
import { calculateDiff } from '../utils/diffUtils';
import { db } from '../services/databaseService';

export const runTestCase = createAsyncThunk(
  'results/runTestCase',
  async ({ testCase, models, enableRoundTrip, translationModel }, { dispatch }) => {
    const results = {};
    
    for (const modelId of models) {
      try {
        dispatch(updateExecutionStatus({ 
          testCaseId: testCase.id, 
          modelId, 
          status: 'running' 
        }));
        
        let response;
        if (enableRoundTrip) {
          response = await openRouterService.runRoundTripTest(testCase, modelId, translationModel);
        } else {
          response = await openRouterService.runTest(testCase, modelId);
        }
        
        const result = {
          testCaseId: testCase.id,
          modelId,
          output: response.output,
          roundTripOutput: response.roundTripOutput,
          translatedPrompt: response.translatedPrompt,
          tokensUsed: response.tokensUsed,
          latency: response.latency,
          timestamp: new Date().toISOString(),
          status: 'completed',
        };
        
        if (testCase.expectedResult) {
          result.diff = calculateDiff(
            testCase.expectedResult, 
            response.output
          );
        }
        
        results[modelId] = result;
        
        // Save to database immediately after each model completes
        try {
          await db.saveResult(result);
          console.log('Saved result to database:', result);
        } catch (dbError) {
          console.error('Failed to save result to database:', dbError);
        }
        
        // Update state to show progress in real-time
        dispatch(addSingleResult({ 
          testCaseId: testCase.id, 
          modelId, 
          result 
        }));
        
      } catch (error) {
        const errorResult = {
          testCaseId: testCase.id,
          modelId,
          error: error.message,
          status: 'failed',
          timestamp: new Date().toISOString(),
        };
        
        results[modelId] = errorResult;
        try {
          await db.saveResult(errorResult);
          console.log('Saved error result to database:', errorResult);
        } catch (dbError) {
          console.error('Failed to save error result to database:', dbError);
        }
        
        dispatch(addSingleResult({ 
          testCaseId: testCase.id, 
          modelId, 
          result: errorResult 
        }));
      }
      
      dispatch(updateExecutionStatus({ 
        testCaseId: testCase.id, 
        modelId, 
        status: 'completed' 
      }));
    }
    
    return { testCaseId: testCase.id, results };
  }
);

export const gradeResult = createAsyncThunk(
  'results/gradeResult',
  async ({ testCase, result, modelId, gradingMethod, manualScore, comments }) => {
    if (gradingMethod === 'automatic') {
      const grade = await openRouterService.autoGrade({
        testCase,
        result,
      });
      return { testCaseId: testCase.id, modelId, grade };
    } else {
      return {
        testCaseId: testCase.id,
        modelId,
        grade: {
          score: manualScore,
          comments,
          method: 'manual',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
);

const initialState = {
  results: {},
  executionStatus: {},
  grades: {},
  loading: false,
  error: null,
};

const resultsSlice = createSlice({
  name: 'results',
  initialState,
  reducers: {
    updateExecutionStatus: (state, action) => {
      const { testCaseId, modelId, status } = action.payload;
      if (!state.executionStatus[testCaseId]) {
        state.executionStatus[testCaseId] = {};
      }
      state.executionStatus[testCaseId][modelId] = status;
    },
    addSingleResult: (state, action) => {
      const { testCaseId, modelId, result } = action.payload;
      if (!state.results[testCaseId]) {
        state.results[testCaseId] = {};
      }
      state.results[testCaseId][modelId] = result;
    },
    addGrade: (state, action) => {
      const { testCaseId, modelId, grade } = action.payload;
      if (!state.grades[testCaseId]) {
        state.grades[testCaseId] = {};
      }
      state.grades[testCaseId][modelId] = grade;
    },
    deleteResult: (state, action) => {
      const { testCaseId, modelId } = action.payload;
      if (state.results[testCaseId]) {
        delete state.results[testCaseId][modelId];
        // If no more results for this test case, remove the test case entry
        if (Object.keys(state.results[testCaseId]).length === 0) {
          delete state.results[testCaseId];
        }
      }
      if (state.grades[testCaseId]) {
        delete state.grades[testCaseId][modelId];
        // If no more grades for this test case, remove the test case entry
        if (Object.keys(state.grades[testCaseId]).length === 0) {
          delete state.grades[testCaseId];
        }
      }
      if (state.executionStatus[testCaseId]) {
        delete state.executionStatus[testCaseId][modelId];
        // If no more execution status for this test case, remove the test case entry
        if (Object.keys(state.executionStatus[testCaseId]).length === 0) {
          delete state.executionStatus[testCaseId];
        }
      }
    },
    deleteAllResultsForModel: (state, action) => {
      const { modelId } = action.payload;
      // Remove this model from all test cases
      Object.keys(state.results).forEach(testCaseId => {
        if (state.results[testCaseId][modelId]) {
          delete state.results[testCaseId][modelId];
          // If no more results for this test case, remove the test case entry
          if (Object.keys(state.results[testCaseId]).length === 0) {
            delete state.results[testCaseId];
          }
        }
      });
      Object.keys(state.grades).forEach(testCaseId => {
        if (state.grades[testCaseId][modelId]) {
          delete state.grades[testCaseId][modelId];
          // If no more grades for this test case, remove the test case entry
          if (Object.keys(state.grades[testCaseId]).length === 0) {
            delete state.grades[testCaseId];
          }
        }
      });
      Object.keys(state.executionStatus).forEach(testCaseId => {
        if (state.executionStatus[testCaseId][modelId]) {
          delete state.executionStatus[testCaseId][modelId];
          // If no more execution status for this test case, remove the test case entry
          if (Object.keys(state.executionStatus[testCaseId]).length === 0) {
            delete state.executionStatus[testCaseId];
          }
        }
      });
    },
    clearResults: (state) => {
      state.results = {};
      state.executionStatus = {};
      state.grades = {};
    },
    loadResults: (state, action) => {
      state.results = action.payload.results || {};
      state.grades = action.payload.grades || {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runTestCase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(runTestCase.fulfilled, (state, action) => {
        state.loading = false;
        const { testCaseId, results } = action.payload;
        if (!state.results[testCaseId]) {
          state.results[testCaseId] = {};
        }
        Object.assign(state.results[testCaseId], results);
      })
      .addCase(runTestCase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(gradeResult.fulfilled, (state, action) => {
        const { testCaseId, modelId, grade } = action.payload;
        console.log('gradeResult.fulfilled - Saving grade to state:', { testCaseId, modelId, grade });
        if (!state.grades[testCaseId]) {
          state.grades[testCaseId] = {};
        }
        state.grades[testCaseId][modelId] = grade;
      });
  },
});

export const { updateExecutionStatus, addSingleResult, addGrade, deleteResult, deleteAllResultsForModel, clearResults, loadResults } = resultsSlice.actions;

export default resultsSlice.reducer;