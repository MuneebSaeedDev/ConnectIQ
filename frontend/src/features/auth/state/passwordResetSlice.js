import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: 'idle', // idle | submitting | sent | error
  error: null,
};

const passwordResetSlice = createSlice({
  name: 'passwordReset',
  initialState,
  reducers: {
    resetRequestSubmitted(state) {
      state.status = 'submitting';
      state.error = null;
    },
    resetRequestSucceeded(state) {
      state.status = 'sent';
      state.error = null;
    },
    resetRequestFailed(state, action) {
      state.status = 'error';
      state.error = action.payload;
    },
    resetRequestReset(state) {
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const {
  resetRequestSubmitted,
  resetRequestSucceeded,
  resetRequestFailed,
  resetRequestReset,
} = passwordResetSlice.actions;
export default passwordResetSlice.reducer;
