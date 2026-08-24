import { QueryClient } from '@tanstack/react-query';

// React Query owns server state (agent.md §4.1). Shared defaults live
// here so every module's queries behave consistently rather than
// re-deriving retry/staleness policy per feature.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
