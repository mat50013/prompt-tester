import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Chip,
  Grid,
} from '@mui/material';

const ResultViewer = ({ open, onClose, result }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!result) return null;

  const { testCase, modelId, result: testResult, grade } = result;

  console.log('ResultViewer - Received data:', {
    testCase: testCase?.name,
    modelId,
    hasResult: !!testResult,
    grade,
  });
  if (grade) {
    console.log('ResultViewer - Grade details:', {
      score: grade.score,
      method: grade.method,
      feedback: grade.feedback,
      comments: grade.comments,
      allKeys: Object.keys(grade),
    });
  }

  // Simple diff utility
  const createSimpleDiff = (expected, actual) => {
    const expectedLines = expected.split('\n');
    const actualLines = actual.split('\n');
    const maxLines = Math.max(expectedLines.length, actualLines.length);

    const diff = [];
    for (let i = 0; i < maxLines; i++) {
      const expectedLine = expectedLines[i] || '';
      const actualLine = actualLines[i] || '';

      if (expectedLine === actualLine) {
        diff.push({ type: 'equal', expectedLine, actualLine, lineNumber: i + 1 });
      } else {
        if (expectedLine) {
          diff.push({ type: 'removed', expectedLine, actualLine: '', lineNumber: i + 1 });
        }
        if (actualLine) {
          diff.push({ type: 'added', expectedLine: '', actualLine, lineNumber: i + 1 });
        }
      }
    }
    return diff;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Result Viewer - {testCase.name} ({modelId})
      </DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
            <Tab label="Output" />
            <Tab label="Diff View" />
            <Tab label="Round Trip" />
            <Tab label="Details" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Paper sx={{ p: 2, bgcolor: 'grey.50', minHeight: 200 }}>
            <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {testResult.output}
            </Typography>
          </Paper>
        )}

        {activeTab === 1 && testCase.expectedResult && (
          <Box>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ bgcolor: 'error.light', p: 1, color: 'white' }}
                >
                  Expected Result
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#ffeef0', minHeight: 300, overflow: 'auto' }}>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
                  >
                    {testCase.expectedResult}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ bgcolor: 'success.light', p: 1, color: 'white' }}
                >
                  Actual Result
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#e6ffed', minHeight: 300, overflow: 'auto' }}>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
                  >
                    {testResult.output}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Line-by-Line Comparison:
              </Typography>
              <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                {createSimpleDiff(testCase.expectedResult, testResult.output).map((line, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      bgcolor:
                        line.type === 'added'
                          ? '#e6ffed'
                          : line.type === 'removed'
                            ? '#ffeef0'
                            : 'transparent',
                      p: 0.5,
                      borderLeft:
                        line.type === 'added'
                          ? '3px solid green'
                          : line.type === 'removed'
                            ? '3px solid red'
                            : 'none',
                    }}
                  >
                    <Typography variant="caption" sx={{ minWidth: 40, color: 'text.secondary' }}>
                      {line.lineNumber}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', flexGrow: 1 }}>
                      {line.type === 'added'
                        ? `+ ${line.actualLine}`
                        : line.type === 'removed'
                          ? `- ${line.expectedLine}`
                          : `  ${line.expectedLine}`}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Box>

            {testResult.diff && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2">
                  Similarity: {testResult.diff.similarity.toFixed(1)}%
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 2 && (testResult.roundTripOutput || testResult.translatedPrompt) && (
          <Box>
            {testResult.translatedPrompt && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Translated Prompt (Dutch → English):
                </Typography>
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {testResult.translatedPrompt}
                  </Typography>
                </Paper>
              </>
            )}

            {testResult.roundTripOutput && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Round-Trip Output (English → Dutch):
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {testResult.roundTripOutput}
                  </Typography>
                </Paper>
              </>
            )}

            {!testResult.translatedPrompt && !testResult.roundTripOutput && (
              <Typography variant="body2" color="text.secondary">
                No round-trip translation data available. Make sure Round-Trip mode is enabled when
                running tests.
              </Typography>
            )}
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Test Details:
            </Typography>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ mb: 1 }}>
                <Chip
                  label={`Status: ${testResult.status}`}
                  color={testResult.status === 'completed' ? 'success' : 'error'}
                  size="small"
                />
              </Box>
              <Typography variant="body2">
                <strong>Model:</strong> {modelId}
              </Typography>
              <Typography variant="body2">
                <strong>Tokens Used:</strong> {testResult.tokensUsed || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Latency:</strong> {testResult.latency}ms
              </Typography>
              <Typography variant="body2">
                <strong>Timestamp:</strong> {new Date(testResult.timestamp).toLocaleString()}
              </Typography>

              {grade ? (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Grade:
                  </Typography>
                  <Typography variant="body2">
                    <strong>Score:</strong> {grade.score}/100
                  </Typography>
                  <Typography variant="body2">
                    <strong>Method:</strong> {grade.method === 'automatic' ? 'Automatic' : 'Manual'}
                  </Typography>

                  {grade.comments && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Comments:</strong> {grade.comments}
                    </Typography>
                  )}

                  {grade.feedback ? (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>AI Feedback:</strong>
                      </Typography>
                      <Paper sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                        <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                          {grade.feedback}
                        </Typography>
                      </Paper>
                    </Box>
                  ) : (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ display: 'block', color: 'error.main' }}>
                        No feedback found in grade object
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: 'error.main' }}>
                        Grade.feedback value: {String(grade.feedback)}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: 'error.main' }}>
                        Grade.feedback type: {typeof grade.feedback}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                  No grade data available
                </Typography>
              )}
            </Paper>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResultViewer;
