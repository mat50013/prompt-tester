import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Description as ExcelIcon,
  TableChart as CsvIcon,
  Code as JsonIcon,
} from '@mui/icons-material';
import { exportToExcel, exportToCSV, exportToJSON } from '../../utils/exportUtils';

const ExportDialog = ({ open, onClose }) => {
  const { testCases } = useSelector(state => state.testCases);
  const { results, grades } = useSelector(state => state.results);
  
  const [exportFormat, setExportFormat] = useState('excel');
  const [includeOptions, setIncludeOptions] = useState({
    testCases: true,
    results: true,
    grades: true,
    metadata: true,
  });
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    
    try {
      const exportData = {
        testCases: includeOptions.testCases ? testCases : [],
        results: includeOptions.results ? results : {},
        grades: includeOptions.grades ? grades : {},
        exportDate: new Date().toISOString(),
      };

      switch (exportFormat) {
        case 'excel':
          await exportToExcel(exportData);
          break;
        case 'csv':
          await exportToCSV(exportData);
          break;
        case 'json':
          await exportToJSON(exportData);
          break;
      }
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (option) => {
    setIncludeOptions(prev => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const hasData = testCases.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Results</DialogTitle>
      <DialogContent>
        {!hasData ? (
          <Alert severity="warning">
            No data to export. Please create and run some tests first.
          </Alert>
        ) : (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Select Export Format:
            </Typography>
            
            <RadioGroup
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <FormControlLabel
                value="excel"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ExcelIcon sx={{ mr: 1 }} />
                    Excel (.xlsx) - Best for analysis and reporting
                  </Box>
                }
              />
              <FormControlLabel
                value="csv"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CsvIcon sx={{ mr: 1 }} />
                    CSV (.csv) - Simple tabular format
                  </Box>
                }
              />
              <FormControlLabel
                value="json"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <JsonIcon sx={{ mr: 1 }} />
                    JSON (.json) - Complete data export
                  </Box>
                }
              />
            </RadioGroup>

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Include in Export:
            </Typography>
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeOptions.testCases}
                    onChange={() => handleOptionChange('testCases')}
                  />
                }
                label={`Test Cases (${testCases.length})`}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeOptions.results}
                    onChange={() => handleOptionChange('results')}
                  />
                }
                label={`Test Results (${Object.keys(results).length})`}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeOptions.grades}
                    onChange={() => handleOptionChange('grades')}
                  />
                }
                label={`Grades (${Object.keys(grades).length})`}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeOptions.metadata}
                    onChange={() => handleOptionChange('metadata')}
                  />
                }
                label="Export Metadata"
              />
            </FormGroup>

            {exportFormat === 'excel' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Excel export will create multiple sheets: Test Cases, Results, 
                Grades, and a Summary sheet with all scores.
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={loading || !hasData}
        >
          {loading ? <CircularProgress size={24} /> : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;