import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  Tooltip,
  LinearProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Grade as GradeIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  CompareArrows as CompareIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { updateFilters, addNotification } from '../../store/uiSlice';
import { deleteResult, deleteAllResultsForModel } from '../../store/resultsSlice';
import { db } from '../../services/databaseService';
import ResultViewer from './ResultViewer';
import GradingDialog from '../GradingDialog/GradingDialog';
import ExportDialog from '../ExportDialog/ExportDialog';

const ResultsDashboard = () => {
  const dispatch = useDispatch();
  const { testCases } = useSelector((state) => state.testCases);
  const { results, executionStatus, grades } = useSelector((state) => state.results);
  const { availableModels, selectedModels } = useSelector((state) => state.models);
  const { filters } = useSelector((state) => state.ui);

  // Get all models that have been tested (regardless of current selection)
  const testedModels = useMemo(() => {
    const modelSet = new Set();
    Object.values(results).forEach((testCaseResults) => {
      Object.keys(testCaseResults).forEach((modelId) => {
        modelSet.add(modelId);
      });
    });
    return Array.from(modelSet);
  }, [results]);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [gradingOpen, setGradingOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [filterAnchor, setFilterAnchor] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'running':
        return 'info';
      default:
        return 'default';
    }
  };

  const getGradeColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const handleViewResult = (testCaseId, modelId) => {
    const testCase = testCases.find((tc) => tc.id === testCaseId);
    const result = results[testCaseId]?.[modelId];
    const grade = grades[testCaseId]?.[modelId];

    setSelectedResult({ testCase, modelId, result, grade });
    setViewerOpen(true);
  };

  const handleGradeResult = (testCaseId, modelId) => {
    const testCase = testCases.find((tc) => tc.id === testCaseId);
    const result = results[testCaseId]?.[modelId];

    setSelectedResult({ testCase, modelId, result });
    setGradingOpen(true);
  };

  const handleDeleteSingleResult = async (testCaseId, modelId) => {
    const modelName = getModelName(modelId);
    const testCase = testCases.find((tc) => tc.id === testCaseId);

    if (window.confirm(`Delete result for "${testCase?.name}" with model "${modelName}"?`)) {
      try {
        // Delete from database
        await db.results.where('[testCaseId+modelId]').equals([testCaseId, modelId]).delete();
        await db.grades.where('[testCaseId+modelId]').equals([testCaseId, modelId]).delete();

        // Delete from state
        dispatch(deleteResult({ testCaseId, modelId }));

        dispatch(
          addNotification({
            type: 'success',
            message: `Deleted result for ${modelName}`,
          }),
        );
      } catch (error) {
        console.error('Failed to delete result:', error);
        dispatch(
          addNotification({
            type: 'error',
            message: 'Failed to delete result',
          }),
        );
      }
    }
  };

  const handleDeleteModelResults = async (modelId) => {
    const modelName = getModelName(modelId);

    if (
      window.confirm(
        `Delete ALL results for model "${modelName}"? This will remove results from all test cases.`,
      )
    ) {
      try {
        // Delete from database
        await db.results.where('modelId').equals(modelId).delete();
        await db.grades.where('modelId').equals(modelId).delete();

        // Delete from state
        dispatch(deleteAllResultsForModel({ modelId }));

        dispatch(
          addNotification({
            type: 'success',
            message: `Deleted all results for ${modelName}`,
          }),
        );
      } catch (error) {
        console.error('Failed to delete model results:', error);
        dispatch(
          addNotification({
            type: 'error',
            message: 'Failed to delete model results',
          }),
        );
      }
    }
  };

  const filteredTestCases = testCases.filter((tc) => {
    if (filters.statusFilter !== 'all') {
      const hasStatus = selectedModels.some((modelId) => {
        const status = executionStatus[tc.id]?.[modelId];
        return status === filters.statusFilter;
      });
      if (!hasStatus) return false;
    }

    if (filters.scoreFilter) {
      const hasScore = selectedModels.some((modelId) => {
        const grade = grades[tc.id]?.[modelId];
        return grade && grade.score >= filters.scoreFilter;
      });
      if (!hasScore) return false;
    }

    return true;
  });

  const getModelName = (modelId) => {
    const model = availableModels.find((m) => m.id === modelId);
    return model?.name || modelId;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Results Dashboard</Typography>
          <Box>
            <Tooltip title="Filter Results">
              <IconButton onClick={(e) => setFilterAnchor(e.currentTarget)}>
                <FilterIcon />
              </IconButton>
            </Tooltip>
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => setExportOpen(true)}
              variant="outlined"
              size="small"
            >
              Export
            </Button>
          </Box>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ flexGrow: 1 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Test Case</TableCell>
              {testedModels.map((modelId) => (
                <TableCell key={modelId} align="center">
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
                  >
                    {getModelName(modelId)}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteModelResults(modelId)}
                      sx={{ ml: 1 }}
                      title={`Delete all results for ${getModelName(modelId)}`}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTestCases.map((testCase) => (
              <TableRow key={testCase.id}>
                <TableCell>
                  <Typography variant="body2">{testCase.name}</Typography>
                </TableCell>
                {testedModels.map((modelId) => {
                  const result = results[testCase.id]?.[modelId];
                  const status =
                    executionStatus[testCase.id]?.[modelId] || (result ? 'completed' : 'pending');
                  const grade = grades[testCase.id]?.[modelId];

                  return (
                    <TableCell key={modelId} align="center">
                      {status === 'running' ? (
                        <LinearProgress />
                      ) : result ? (
                        <Box>
                          <Chip
                            label={status}
                            color={getStatusColor(status)}
                            size="small"
                            sx={{ mb: 1 }}
                          />
                          {grade && (
                            <Chip
                              label={`Score: ${grade.score}`}
                              color={getGradeColor(grade.score)}
                              size="small"
                              sx={{ ml: 1, mb: 1 }}
                            />
                          )}
                          {result.diff && (
                            <Typography variant="caption" display="block">
                              Similarity: {result.diff.similarity.toFixed(1)}%
                            </Typography>
                          )}
                          <Box sx={{ mt: 1 }}>
                            <Tooltip title="View Result">
                              <IconButton
                                size="small"
                                onClick={() => handleViewResult(testCase.id, modelId)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Grade Result">
                              <IconButton
                                size="small"
                                onClick={() => handleGradeResult(testCase.id, modelId)}
                              >
                                <GradeIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete This Result">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteSingleResult(testCase.id, modelId)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Not run
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            dispatch(updateFilters({ statusFilter: 'all' }));
            setFilterAnchor(null);
          }}
        >
          All Results
        </MenuItem>
        <MenuItem
          onClick={() => {
            dispatch(updateFilters({ statusFilter: 'completed' }));
            setFilterAnchor(null);
          }}
        >
          Completed Only
        </MenuItem>
        <MenuItem
          onClick={() => {
            dispatch(updateFilters({ statusFilter: 'failed' }));
            setFilterAnchor(null);
          }}
        >
          Failed Only
        </MenuItem>
      </Menu>

      <ResultViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        result={selectedResult}
      />

      <GradingDialog
        open={gradingOpen}
        onClose={() => setGradingOpen(false)}
        result={selectedResult}
      />

      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
    </Box>
  );
};

export default ResultsDashboard;
