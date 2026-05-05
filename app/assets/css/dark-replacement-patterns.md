# Dark Replacement Patterns

Use this as a find/replace guide while converting components to dark mode.

| Current class pattern | Dark replacement pattern |
|---|---|
| `bg-white` | `bg-white dark:bg-[var(--surface)]` |
| `bg-gray-50` / `bg-gray-50/30` / `bg-gray-100/50` | `... dark:bg-[var(--surface-2)]` |
| `text-gray-900` / `text-slate-900` | `... dark:text-[var(--text)]` |
| `text-gray-700` / `text-gray-600` / `text-gray-500` | `... dark:text-[var(--text-muted)]` |
| `border-gray-200` / `border-gray-100` | `... dark:border-[var(--border)]` |
| Very soft separators (`border-gray-50`) | `... dark:border-[var(--border-soft)]` |
| `hover:bg-gray-50` / `hover:bg-gray-100` | `... dark:hover:bg-[var(--surface-2)]` |
| `bg-emerald-600` buttons | Keep + add `dark:hover:bg-[var(--accent-hover)]` if needed |
| `text-emerald-700` | `text-emerald-700 dark:text-[var(--accent)]` |
| `bg-emerald-50` pills/badges | `... dark:bg-[var(--accent-soft)]` |
| `shadow-*` on white cards | Reduce glow: `dark:shadow-none` or subtle dark shadow |

## File Type Decision

- Use `.css` for actual theme tokens (already done in `theme-dark.css`).
- Use `.md` for replacement rules/checklists (this file).
- Use Tailwind config only if you want named colors/utilities instead of raw `var(--...)` classes.
