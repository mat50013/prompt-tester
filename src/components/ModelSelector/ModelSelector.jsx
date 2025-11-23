import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ModelSelectorReusable from './ModelSelectorReusable';
import { fetchAvailableModels, toggleModelSelection } from '../../store/modelsSlice';

const ModelSelector = () => {
  const dispatch = useDispatch();
  const { availableModels, selectedModels, loading, error } = useSelector((state) => state.models);

  const handleQuery = ({ searchTerm, limit }) => {
    dispatch(fetchAvailableModels({ searchTerm, limit }));
  };

  const handleSelectionChange = (newSelection) => {
    const added = newSelection.filter((id) => !selectedModels.includes(id));
    const removed = selectedModels.filter((id) => !newSelection.includes(id));

    added.forEach((id) => dispatch(toggleModelSelection(id)));
    removed.forEach((id) => dispatch(toggleModelSelection(id)));
  };

  return (
    <ModelSelectorReusable
      models={availableModels}
      selectedModels={selectedModels}
      onSelectionChange={handleSelectionChange}
      onQuery={handleQuery}
      loading={loading}
      error={error}
      multiSelect={true}
      title="Select Models"
      subtitle="Choose one or more models to test your prompts against"
      emptyMessage="Please select at least one model to run tests"
    />
  );
};

export default ModelSelector;
