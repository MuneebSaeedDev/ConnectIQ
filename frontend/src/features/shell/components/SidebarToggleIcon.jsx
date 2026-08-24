/**
 * New collapse/expand icon for the Sidebar toggle button — not sourced
 * from Figma (no frame defines a redesigned icon; this is the user's
 * explicit "minimize button icon must be new" request during the
 * MOD-001 shell redesign pass, confirmed via user choice: a
 * double-chevron (« ») glyph that flips direction with the sidebar's
 * collapsed state, rather than reusing the static Figma-exported
 * `sidebar-toggle.svg` asset).
 *
 * Drawn as inline SVG (not an exported asset) since there is no
 * source frame to download from — this is new, hand-authored iconography.
 */
export default function SidebarToggleIcon({ collapsed }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      className={`transition-transform duration-150 ${collapsed ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path
        d="M9.5 3.5L5.5 7.5L9.5 11.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 3.5L8.5 7.5L12.5 11.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
    </svg>
  );
}
