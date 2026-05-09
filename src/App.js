import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import TabBar from './components/TabBar';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import BudgetScreen from './components/BudgetScreen';
import AnalysisScreen from './components/AnalysisScreen';
import SettingsScreen, { CategoryForm, AddRecurringForm } from './components/SettingsScreen';
import {
  loadTransactions, saveTransactions,
  loadBudgets, saveBudgets,
  loadRecurring, saveRecurring,
  loadCustomCategories, saveCustomCategories,
} from './utils/storage';
import { CATEGORIES } from './utils/categories';
import { applyRecurring, calcCategorySpend, getMonthTransactions, generateId, getCurrentPeriod, getPeriodForDate } from './utils/helpers';

const NOTIFICATION_DURATION = 4000;

const toastStyle = (visible) => ({
  position: 'fixed',
  top: 70,
  left: '50%',
  transform: `translateX(-50%) translateY(${visible ? 0 : -80}px)`,
  opacity: visible ? 1 : 0,
  transition: 'all 0.3s ease',
  zIndex: 300,
  background: '#1E1E2E',
  border: '1px solid #3D3D5D',
  borderRadius: 12,
  padding: '12px 18px',
  fontSize: 14,
  color: '#F9FAFB',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  maxWidth: 360,
  width: 'calc(100vw - 32px)',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  pointerEvents: 'none',
});

function Toast({ message, visible }) {
  return (
    <div style={toastStyle(visible)}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>
        {message?.startsWith('🚨') ? '🚨' : message?.startsWith('⚠️') ? '⚠️' : '✓'}
      </span>
      <span>{message}</span>
    </div>
  );
}

export default function App() {
  const [year, setYear] = useState(() => getCurrentPeriod().year);
  const [month, setMonth] = useState(() => getCurrentPeriod().month);
  const [activeTab, setActiveTab] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [transactions, setTransactions] = useState(() => loadTransactions());
  const [budgets, setBudgets] = useState(() => loadBudgets());
  const [recurring, setRecurring] = useState(() => loadRecurring());
  const [customCategories, setCustomCategories] = useState(() => loadCustomCategories());
  const [toast, setToast] = useState({ message: '', visible: false });
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showRecurringForm, setShowRecurringForm] = useState(false);

  const allCategories = useMemo(
    () => [...CATEGORIES, ...customCategories],
    [customCategories]
  );

  const showToast = useCallback((message) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), NOTIFICATION_DURATION);
  }, []);

  useEffect(() => {
    const recurringList = loadRecurring();
    const existing = loadTransactions();
    const newTxs = applyRecurring(recurringList, existing);
    if (newTxs.length > 0) {
      const updated = [...existing, ...newTxs];
      saveTransactions(updated);
      setTransactions(updated);
      showToast(`🔄 반복 내역 ${newTxs.length}건이 자동 추가되었습니다`);
    }
  }, [showToast]);

  const checkBudgetAlert = useCallback((updatedTxs, savedTx, cats) => {
    if (savedTx.type !== 'expense') return;
    const budget = budgets[savedTx.category];
    if (!budget) return;
    const { year: txYear, month: txMonth } = getPeriodForDate(savedTx.date);
    const monthTxs = getMonthTransactions(updatedTxs, txYear, txMonth);
    const spend = calcCategorySpend(monthTxs);
    const spent = spend[savedTx.category] || 0;
    const pct = (spent / budget) * 100;
    const catName = cats.find((c) => c.id === savedTx.category)?.name || savedTx.category;
    if (pct >= 100) {
      showToast(`🚨 ${catName} 예산을 초과했습니다! (${Math.round(pct)}%)`);
    } else if (pct >= 80) {
      showToast(`⚠️ ${catName} 예산의 ${Math.round(pct)}%에 도달했습니다`);
    }
  }, [budgets, showToast]);

  const handleSaveTransaction = useCallback((tx) => {
    setTransactions((prev) => {
      const exists = prev.find((t) => t.id === tx.id);
      const updated = exists ? prev.map((t) => (t.id === tx.id ? tx : t)) : [...prev, tx];
      saveTransactions(updated);
      checkBudgetAlert(updated, tx, allCategories);
      return updated;
    });
    setShowForm(false);
    setEditingId(null);
    showToast(transactions.find((t) => t.id === tx.id) ? '✓ 수정되었습니다' : '✓ 추가되었습니다');
  }, [checkBudgetAlert, showToast, transactions, allCategories]);

  const handleDeleteTransaction = useCallback((id) => {
    if (!window.confirm('이 내역을 삭제할까요?')) return;
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveTransactions(updated);
      return updated;
    });
    showToast('✓ 삭제되었습니다');
  }, [showToast]);

  const handleEditTransaction = useCallback((id) => {
    setEditingId(id);
    setShowForm(true);
  }, []);

  const handleUpdateBudget = useCallback((catId, amount) => {
    setBudgets((prev) => {
      const updated = { ...prev, [catId]: amount };
      if (amount === 0) delete updated[catId];
      saveBudgets(updated);
      return updated;
    });
  }, []);

  const handleAddRecurring = useCallback((r) => {
    setRecurring((prev) => {
      const updated = [...prev, r];
      saveRecurring(updated);
      return updated;
    });
    showToast('✓ 반복 내역이 추가되었습니다');
  }, [showToast]);

  const handleToggleRecurring = useCallback((id) => {
    setRecurring((prev) => {
      const updated = prev.map((r) => r.id === id ? { ...r, isActive: !r.isActive } : r);
      saveRecurring(updated);
      return updated;
    });
  }, []);

  const handleDeleteRecurring = useCallback((id) => {
    if (!window.confirm('이 반복 내역을 삭제할까요?')) return;
    setRecurring((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveRecurring(updated);
      return updated;
    });
    showToast('✓ 반복 내역이 삭제되었습니다');
  }, [showToast]);

  const handleAddCategory = useCallback((cat) => {
    setCustomCategories((prev) => {
      const updated = [...prev, { ...cat, isCustom: true }];
      saveCustomCategories(updated);
      return updated;
    });
    showToast('✓ 카테고리가 추가되었습니다');
  }, [showToast]);

  const handleDeleteCategory = useCallback((id) => {
    if (!window.confirm('이 카테고리를 삭제할까요?\n해당 카테고리의 기존 내역은 유지됩니다.')) return;
    setCustomCategories((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveCustomCategories(updated);
      return updated;
    });
    showToast('✓ 카테고리가 삭제되었습니다');
  }, [showToast]);

  const handlePrevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  };

  const handleNextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  };

  const handleToday = () => {
    const { year: y, month: m } = getCurrentPeriod();
    setYear(y);
    setMonth(m);
  };

  const isCurrentMonth = (() => { const p = getCurrentPeriod(); return year === p.year && month === p.month; })();

  const screenProps = { transactions, year, month, categories: allCategories };

  return (
    <>
      <Header
        year={year}
        month={month}
        onPrev={handlePrevMonth}
        onNext={handleNextMonth}
        onToday={handleToday}
        isCurrentMonth={isCurrentMonth}
      />

      <main className="screen">
        {activeTab === 0 && (
          <Dashboard
            {...screenProps}
            budgets={budgets}
            onEdit={handleEditTransaction}
            onAddClick={() => { setEditingId(null); setShowForm(true); }}
          />
        )}
        {activeTab === 1 && (
          <TransactionList
            {...screenProps}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            onAddClick={() => { setEditingId(null); setShowForm(true); }}
          />
        )}
        {activeTab === 2 && (
          <BudgetScreen
            {...screenProps}
            budgets={budgets}
            onUpdateBudget={handleUpdateBudget}
          />
        )}
        {activeTab === 3 && (
          <AnalysisScreen {...screenProps} />
        )}
        {activeTab === 4 && (
          <SettingsScreen
            categories={allCategories}
            recurring={recurring}
            onAddRecurring={handleAddRecurring}
            onToggleRecurring={handleToggleRecurring}
            onDeleteRecurring={handleDeleteRecurring}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onShowCategoryForm={() => setShowCategoryForm(true)}
            onShowRecurringForm={() => setShowRecurringForm(true)}
          />
        )}
      </main>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {showForm && (
        <TransactionForm
          editingId={editingId}
          transactions={transactions}
          categories={allCategories}
          onSave={handleSaveTransaction}
          onClose={() => { setShowForm(false); setEditingId(null); }}
        />
      )}

      {showCategoryForm && (
        <CategoryForm
          onSave={(cat) => { handleAddCategory(cat); setShowCategoryForm(false); }}
          onClose={() => setShowCategoryForm(false)}
        />
      )}

      {showRecurringForm && (
        <AddRecurringForm
          categories={allCategories}
          onSave={(r) => { handleAddRecurring(r); setShowRecurringForm(false); }}
          onClose={() => setShowRecurringForm(false)}
        />
      )}

      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}
