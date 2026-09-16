import { createSlice } from '@reduxjs/toolkit';
import { ROLES } from '../rbac/permissions';

/**
 * Current-session shell state — who the AppShell is rendering for.
 *
 * MOCK BOUNDARY: MOD-002's login response does not yet return a role,
 * and MOD-003 (RBAC) has no backend, so there is no real signal for
 * "what role is this user" yet. `role` defaults to Data/ETL Engineer
 * (matching the Figma Sidebar frame's own footer, which shows
 * "Jane Doe / Data Engineer") and is switchable at runtime via
 * `roleChanged` purely so every role's filtered sidebar can be
 * exercised without a backend. Once MOD-002/MOD-003 ship, `role`
 * (and `currentUser`) must be derived from the authenticated session
 * response instead of this slice's static default.
 */
const initialState = {
  currentUser: { name: 'Jane Doe', initials: 'JD', email: 'jane.doe@acmecorp.io' },
  currentOrganization: {
    id: 'org-001',
    name: 'Acme Corp',
    fullName: 'Acme Corporation',
    initials: 'AC',
    plan: 'Enterprise',
    region: 'US East',
    role: 'Super Admin',
  },
  role: ROLES.DATA_ETL_ENGINEER,
  sidebarCollapsed: false,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    roleChanged(state, action) {
      state.role = action.payload;
    },
    organizationChanged(state, action) {
      state.currentOrganization = action.payload;
    },
    sidebarToggled(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
  },
});

export const { roleChanged, organizationChanged, sidebarToggled } = sessionSlice.actions;
export default sessionSlice.reducer;
