const KEYS = {
  TRANSACTIONS: 'budget_transactions',
  BUDGETS: 'budget_budgets',
  RECURRING: 'budget_recurring',
  CUSTOM_CATEGORIES: 'budget_custom_categories',
  ASSETS: 'budget_assets',
  SETTINGS: 'budget_settings',
};

const load = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export const loadTransactions = () => load(KEYS.TRANSACTIONS, []);
export const saveTransactions = (transactions) => save(KEYS.TRANSACTIONS, transactions);

export const loadBudgets = () => load(KEYS.BUDGETS, {});
export const saveBudgets = (budgets) => save(KEYS.BUDGETS, budgets);

export const loadRecurring = () => load(KEYS.RECURRING, []);
export const saveRecurring = (recurring) => save(KEYS.RECURRING, recurring);

export const loadCustomCategories = () => load(KEYS.CUSTOM_CATEGORIES, []);
export const saveCustomCategories = (cats) => save(KEYS.CUSTOM_CATEGORIES, cats);

export const loadAssets = () => load(KEYS.ASSETS, []);
export const saveAssets = (assets) => save(KEYS.ASSETS, assets);

export const loadSettings = () => load(KEYS.SETTINGS, {});
export const saveSettings = (settings) => save(KEYS.SETTINGS, settings);
