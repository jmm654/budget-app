# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite, http://localhost:5173)
npm run build     # Build to /build directory
npm run preview   # Preview production build locally
```

No test runner or linter is configured.

## Architecture

This is a mobile-first PWA budget tracker built with React 18 + Vite. All data is persisted in `localStorage` — there is no backend or API.

### State ownership

All application state lives in `App.js`. Every screen component is stateless and receives data + callbacks via props. The `screenProps` pattern (`{ transactions, year, month, categories }`) is passed to most screens.

### Data layer (`src/utils/storage.js`)

Four independent localStorage keys:
- `budget_transactions` — array of transaction objects `{ id, type, amount, category, description, date, recurringId?, createdAt }`
- `budget_budgets` — object mapping category id → monthly budget amount
- `budget_recurring` — array of recurring rule objects `{ id, type, amount, category, description, frequency, dayOfWeek?, dayOfMonth?, startDate, isActive }`
- `budget_custom_categories` — array of user-defined category objects with `isCustom: true`

### Categories (`src/utils/categories.js`)

`CATEGORIES` is the built-in list (12 entries). `allCategories` in `App.js` merges built-in + custom: `[...CATEGORIES, ...customCategories]`. Custom categories are identified by `isCustom: true` and their ids are prefixed with `custom_`.

### Recurring transactions

On every app load, `applyRecurring()` in `helpers.js` checks active recurring rules against today and injects missing transactions. Deduplication is done via `recurringId` field matching on existing transactions.

### Tabs (activeTab index → screen)

| Index | Screen |
|-------|--------|
| 0 | Dashboard |
| 1 | TransactionList |
| 2 | BudgetScreen |
| 3 | AnalysisScreen |
| 4 | SettingsScreen |

### Modal/popup rendering

`TransactionForm`, `CategoryForm`, and `AddRecurringForm` are rendered at the `App.js` level (not inside screen components) to avoid z-index stacking issues with `TabBar`. `CategoryForm` and `AddRecurringForm` are exported named exports from `SettingsScreen.js`.

### Styling

All styles are inline JS objects (no CSS-in-JS library, no CSS modules). Global base styles are in `src/index.css`. The `.screen` class handles the main scrollable content area between Header and TabBar; popups temporarily set `.screen { overflow-y: hidden }` via `useEffect` to lock background scroll.

### Budget alerts

`checkBudgetAlert()` in `App.js` runs after every transaction save. It computes category spend for the transaction's month and shows a toast at 80% (warning) or 100%+ (critical) of budget.
