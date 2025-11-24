import React, { useState } from 'react';
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
  Radio,
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
  UnfoldMore as UnfoldMoreIcon,
  UnfoldLess as UnfoldLessIcon,
} from '@mui/icons-material';

/**
 * Reusable Model Selector Component
 *
 * @param {Object} props
 * @param {Array} props.models - Array of model objects with {id, name, pricing, contextLength}
 * @param {Array|string} props.selectedModels - Selected model IDs (array for multiple, string for single)
 * @param {Function} props.onSelectionChange - Callback when selection changes
 * @param {Function} props.onQuery - Callback for querying models (optional)
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {boolean} props.multiSelect - Allow multiple selection (default: true)
 * @param {boolean} props.showQueryBar - Show query input bar (default: true)
 * @param {boolean} props.showLocalSearch - Show local search field (default: true)
 * @param {boolean} props.showBulkActions - Show select/clear all buttons (default: true for multiSelect)
 * @param {string} props.title - Component title (default: "Select Models")
 * @param {string} props.subtitle - Component subtitle
 * @param {number} props.defaultLimit - Default query limit (default: 500)
 * @param {boolean} props.groupByProvider - Group models by provider (default: true)
 * @param {boolean} props.showPricing - Show model pricing (default: true)
 * @param {boolean} props.showContextLength - Show context length (default: true)
 * @param {string} props.emptyMessage - Message when no models selected
 * @param {boolean} props.showNoModelsAlert - Deactivate hint saying to use the search bar
 */
const ModelSelector = ({
  models = [],
  selectedModels = [],
  onSelectionChange,
  onQuery = null,
  loading = false,
  error = null,
  multiSelect = true,
  showQueryBar = true,
  showLocalSearch = true,
  showBulkActions = null,
  title = 'Select Models',
  subtitle = 'Choose one or more models to test your prompts against',
  defaultLimit = 30,
  showNoModelsAlert = true,
  groupByProvider = true,
  showPricing = true,
  showContextLength = true,
  emptyMessage = 'Please select at least one model to run tests',
}) => {
  const selectedArray = selectedModels;

  const [searchTerm, setSearchTerm] = useState('');
  const [queryTerm, setQueryTerm] = useState('');
  const [limit, setLimit] = useState(defaultLimit);
  const [expandedGroups, setExpandedGroups] = useState({});

  const displayBulkActions = showBulkActions !== null ? showBulkActions : multiSelect;

  const handleQueryRequest = () => {
    if (onQuery && queryTerm.trim().length >= 1) {
      onQuery({ searchTerm: queryTerm, limit });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQueryRequest();
    }
  };

  const filteredModels = models.filter(
    (model) =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const groupedModels = groupByProvider
    ? filteredModels.reduce((groups, model) => {
        const provider = model.id.split('/')[0];
        if (!groups[provider]) {
          groups[provider] = [];
        }
        groups[provider].push(model);
        return groups;
      }, {})
    : { 'All Models': filteredModels };

  const handleToggleModel = (modelId) => {
    if (!onSelectionChange) return;

    if (multiSelect) {
      const newSelection = selectedArray.includes(modelId)
        ? selectedArray.filter((id) => id !== modelId)
        : [...selectedArray, modelId];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([modelId]);
    }
  };

  const handleSelectAll = () => {
    if (!onSelectionChange || !multiSelect) return;
    const allModelIds = filteredModels.map((model) => model.id);
    onSelectionChange(allModelIds);
  };

  const handleClearAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(multiSelect ? [] : null);
  };

  const handleToggleGroup = (provider) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const handleExpandAll = () => {
    const allExpanded = Object.keys(groupedModels).reduce((acc, provider) => {
      acc[provider] = true;
      return acc;
    }, {});
    setExpandedGroups(allExpanded);
  };

  const handleCollapseAll = () => {
    const allCollapsed = Object.keys(groupedModels).reduce((acc, provider) => {
      acc[provider] = false;
      return acc;
    }, {});
    setExpandedGroups(allCollapsed);
  };

  const getModelPricing = (model) => {
    if (!model.pricing) return 'Free';
    const { prompt, completion } = model.pricing;
    return `$${prompt}/1K in, $${completion}/1K out`;
  };

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
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {subtitle}
          </Typography>
        )}
      </Box>

      {showQueryBar && onQuery && (
        <Paper
          component="div"
          sx={{
            p: '2px 4px',
            display: 'inline-flex',
            alignItems: 'space-between',
            flexWrap: 'nowrap',
            flexDirection: 'row',
            mb: 2,
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1, minWidth: 0 }}
            placeholder="Query models endpoint..."
            inputProps={{ 'aria-label': 'query models endpoint', minLength: 1 }}
            value={queryTerm}
            onChange={(e) => setQueryTerm(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
          <InputBase
            sx={{ ml: 1, width: '80px' }}
            placeholder="Limit"
            type="number"
            inputProps={{
              'aria-label': 'result limit',
              min: 1,
              max: 1000,
            }}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          />
          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
          <IconButton
            type="button"
            sx={{ p: '10px', color: 'primary.main' }}
            aria-label="search"
            disabled={queryTerm.trim().length < 1}
            onClick={handleQueryRequest}
          >
            <SearchIcon />
          </IconButton>
        </Paper>
      )}

      {showLocalSearch && (
        <TextField
          fullWidth
          placeholder="Search models..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
      )}

      {(displayBulkActions || (groupByProvider && Object.keys(groupedModels).length > 1)) && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {multiSelect && displayBulkActions && (
            <>
              <Button
                size="small"
                startIcon={<SelectAllIcon />}
                onClick={handleSelectAll}
                disabled={models.length === 0}
              >
                Select All
              </Button>
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearAll}
                disabled={selectedArray.length === 0}
              >
                Clear All
              </Button>
            </>
          )}
          {groupByProvider && Object.keys(groupedModels).length > 1 && (
            <>
              <Button
                size="small"
                startIcon={<UnfoldMoreIcon />}
                onClick={handleExpandAll}
                disabled={models.length === 0}
              >
                Expand All
              </Button>
              <Button
                size="small"
                startIcon={<UnfoldLessIcon />}
                onClick={handleCollapseAll}
                disabled={models.length === 0}
              >
                Collapse All
              </Button>
            </>
          )}
          {displayBulkActions && (
            <Chip label={`${selectedArray.length} selected`} color="primary" size="small" />
          )}
        </Box>
      )}

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {models.length === 0 && showNoModelsAlert ? (
          <Alert severity="info">
            No models available. {onQuery ? 'Use the query bar to search for models.' : ''}
          </Alert>
        ) : (
          <List>
            {Object.entries(groupedModels).map(([provider, providerModels]) => (
              <React.Fragment key={provider}>
                {groupByProvider && (
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
                      secondary={`${providerModels.length} models`}
                    />
                  </ListItem>
                )}

                <Collapse
                  in={!groupByProvider || expandedGroups[provider] !== false}
                  timeout="auto"
                  unmountOnExit
                >
                  {providerModels.map((model) => {
                    const isSelected = selectedArray.includes(model.id);

                    return (
                      <ListItem
                        key={model.id}
                        dense
                        button
                        onClick={() => handleToggleModel(model.id)}
                        sx={{ pl: groupByProvider ? 4 : 2 }}
                      >
                        <ListItemIcon>
                          {multiSelect ? (
                            <Checkbox
                              edge="start"
                              checked={isSelected}
                              tabIndex={-1}
                              disableRipple
                            />
                          ) : (
                            <Radio edge="start" checked={isSelected} tabIndex={-1} disableRipple />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={model.name}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {model.id}
                              </Typography>
                              {showContextLength && (
                                <Typography variant="caption" color="text.secondary">
                                  Context: {model.contextLength?.toLocaleString() || 'N/A'} tokens
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        {showPricing && (
                          <ListItemSecondaryAction>
                            <Typography variant="caption" color="primary">
                              {getModelPricing(model)}
                            </Typography>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                    );
                  })}
                </Collapse>
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {selectedArray.length === 0 && emptyMessage && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {emptyMessage}
        </Alert>
      )}
    </Paper>
  );
};

export default ModelSelector;
