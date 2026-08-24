import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  steps: [
    { id: 'config', label: 'Loading configuration', status: 'pending' },
    { id: 'connectivity', label: 'Checking platform connectivity', status: 'pending' },
    { id: 'session', label: 'Restoring session', status: 'pending' },
  ],
  error: null,
  complete: false,
};

const bootstrapSlice = createSlice({
  name: 'bootstrap',
  initialState,
  reducers: {
    stepStarted(state, action) {
      const step = state.steps.find((s) => s.id === action.payload);
      if (step) step.status = 'running';
    },
    stepSucceeded(state, action) {
      const step = state.steps.find((s) => s.id === action.payload);
      if (step) step.status = 'done';
    },
    stepFailed(state, action) {
      const step = state.steps.find((s) => s.id === action.payload.id);
      if (step) step.status = 'error';
      state.error = action.payload.message;
    },
    bootstrapCompleted(state) {
      state.complete = true;
    },
    bootstrapReset(state) {
      state.steps = initialState.steps.map((s) => ({ ...s, status: 'pending' }));
      state.error = null;
      state.complete = false;
    },
  },
});

export const {
  stepStarted,
  stepSucceeded,
  stepFailed,
  bootstrapCompleted,
  bootstrapReset,
} = bootstrapSlice.actions;

export default bootstrapSlice.reducer;
