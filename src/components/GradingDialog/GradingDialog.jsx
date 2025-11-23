import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { gradeResult, addGrade } from '../../store/resultsSlice';
import { addNotification } from '../../store/uiSlice';
import { db } from '../../services/databaseService';

const GradingDialog = ({ open, onClose, result }) => {
  const dispatch = useDispatch();
  const { autoGradingModel } = useSelector((state) => state.ui);
  const [gradingMethod, setGradingMethod] = useState('manual');
  const [manualScore, setManualScore] = useState(50);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  if (!result) return null;

  const { testCase, modelId, result: testResult } = result;

  console.log(autoGradingModel);
  const handleSubmit = async () => {
    setLoading(true);

    try {
      const gradeData = await dispatch(
        gradeResult({
          testCase,
          result: testResult,
          modelId,
          gradingMethod,
          manualScore,
          comments,
          autoGradingModel,
        }),
      ).unwrap();

      console.log('GradingDialog - Received gradeData:', gradeData);
      console.log('GradingDialog - gradeData.grade:', gradeData.grade);
      console.log('GradingDialog - gradeData.grade.feedback:', gradeData.grade.feedback);

      const gradeToSave = {
        testCaseId: testCase.id,
        modelId,
        ...gradeData.grade,
      };

      console.log('Saving grade to database:', gradeToSave);
      console.log('Grade feedback field:', gradeToSave.feedback);
      await db.saveGrade(gradeToSave);

      // Also add to state immediately
      dispatch(
        addGrade({
          testCaseId: testCase.id,
          modelId,
          grade: gradeData.grade,
        }),
      );

      dispatch(
        addNotification({
          type: 'success',
          message: 'Result graded successfully',
        }),
      );

      onClose();
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          message: `Grading failed: ${error.message}`,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Grade Result - {testCase.name} ({modelId})
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Response to Grade:
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
            <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {testResult.output}
            </Typography>
          </Box>
        </Box>

        <RadioGroup value={gradingMethod} onChange={(e) => setGradingMethod(e.target.value)}>
          <FormControlLabel value="manual" control={<Radio />} label="Manual Grading" />
          <FormControlLabel
            value="automatic"
            control={<Radio />}
            label={`Automatic Grading (${autoGradingModel})`}
          />
        </RadioGroup>

        {gradingMethod === 'manual' ? (
          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>Score: {manualScore}/100</Typography>
            <Slider
              value={manualScore}
              onChange={(e, value) => setManualScore(value)}
              valueLabelDisplay="auto"
              step={5}
              marks
              min={0}
              max={100}
            />

            <TextField
              fullWidth
              label="Comments"
              multiline
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              margin="normal"
              placeholder="Provide feedback on the response..."
            />
          </Box>
        ) : (
          <Box sx={{ mt: 3 }}>
            <Alert severity="info">
              {autoGradingModel} will automatically evaluate this response based on:
              <ul style={{ marginTop: 8 }}>
                <li>The original prompt and context</li>
                <li>The quality and accuracy of the response</li>
                <li>Completeness and relevance</li>
                <li>Comparison with expected result (if provided)</li>
              </ul>
              A score from 0-100 and detailed feedback will be generated.
            </Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Submit Grade'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GradingDialog;
