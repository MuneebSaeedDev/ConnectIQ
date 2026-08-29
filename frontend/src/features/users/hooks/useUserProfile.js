import { useQuery } from '@tanstack/react-query';
import { getMyProfile } from '../services/userProfile.api';

/**
 * React Query hook for the User Profile Screen (SCR-036) — the signed-in
 * user's own profile. Keyed on the current identity ('me' until real
 * auth context ships). `staleTime: 30s` and no window-focus refetch,
 * matching the sibling MOD-005 read screens, so a form the user is
 * editing does not get clobbered by a background refetch.
 */
export function useMyProfile() {
  return useQuery({
    queryKey: ['users', 'me', 'profile'],
    queryFn: () => getMyProfile(),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
