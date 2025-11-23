import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Container,
  Paper,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Translate as TranslateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './i18n';
import { store } from './store';
import { useSelector, useDispatch } from 'react-redux';
import {
  setTheme,
  setLanguage,
  toggleRoundTrip,
  setActiveTab,
  addNotification,
  removeNotification,
} from './store/uiSlice';
import { loadTestCases } from './store/testCasesSlice';
import { loadResults } from './store/resultsSlice';
import { db } from './services/databaseService';
import TestEditor from './components/TestEditor/TestEditor';
import ModelSelector from './components/ModelSelector/ModelSelector';
import ResultsDashboard from './components/ResultsDashboard/ResultsDashboard';
import SettingsPanel from './components/SettingsPanel/SettingsPanel';
import { useHotkeys } from 'react-hotkeys-hook';

const queryClient = new QueryClient();

function AppContent() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { theme, language, activeTab, notifications, enableRoundTrip } = useSelector(
    (state) => state.ui,
  );

  const muiTheme = createTheme({
    palette: {
      mode: theme,
    },
  });

  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        console.log('Loading persisted data...');
        const testCases = await db.getAllTestCases();
        const results = await db.getAllResults();
        const grades = await db.getAllGrades();

        console.log('Loaded data:', {
          testCases: testCases.length,
          results: results.length,
          grades: grades.length,
        });

        if (testCases.length > 0) {
          dispatch(loadTestCases(testCases));
        }

        const formattedResults = {};
        const formattedGrades = {};

        results.forEach((result) => {
          if (!formattedResults[result.testCaseId]) {
            formattedResults[result.testCaseId] = {};
          }
          formattedResults[result.testCaseId][result.modelId] = result;
        });

        grades.forEach((grade) => {
          if (!formattedGrades[grade.testCaseId]) {
            formattedGrades[grade.testCaseId] = {};
          }
          formattedGrades[grade.testCaseId][grade.modelId] = grade;
        });

        console.log('Formatted results:', formattedResults);
        console.log('Formatted grades:', formattedGrades);

        if (Object.keys(formattedResults).length > 0 || Object.keys(formattedGrades).length > 0) {
          dispatch(loadResults({ results: formattedResults, grades: formattedGrades }));
        }
      } catch (error) {
        console.error('Failed to load persisted data:', error);
        dispatch(
          addNotification({
            type: 'error',
            message: 'Failed to load saved data from database',
          }),
        );
      }
    };

    loadPersistedData();
  }, [dispatch]);

  const handleThemeToggle = () => {
    dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
  };

  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'nl' : 'en';
    dispatch(setLanguage(newLang));
    i18n.changeLanguage(newLang);
  };

  const handleTabChange = (event, newValue) => {
    dispatch(setActiveTab(newValue));
  };

  useHotkeys('ctrl+s', (e) => {
    e.preventDefault();
  });

  useHotkeys('ctrl+r', (e) => {
    e.preventDefault();
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'editor':
        return <TestEditor />;
      case 'models':
        return <ModelSelector />;
      case 'results':
        return <ResultsDashboard />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <TestEditor />;
    }
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {t('app.title')}
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={enableRoundTrip}
                  onChange={() => dispatch(toggleRoundTrip())}
                  color="default"
                />
              }
              label="Round-Trip"
              sx={{ mr: 2 }}
            />

            <IconButton onClick={handleLanguageToggle} color="inherit" sx={{ mr: 1 }}>
              <TranslateIcon />
            </IconButton>

            <IconButton onClick={handleThemeToggle} color="inherit">
              {theme === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="secondary"
          >
            <Tab value="editor" label={t('navigation.editor')} />
            <Tab value="models" label={t('navigation.models')} />
            <Tab value="results" label={t('navigation.results')} />
            <Tab value="settings" label={t('navigation.settings')} icon={<SettingsIcon />} />
          </Tabs>
        </AppBar>

        <Box sx={{ flexGrow: 1, overflow: 'hidden', bgcolor: 'background.default' }}>
          <Container maxWidth={false} sx={{ height: '100%', py: 2 }}>
            <Paper sx={{ height: '100%', overflow: 'hidden' }}>{renderTabContent()}</Paper>
          </Container>
        </Box>

        {notifications.map((notification) => (
          <Snackbar
            key={notification.id}
            open={true}
            autoHideDuration={6000}
            onClose={() => dispatch(removeNotification(notification.id))}
          >
            <Alert
              onClose={() => dispatch(removeNotification(notification.id))}
              severity={notification.type}
              sx={{ width: '100%' }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        ))}
      </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <AppContent />
        </I18nextProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
