/**
 * Password requirement/strength evaluation shared by the Forget
 * Password Screen (SCR-004)'s new-password field. Requirements mirror
 * the Figma checklist (16:4550) exactly: 12+ chars, one uppercase, one
 * number, one special character. Strength is derived from how many of
 * those four requirements are met, not a separate heuristic, so the
 * meter and checklist never disagree.
 */

export const PASSWORD_REQUIREMENTS = [
  { key: 'length', label: 'At least 12 characters', test: (v) => v.length >= 12 },
  { key: 'uppercase', label: 'One uppercase letter (A–Z)', test: (v) => /[A-Z]/.test(v) },
  { key: 'number', label: 'One number (0–9)', test: (v) => /[0-9]/.test(v) },
  { key: 'special', label: 'One special character (!@#$…)', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const STRENGTH_LABELS = ['Too weak', 'Weak', 'Good', 'Strong'];
const STRENGTH_COLORS = ['#ef4444', '#f97316', '#eab308', '#16a34a'];

export function evaluatePasswordStrength(value) {
  const met = PASSWORD_REQUIREMENTS.map((req) => req.test(value));
  const score = value ? met.filter(Boolean).length : 0;
  const level = Math.max(score, value ? 1 : 0); // any non-empty input shows at least "Too weak"
  return {
    met,
    score,
    label: STRENGTH_LABELS[Math.max(level - 1, 0)],
    color: STRENGTH_COLORS[Math.max(level - 1, 0)],
    filledBars: level,
  };
}
