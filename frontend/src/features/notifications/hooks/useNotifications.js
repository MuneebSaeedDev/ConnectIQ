import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAllNotificationsRead } from '../services/notifications.api';

const QUERY_KEY = ['notifications', 'list'];

/**
 * Server state for SCR-012 (Notification Panel), owned by React
 * Query per agent.md §4.1. Polled every 30s so the bell's unread
 * count and panel content stay reasonably current without a
 * real-time push channel (that's MOD-010's unbuilt Socket.IO scope).
 */
export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getNotifications,
    refetchInterval: 30_000,
  });

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsRead,
    // True optimistic update: flip every item to read immediately
    // (onMutate, not onSuccess) so the badge/unread dots clear without
    // waiting on the request, with a snapshot to roll back on failure.
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData(QUERY_KEY);
      queryClient.setQueryData(QUERY_KEY, (current) => {
        if (!current) return current;
        return { ...current, items: current.items.map((item) => ({ ...item, unread: false })) };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
    },
  });

  const items = query.data?.items ?? [];
  const unreadCount = items.filter((item) => item.unread).length;

  return {
    items,
    unreadCount,
    mocked: query.data?.mocked ?? false,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    markAllRead: markAllRead.mutate,
    isMarkingAllRead: markAllRead.isPending,
    markAllReadFailed: markAllRead.isError,
  };
}
