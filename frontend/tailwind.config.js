/**
 * Tailwind theme extended with the project's design tokens
 * (see src/styles/tokens.css, reverse-engineered from Figma —
 * docs/figma/design-system-notes.md). Tokens stay defined as CSS
 * variables so non-Tailwind CSS can keep using them directly; this
 * config just exposes the same values as Tailwind utilities so
 * components can use `bg-primary`, `text-meta`, `p-5`, etc.
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'text-primary': 'var(--color-text-primary)',
        'text-primary-alt': 'var(--color-text-primary-alt)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-secondary-alt': 'var(--color-text-secondary-alt)',
        'text-secondary-strong': 'var(--color-text-secondary-strong)',
        'text-tertiary': 'var(--color-text-tertiary)',
        'text-muted': 'var(--color-text-muted)',
        'text-muted-alt': 'var(--color-text-muted-alt)',
        'text-faint': 'var(--color-text-faint)',
        'text-on-primary': 'var(--color-text-on-primary)',
        border: 'var(--color-border)',
        'border-subtle': 'var(--color-border-subtle)',
        'border-faint': 'var(--color-border-faint)',
        'decorative-muted': 'var(--color-decorative-muted)',
        'decorative-faint': 'var(--color-decorative-faint)',
        'surface-page': 'var(--color-surface-page)',
        'surface-card': 'var(--color-surface-card)',
        'surface-muted': 'var(--color-surface-muted)',
        'surface-muted-alt': 'var(--color-surface-muted-alt)',
        'surface-hover': 'var(--color-surface-hover)',
        success: 'var(--color-success)',
        'success-strong': 'var(--color-success-strong)',
        'success-bg': 'var(--color-success-bg)',
        danger: 'var(--color-danger)',
        'danger-strong': 'var(--color-danger-strong)',
        'danger-bg': 'var(--color-danger-bg)',
        'danger-border': 'var(--color-danger-border)',
        warning: 'var(--color-warning)',
        'warning-bg': 'var(--color-warning-bg)',
        'overlay-scrim': 'var(--color-overlay-scrim)',
        'shell-accent': 'var(--color-shell-accent)',
        'shell-accent-wash': 'var(--color-shell-accent-wash)',
        'shell-accent-border': 'var(--color-shell-accent-border)',
        'shell-nav-active-bg': 'var(--color-shell-nav-active-bg)',
        'shell-nav-text': 'var(--color-shell-nav-text)',
        'shell-nav-text-strong': 'var(--color-shell-nav-text-strong)',
        'shell-nav-heading': 'var(--color-shell-nav-heading)',
        'shell-badge-bg': 'var(--color-shell-badge-bg)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'Consolas', 'monospace'],
      },
      fontSize: {
        'token-xs': 'var(--text-xs)',
        'token-meta': 'var(--text-meta)',
        'token-sm': 'var(--text-sm)',
        'token-base': 'var(--text-base)',
        'token-lg': 'var(--text-lg)',
        'token-xl': 'var(--text-xl)',
      },
      spacing: {
        'token-1': 'var(--space-1)',
        'token-2': 'var(--space-2)',
        'token-3': 'var(--space-3)',
        'token-4': 'var(--space-4)',
        'token-5': 'var(--space-5)',
        'token-6': 'var(--space-6)',
        'token-7': 'var(--space-7)',
        'token-8': 'var(--space-8)',
        'token-9': 'var(--space-9)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
      },
      backgroundImage: {
        'shell-avatar': 'var(--gradient-shell-avatar)',
      },
    },
  },
  plugins: [],
};
