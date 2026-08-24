/**
 * Shared Tailwind token classes for the auth feature's text/email/
 * password inputs. Extracted once SCR-003 needed the exact same base
 * class string as SCR-002's LoginScreen, to avoid drift between the
 * two (and the auth screens still to come — SCR-004 through SCR-008).
 */
export const inputBase =
  'h-9 w-full rounded-md border border-border bg-surface-card px-3 font-sans text-token-base text-text-primary placeholder:text-decorative-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary';
