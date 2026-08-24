import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: 'idle', // idle | submitting | done | error
  error: null,
  errorField: null,
};

const changePasswordSlice = createSlice({
  name: 'changePassword',
  initialState,
  reducers: {
    changePasswordSubmitted(state) {
      state.status = 'submitting';
      state.error = null;
      state.errorField = null;
    },
    changePasswordSucceeded(state) {
      state.status = 'done';
      state.error = null;
      state.errorField = null;
    },
    changePasswordFailed(state, action) {
      state.status = 'error';
      state.error = action.payload.message;
      state.errorField = action.payload.field ?? null;
    },
    changePasswordReset(state) {
      state.status = 'idle';
      state.error = null;
      state.errorField = null;
    },
  },
});

export const {
  changePasswordSubmitted,
  changePasswordSucceeded,
  changePasswordFailed,
  changePasswordReset,
} = changePasswordSlice.actions;
export default changePasswordSlice.reducer;
