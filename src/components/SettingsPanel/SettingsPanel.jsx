import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  FormControlLabel,
  Switch,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { setTheme, setLanguage, toggleRoundTrip, setTranslationModel, setAutoGradingModel, toggleSelfHosted } from '../../store/uiSlice';
import { db } from '../../services/databaseService';
import i18n from '../../i18n';
import { fetchAvailableModels } from "../../store/modelsSlice.js";

const SettingsPanel = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { theme, language, enableRoundTrip, translationModel, autoGradingModel, enabledSelfHosted } = useSelector(state => state.ui);
  const { availableModels, loading } = useSelector(state => state.models);

  const [llmPath, setLlmPath] = useState('');
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || '');
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveStatusLLM, setSaveStatusLLM] = useState(null);

  useEffect(() => {
    dispatch(fetchAvailableModels());
  }, [dispatch]);

  useEffect( () => {
      async function fetchLLMUrl() {
        const settingLLMUrl = await db.getSetting("llmFrogPath");
        if (settingLLMUrl) {
          setLlmPath(settingLLMUrl);
        }
      }

      fetchLLMUrl();
  }, []);

  const handleThemeChange = (event) => {
    dispatch(setTheme(event.target.value));
  };

  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    dispatch(setLanguage(newLang));
    i18n.changeLanguage(newLang);
  };

  const handleApiKeySave = async () => {
    try {
      await db.saveSetting('apiKey', apiKey);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus('error');
    }
  };

  const handleFROGLlmPathSave = async () => {
    try {
      await db.saveSetting('llmFrogPath', llmPath);
      setSaveStatusLLM('success');
      setTimeout(() => setSaveStatusLLM(null), 3000);
    } catch {
      setSaveStatusLLM('error');
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        await db.clearAllData();
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear data:', error);
      }
    }
  };

  return (
    <Box sx={{ p: 3, overflowY: "auto" }}>
      <Typography variant="h5" gutterBottom>
        {t('settings.title')}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Appearance
        </Typography>
        
        <FormControl fullWidth margin="normal">
          <InputLabel>{t('settings.theme.label')}</InputLabel>
          <Select
            value={theme}
            onChange={handleThemeChange}
            label={t('settings.theme.label')}
          >
            <MenuItem value="light">{t('settings.theme.light')}</MenuItem>
            <MenuItem value="dark">{t('settings.theme.dark')}</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>{t('settings.language.label')}</InputLabel>
          <Select
            value={language}
            onChange={handleLanguageChange}
            label={t('settings.language.label')}
          >
            <MenuItem value="en">{t('settings.language.en')}</MenuItem>
            <MenuItem value="nl">{t('settings.language.nl')}</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <Paper sx={{p:3, mb: 3}}>
        <Typography variant="h6" gutterBottom>
          {t('settings.autograding.title')}
        </Typography>

        <FormControl fullWidth margin="normal">
          <Autocomplete
              value={availableModels.find(model => model.id === autoGradingModel) || null}
              onChange={(event, newValue) => {
                if (newValue) {
                  dispatch(setAutoGradingModel(newValue.id));
                }
              }}
              options={availableModels}
              getOptionLabel={(option) => option.name}
              loading={loading}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                  <TextField
                      {...params}
                      label="Model for AutoGrading"
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          endAdornment: (
                              <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </React.Fragment>
                          ),
                        },
                      }}
                  />
              )}
          />
        </FormControl>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('settings.api.title')}
        </Typography>
        
        <TextField
          fullWidth
          type="password"
          label={t('settings.api.key')}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          margin="normal"
          helperText={t('settings.api.keyHelper')}
        />
        
        <Button
          variant="contained"
          onClick={handleApiKeySave}
          sx={{ mt: 2 }}
        >
          {t('common.save')}
        </Button>
        
        {saveStatus === 'success' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            API key saved successfully
          </Alert>
        )}
        
        {saveStatus === 'error' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to save API key
          </Alert>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          LLM configuration
        </Typography>

        <FormControlLabel
            control={
              <Switch
                checked={enabledSelfHosted}
                onChange={() => dispatch(toggleSelfHosted())}
              />
            }
            label={t('settings.selfHostedLLM.label')}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t('settings.selfHostedLLM.description')}
        </Typography>

        {enabledSelfHosted && (
            <>
              <Typography variant="h6" gutterBottom>
                {t('settings.selfHostedLLM.activated.title')}
              </Typography>

              <TextField
                  fullWidth
                  type="url"
                  label={t('settings.selfHostedLLM.activated.label')}
                  value={llmPath}
                  onChange={(e) => setLlmPath(e.target.value)}
                  margin="normal"
                  helperText={t('settings.selfHostedLLM.activated.helper')}
              />

              <Button
                  variant="contained"
                  onClick={handleFROGLlmPathSave}
                  sx={{ mt: 2 }}
              >
                {t('common.save')}
              </Button>

              {saveStatusLLM === 'success' && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    LLMFrog url saved successfully
                  </Alert>
              )}

              {saveStatusLLM === 'error' && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    Failed to save LLMFrog key
                  </Alert>
              )}
            </>
          )
        }

      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Translation Settings
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={enableRoundTrip}
              onChange={() => dispatch(toggleRoundTrip())}
            />
          }
          label={t('settings.roundTrip.label')}
        />
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t('settings.roundTrip.description')}
        </Typography>

        {enableRoundTrip && (
          <>
            <FormControl fullWidth margin="normal">
              <Autocomplete
                value={availableModels.find(model => model.id === translationModel) || null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    dispatch(setTranslationModel(newValue.id));
                  }
                }}
                options={availableModels}
                getOptionLabel={(option) => option.name}
                loading={loading}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Model for Translation"
                        slotProps={{
                          input: {
                            ...params.InputProps,
                            endAdornment: (
                                <React.Fragment>
                                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                  {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                          },
                        }}
                    />
                )}
              />
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              Choose which model to use for Dutch ↔ English translations
            </Typography>
          </>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom color="error">
          Danger Zone
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Clear all test cases, results, and grades from the local database.
        </Typography>
        
        <Button
          variant="outlined"
          color="error"
          onClick={handleClearData}
          sx={{ mt: 2 }}
        >
          Clear All Data
        </Button>
      </Paper>
    </Box>
  );
};

export default SettingsPanel;