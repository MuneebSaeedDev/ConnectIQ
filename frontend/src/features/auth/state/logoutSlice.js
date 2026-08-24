import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: 'idle',
};

const logoutSlice = createSlice({
  name: 'logout',
  initialState,
  reducers: {
    logoutSubmitted(state) {
      state.status = 'submitting';
    },
    logoutSucceeded(state) {
      state.status = 'done';
    },
    logoutReset(state) {
      state.status = 'idle';
    },
  },
});

export const { logoutSubmitted, logoutSucceeded, logoutReset } = logoutSlice.actions;
export default logoutSlice.reducer;
