import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  TextField,
  Paper,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  Tooltip,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  PlayArrow as RunIcon,
} from '@mui/icons-material';
import {
  addTestCase,
  updateTestCase,
  deleteTestCase,
  setActiveTestCase,
} from '../../store/testCasesSlice';
import { runTestCase } from '../../store/resultsSlice';
import { addNotification } from '../../store/uiSlice';
import { db } from '../../services/databaseService';

const TestEditor = () => {
  const dispatch = useDispatch();
  const { testCases, activeTestCaseId } = useSelector((state) => state.testCases);
  const { selectedModels } = useSelector((state) => state.models);
  const { enableRoundTrip, translationModel } = useSelector((state) => state.ui);
  const { executionStatus } = useSelector((state) => state.results);

  const activeTestCase = testCases.find((tc) => tc.id === activeTestCaseId);

  const [formData, setFormData] = useState({
    name: '',
    systemPrompt: '',
    userPrompt: '',
    sourceText: '',
    expectedResult: '',
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (activeTestCase) {
      setFormData({
        name: activeTestCase.name || '',
        systemPrompt: activeTestCase.systemPrompt || '',
        userPrompt: activeTestCase.userPrompt || '',
        sourceText: activeTestCase.sourceText || '',
        expectedResult: activeTestCase.expectedResult || '',
      });
      setHasUnsavedChanges(false);
    }
  }, [activeTestCase]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!activeTestCaseId) return;

    const updatedTestCase = {
      id: activeTestCaseId,
      ...formData,
    };

    dispatch(updateTestCase(updatedTestCase));
    await db.saveTestCase(updatedTestCase);
    setHasUnsavedChanges(false);

    dispatch(
      addNotification({
        type: 'success',
        message: 'Test case saved successfully',
      }),
    );
  };

  const handleNewTestCase = async () => {
    const newTestCase = {
      name: 'New Test Case',
      systemPrompt: '',
      userPrompt: '',
      sourceText: '',
      expectedResult: '',
    };

    const action = dispatch(addTestCase(newTestCase));
    const createdTestCase = action.payload;

    // Save to database
    try {
      await db.saveTestCase(createdTestCase);
    } catch (error) {
      console.error('Failed to save test case to database:', error);
    }
  };

  const handleDeleteTestCase = async () => {
    if (!activeTestCaseId) return;

    if (window.confirm('Are you sure you want to delete this test case?')) {
      dispatch(deleteTestCase(activeTestCaseId));
      await db.deleteTestCase(activeTestCaseId);

      dispatch(
        addNotification({
          type: 'info',
          message: 'Test case deleted',
        }),
      );
    }
  };

  const handleRunTest = () => {
    if (!activeTestCase || selectedModels.length === 0) {
      dispatch(
        addNotification({
          type: 'warning',
          message: 'Please select at least one model before running the test',
        }),
      );
      return;
    }

    dispatch(
      runTestCase({
        testCase: activeTestCase,
        models: selectedModels,
        enableRoundTrip,
        translationModel,
      }),
    );
  };

  // Check if any model is currently running for this test case
  const isTestRunning =
    activeTestCaseId &&
    executionStatus[activeTestCaseId] &&
    Object.values(executionStatus[activeTestCaseId]).some((status) => status === 'running');

  const handleTabChange = (event, newValue) => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Do you want to save them?')) {
        handleSave();
      }
    }
    dispatch(setActiveTestCase(newValue));
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
        <Tabs value={activeTestCaseId} onChange={handleTabChange} sx={{ flexGrow: 1 }}>
          {testCases.map((tc) => (
            <Tab key={tc.id} value={tc.id} label={tc.name} />
          ))}
        </Tabs>
        <Tooltip title="New Test Case">
          <IconButton onClick={handleNewTestCase} color="primary">
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {activeTestCase ? (
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Edit Test Case</Typography>
              <Box>
                <Button
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges}
                  sx={{ mr: 1 }}
                >
                  Save
                </Button>
                <Button
                  startIcon={
                    isTestRunning ? <CircularProgress size={20} color="inherit" /> : <RunIcon />
                  }
                  onClick={handleRunTest}
                  variant="contained"
                  disabled={selectedModels.length === 0 || isTestRunning}
                  sx={{ mr: 1 }}
                >
                  {isTestRunning ? 'Running...' : 'Run Test'}
                </Button>
                <Tooltip title="Delete Test Case">
                  <IconButton onClick={handleDeleteTestCase} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <TextField
              fullWidth
              label="Test Name"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="System Prompt"
              value={formData.systemPrompt}
              onChange={(e) => handleFieldChange('systemPrompt', e.target.value)}
              margin="normal"
              multiline
              rows={3}
              placeholder="You are a helpful assistant..."
            />

            <TextField
              fullWidth
              label="User Prompt"
              value={formData.userPrompt}
              onChange={(e) => handleFieldChange('userPrompt', e.target.value)}
              margin="normal"
              multiline
              rows={4}
              required
              placeholder="The actual question or prompt..."
            />

            <TextField
              fullWidth
              label="Source Text (Optional)"
              value={formData.sourceText}
              onChange={(e) => handleFieldChange('sourceText', e.target.value)}
              margin="normal"
              multiline
              rows={4}
              placeholder="Any source material to include..."
            />

            <TextField
              fullWidth
              label="Expected Result (Optional)"
              value={formData.expectedResult}
              onChange={(e) => handleFieldChange('expectedResult', e.target.value)}
              margin="normal"
              multiline
              rows={4}
              placeholder="The expected output for comparison..."
            />

            {enableRoundTrip && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Round-trip translation mode is enabled. The prompt will be translated from Dutch to
                English, processed, and then translated back to Dutch.
              </Alert>
            )}

            {isTestRunning && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Running test on selected models...
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {selectedModels.map((modelId) => {
                    const status = executionStatus[activeTestCaseId]?.[modelId];
                    return (
                      <Typography key={modelId} variant="caption" display="block">
                        {modelId}:{' '}
                        {status === 'running'
                          ? '⏳ Running...'
                          : status === 'completed'
                            ? '✅ Completed'
                            : '⏸️ Waiting'}
                      </Typography>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      ) : (
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
        >
          <Typography variant="h6" color="text.secondary">
            No test cases yet. Click the + button to create one.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TestEditor;
