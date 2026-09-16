import AccountSettingsLayout from './AccountSettingsLayout';

export default function SettingsShellScaffold({ activeItem, children }) {
  const itemLabels = {
    'change-password': 'Change password',
    'profile': 'Profile',
    'preferences': 'Preferences',
    'notifications': 'Notifications',
    'two-factor': 'Two-factor auth',
    'active-sessions': 'Active sessions',
    'team-members': 'Team members',
    'integrations': 'Integrations',
    'api-keys': 'API keys',
    'audit-logs': 'Audit logs',
  };

  return (
    <AccountSettingsLayout activeItem={activeItem} breadcrumbTail={itemLabels[activeItem] || 'Security'}>
      {children}
    </AccountSettingsLayout>
  );
}
