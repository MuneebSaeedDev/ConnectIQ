import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  verifyStatus: 'idle', // idle | submitting | verified | error
  verifyError: null,
  resendStatus: 'idle', // idle | submitting | sent | error
  resendError: null,
};

const twoFactorSlice = createSlice({
  name: 'twoFactor',
  initialState,
  reducers: {
    verifySubmitted(state) {
      state.verifyStatus = 'submitting';
      state.verifyError = null;
    },
    verifySucceeded(state) {
      state.verifyStatus = 'verified';
      state.verifyError = null;
    },
    verifyFailed(state, action) {
      state.verifyStatus = 'error';
      state.verifyError = action.payload;
    },
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
    twoFactorReset(state) {
      state.verifyStatus = 'idle';
      state.verifyError = null;
      state.resendStatus = 'idle';
      state.resendError = null;
    },
  },
});

export const {
  verifySubmitted,
  verifySucceeded,
  verifyFailed,
  resendSubmitted,
  resendSucceeded,
  resendFailed,
  twoFactorReset,
} = twoFactorSlice.actions;
export default twoFactorSlice.reducer;
