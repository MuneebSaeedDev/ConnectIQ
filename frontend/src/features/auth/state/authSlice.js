import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSubmitted(state) {
      state.status = 'submitting';
      state.error = null;
    },
    loginSucceeded(state) {
      state.status = 'idle';
      state.error = null;
    },
    loginFailed(state, action) {
      state.status = 'error';
      state.error = action.payload;
    },
    loginErrorCleared(state) {
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const { loginSubmitted, loginSucceeded, loginFailed, loginErrorCleared } = authSlice.actions;
export default authSlice.reducer;
