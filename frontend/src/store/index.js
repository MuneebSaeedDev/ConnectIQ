import { configureStore } from '@reduxjs/toolkit';
import bootstrapReducer from '../features/bootstrap/state/bootstrapSlice';
import authReducer from '../features/auth/state/authSlice';
import passwordResetReducer from '../features/auth/state/passwordResetSlice';
import passwordResetConfirmReducer from '../features/auth/state/passwordResetConfirmSlice';
import emailVerificationReducer from '../features/auth/state/emailVerificationSlice';
import twoFactorReducer from '../features/auth/state/twoFactorSlice';
import changePasswordReducer from '../features/settings/state/changePasswordSlice';
import logoutReducer from '../features/auth/state/logoutSlice';
import sessionReducer from '../features/shell/state/sessionSlice';

// Redux Toolkit holds shared client-side application state per the
// project's engineering framework (agent.md §4.1). Server state
// (API data) is owned by React Query, not this store.
export const store = configureStore({
  reducer: {
    bootstrap: bootstrapReducer,
    auth: authReducer,
    passwordReset: passwordResetReducer,
    passwordResetConfirm: passwordResetConfirmReducer,
    emailVerification: emailVerificationReducer,
    twoFactor: twoFactorReducer,
    changePassword: changePasswordReducer,
    logout: logoutReducer,
    session: sessionReducer,
  },
});
