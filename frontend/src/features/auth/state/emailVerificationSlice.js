import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  resendStatus: 'idle', // idle | submitting | sent | error
  resendError: null,
  confirmStatus: 'idle', // idle | submitting | verified | error
  confirmError: null,
};

const emailVerificationSlice = createSlice({
  name: 'emailVerification',
  initialState,
  reducers: {
    resendSubmitted(state) {
      state.resendStatus = 'submitting';
      state.resendError = null;
    },
    resendSucceeded(state) {
      state.resendStatus = 'sent';
      state.resendError = null;
    },
    resendFailed(state, action) {
      state.resendStatus = 'error';
      state.resendError = action.payload;
    },
    confirmSubmitted(state) {
      state.confirmStatus = 'submitting';
      state.confirmError = null;
    },
    confirmSucceeded(state) {
      state.confirmStatus = 'verified';
      state.confirmError = null;
    },
    confirmFailed(state, action) {
      state.confirmStatus = 'error';
      state.confirmError = action.payload;
    },
    emailVerificationReset(state) {
      state.resendStatus = 'idle';
      state.resendError = null;
      state.confirmStatus = 'idle';
      state.confirmError = null;
    },
  },
});

export const {
  resendSubmitted,
  resendSucceeded,
  resendFailed,
  confirmSubmitted,
  confirmSucceeded,
  confirmFailed,
  emailVerificationReset,
} = emailVerificationSlice.actions;
export default emailVerificationSlice.reducer;
