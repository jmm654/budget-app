export const CATEGORIES = [
  { id: 'salary',    name: '급여',  type: 'income',  icon: '💼', color: '#10B981' },
  { id: 'side',      name: '부수입', type: 'income',  icon: '💵', color: '#34D399' },
  { id: 'food',      name: '식비',  type: 'expense', icon: '🍽️', color: '#F87171' },
  { id: 'transport', name: '교통',  type: 'expense', icon: '🚌', color: '#60A5FA' },
  { id: 'shopping',  name: '쇼핑',  type: 'expense', icon: '🛍️', color: '#C084FC' },
  { id: 'medical',   name: '의료',  type: 'expense', icon: '🏥', color: '#FB7185' },
  { id: 'culture',   name: '문화',  type: 'expense', icon: '🎬', color: '#FBBF24' },
  { id: 'cafe',      name: '카페',  type: 'expense', icon: '☕', color: '#A78BFA' },
  { id: 'telecom',   name: '통신',  type: 'expense', icon: '📱', color: '#34D399' },
  { id: 'housing',   name: '주거',  type: 'expense', icon: '🏠', color: '#F472B6' },
  { id: 'education', name: '교육',  type: 'expense', icon: '📚', color: '#818CF8' },
  { id: 'other',     name: '기타',  type: 'expense', icon: '📦', color: '#94A3B8' },
];

export const getCategoryById = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[11];
export const getIncomeCategories = () => CATEGORIES.filter((c) => c.type === 'income');
export const getExpenseCategories = () => CATEGORIES.filter((c) => c.type === 'expense');
