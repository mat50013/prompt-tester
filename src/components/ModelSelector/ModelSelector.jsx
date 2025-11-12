import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Button,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Collapse,
  InputBase,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  SelectAll as SelectAllIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import {
  fetchAvailableModels,
  toggleModelSelection,
  clearAvailableModels,
  selectAllModels,
  deselectAllModels,
} from '../../store/modelsSlice';

const ModelSelector = () => {
  const dispatch = useDispatch();
  const { availableModels, selectedModels, loading, error } = useSelector(state => state.models);
  const { enabledSelfHosted } = useSelector(state => state.ui);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [queryTerm, setQueryTerm] = useState('');
  const [limit, setLimit] = useState(500);
  const [expandedGroups, setExpandedGroups] = useState({});

  const handlerQueryRequest = function() {
    dispatch(fetchAvailableModels({searchTerm: queryTerm, limit}));
    setSearchTerm('');
  };

  const filteredModels = availableModels.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedModels = filteredModels.reduce((groups, model) => {
    const provider = model.id.split('/')[0];
    if (!groups[provider]) {
      groups[provider] = [];
    }
    groups[provider].push(model);
    return groups;
  }, {});

  const handleToggleModel = (modelId) => {
    dispatch(toggleModelSelection(modelId));
  };

  const handleToggleGroup = (provider) => {
    setExpandedGroups(prev => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const getModelPricing = (model) => {
    if (!model.pricing) return 'Free';
    const { prompt, completion } = model.pricing;
    return `$${prompt}/1K in, $${completion}/1K out`;
  };

  useEffect(() => {
    setSearchTerm('');
    setQueryTerm('');
    dispatch(deselectAllModels());
    dispatch(clearAvailableModels());
  }, [dispatch, enabledSelfHosted]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load models: {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Select Models
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Choose one or more models to test your prompts against
        </Typography>
      </Box>

      <Paper component="form" sx={{ p: '2px 4px', display: 'inline-flex', alignItems: 'space-between', flexWrap: 'nowrap', flexDirection: 'row', mb: 2 }}>
        <InputBase
            sx={{ ml: 1, flex: 1, minWidth: 0 }}
            placeholder="Query models endpoint..."
            inputProps={{ 'aria-label': 'query models endpoint', minLength: 1 }}
            value={queryTerm}
            onChange={(e) => setQueryTerm(e.target.value)}
            required
        />
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical"/>
        <InputBase
            sx={{ ml: 1, width: '80px' }}
            placeholder="Limit"
            type="number"
            inputProps={{
              'aria-label': 'result limit',
              min: 1,
              max: 1000
            }}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
        />
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical"/>
        <IconButton
            type="button"
            sx={{ p: '10px', color: 'primary.main' }}
            aria-label="search"
            disabled={queryTerm.trim().length < 1}
            onClick={handlerQueryRequest}
        >
          <SearchIcon />
        </IconButton>
      </Paper>

      <TextField
        fullWidth
        placeholder="Search models local..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" />
          ),
        }}
        sx={{ mb: 2 }}
      />

      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Button
          size="small"
          startIcon={<SelectAllIcon />}
          onClick={() => dispatch(selectAllModels())}
        >
          Select All
        </Button>
        <Button
          size="small"
          startIcon={<ClearIcon />}
          onClick={() => dispatch(deselectAllModels())}
        >
          Clear All
        </Button>
        <Chip
          label={`${selectedModels.length} selected`}
          color="primary"
          size="small"
        />
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>
          {Object.entries(groupedModels).map(([provider, models]) => (
            <React.Fragment key={provider}>
              <ListItem
                button
                onClick={() => handleToggleGroup(provider)}
                sx={{ bgcolor: 'grey.100' }}
              >
                <ListItemIcon>
                  {expandedGroups[provider] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={provider.toUpperCase()}
                  secondary={`${models.length} models`}
                />
              </ListItem>
              
              <Collapse in={expandedGroups[provider] !== false} timeout="auto" unmountOnExit>
                {models.map(model => (
                  <ListItem
                    key={model.id}
                    dense
                    button
                    onClick={() => handleToggleModel(model.id)}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={selectedModels.includes(model.id)}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={model.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {model.id}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Context: {model.contextLength?.toLocaleString() || 'N/A'} tokens
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="caption" color="primary">
                        {getModelPricing(model)}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Box>

      {selectedModels.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Please select at least one model to run tests
        </Alert>
      )}
    </Paper>
  );
};

export default ModelSelector;