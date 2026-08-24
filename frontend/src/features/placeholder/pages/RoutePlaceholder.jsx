/**
 * Stand-in for a screen not yet built by the frontend-screen-builder
 * workflow. Renders the route so navigation from a completed screen
 * (e.g. Splash Screen → /login) doesn't dead-end, without pretending
 * the target screen is implemented.
 */
export default function RoutePlaceholder({ screenId, title }) {
  return (
    <div className="p-12 font-sans">
      <p className="m-0 font-mono text-token-meta text-text-muted">{screenId} · PLANNED</p>
      <h1 className="mt-2 text-xl font-semibold">{title}</h1>
      <p className="text-text-secondary">
        This screen has not been built yet by the frontend-screen-builder workflow.
      </p>
    </div>
  );
}
