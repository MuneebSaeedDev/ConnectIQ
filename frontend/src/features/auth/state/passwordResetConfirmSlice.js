import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: 'idle', // idle | submitting | done | error
  error: null,
};

const passwordResetConfirmSlice = createSlice({
  name: 'passwordResetConfirm',
  initialState,
  reducers: {
    confirmSubmitted(state) {
      state.status = 'submitting';
      state.error = null;
    },
    confirmSucceeded(state) {
      state.status = 'done';
      state.error = null;
    },
    confirmFailed(state, action) {
      state.status = 'error';
      state.error = action.payload;
    },
    confirmReset(state) {
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const { confirmSubmitted, confirmSucceeded, confirmFailed, confirmReset } =
  passwordResetConfirmSlice.actions;
export default passwordResetConfirmSlice.reducer;
