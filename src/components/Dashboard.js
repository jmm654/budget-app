import React from 'react';
import { formatKRW, formatDate, calcSummary, calcCumulativeBalance, calcCategorySpend, getMonthTransactions } from '../utils/helpers';

const s = {
  wrap: { padding: '16px 16px 20px' },
  summaryRow: { display: 'flex', gap: 10, marginBottom: 16 },
  summaryCard: (color, bg) => ({
    flex: 1,
    background: bg,
    borderRadius: 14,
    padding: '12px 14px',
    border: `1px solid ${color}33`,
  }),
  summaryLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  summaryAmount: (color) => ({ fontSize: 18, fontWeight: 700, color }),
  balanceCard: {
    background: 'linear-gradient(135deg,#1a0533 0%,#1E1E2E 100%)',
    borderRadius: 16,
    padding: '16px',
    marginBottom: 16,
    border: '1px solid #3D2D5D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLabel: { fontSize: 13, color: '#9CA3AF', marginBottom: 6 },
  balanceAmount: { fontSize: 28, fontWeight: 800, color: '#A78BFA' },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: '#9CA3AF', marginBottom: 10, letterSpacing: '0.5px' },
  alertCard: {
    background: '#1A0A0A',
    border: '1px solid #F8717133',
    borderRadius: 12,
    padding: '10px 14px',
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  alertBar: (pct, color) => ({
    height: 4,
    background: '#2D2D2D',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
    position: 'relative',
  }),
  alertFill: (pct, color) => ({
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: `${Math.min(pct, 100)}%`,
    background: color,
    borderRadius: 2,
    transition: 'width 0.5s ease',
  }),
  txItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 0',
    borderBottom: '1px solid #1E1E1E',
    cursor: 'pointer',
  },
  txIcon: (color) => ({
    width: 40,
    height: 40,
    borderRadius: 10,
    background: color + '22',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    flexShrink: 0,
  }),
  txInfo: { flex: 1, minWidth: 0 },
  txName: { fontSize: 14, fontWeight: 600, color: '#F9FAFB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  txDate: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  txAmount: (type) => ({ fontSize: 15, fontWeight: 700, color: type === 'income' ? '#10B981' : '#F87171', flexShrink: 0 }),
  fab: {
    position: 'fixed',
    bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
    right: 'calc(50% - 207px)',
    width: 56,
    height: 56,
    borderRadius: 28,
    background: 'linear-gradient(135deg,#7C3AED,#8B5CF6)',
    color: 'white',
    fontSize: 26,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(139,92,246,0.5)',
    cursor: 'pointer',
    zIndex: 90,
    border: 'none',
  },
  emptyText: { textAlign: 'center', color: '#6B7280', fontSize: 14, padding: '20px 0' },
};

export default function Dashboard({ transactions, budgets, year, month, categories, onEdit, onAddClick }) {
  const getCat = (id) => categories.find((c) => c.id === id) || categories[categories.length - 1];
  const monthTxs = getMonthTransactions(transactions, year, month);
  const { income, expense } = calcSummary(monthTxs);
  const balance = calcCumulativeBalance(transactions, year, month);
  const categorySpend = calcCategorySpend(monthTxs);
  const recent = [...monthTxs].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt).slice(0, 5);

  const budgetAlerts = categories.filter((c) => c.type === 'expense')
    .filter((cat) => budgets[cat.id] && categorySpend[cat.id])
    .map((cat) => {
      const pct = (categorySpend[cat.id] / budgets[cat.id]) * 100;
      return { ...cat, pct, spent: categorySpend[cat.id], budget: budgets[cat.id] };
    })
    .filter((a) => a.pct >= 80)
    .sort((a, b) => b.pct - a.pct);

  return (
    <div style={s.wrap}>
      {/* Balance Card */}
      <div style={s.balanceCard}>
        <div>
          <div style={s.balanceLabel}>누적 잔액 (이월)</div>
          <div style={s.balanceAmount}>{formatKRW(balance)}</div>
        </div>
        <span style={{ fontSize: 36 }}>💰</span>
      </div>

      {/* Income / Expense Summary */}
      <div style={s.summaryRow}>
        <div style={s.summaryCard('#10B981', 'rgba(16,185,129,0.08)')}>
          <div style={s.summaryLabel}>수입</div>
          <div style={s.summaryAmount('#10B981')}>{formatKRW(income)}</div>
        </div>
        <div style={s.summaryCard('#F87171', 'rgba(248,113,113,0.08)')}>
          <div style={s.summaryLabel}>지출</div>
          <div style={s.summaryAmount('#F87171')}>{formatKRW(expense)}</div>
        </div>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={s.sectionTitle}>⚠️ 예산 알림</div>
          {budgetAlerts.map((a) => {
            const isOver = a.pct >= 100;
            const color = isOver ? '#EF4444' : '#FBBF24';
            return (
              <div key={a.id} style={{ ...s.alertCard, borderColor: color + '44', background: color + '0A' }}>
                <div style={{ flex: 1 }}>
                  <div style={s.alertLeft}>
                    <span style={{ fontSize: 16 }}>{a.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#F9FAFB' }}>{a.name}</span>
                    <span style={{ fontSize: 11, color, fontWeight: 700 }}>
                      {isOver ? '초과!' : `${Math.round(a.pct)}%`}
                    </span>
                  </div>
                  <div style={{ ...s.alertBar(a.pct, color), width: '100%' }}>
                    <div style={s.alertFill(a.pct, color)} />
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                    {formatKRW(a.spent)} / {formatKRW(a.budget)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <div style={s.sectionTitle}>최근 내역</div>
        {recent.length === 0 ? (
          <div style={s.emptyText}>내역이 없습니다.<br />+ 버튼으로 추가해보세요!</div>
        ) : (
          recent.map((tx) => {
            const cat = getCat(tx.category);
            return (
              <div key={tx.id} style={s.txItem} onClick={() => onEdit(tx.id)}>
                <div style={s.txIcon(cat.color)}>{cat.icon}</div>
                <div style={s.txInfo}>
                  <div style={s.txName}>{tx.description || cat.name}</div>
                  <div style={s.txDate}>{formatDate(tx.date)} · {cat.name}</div>
                </div>
                <div style={s.txAmount(tx.type)}>
                  {tx.type === 'income' ? '+' : '-'}{formatKRW(tx.amount)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FAB */}
      <button style={s.fab} onClick={onAddClick} aria-label="내역 추가">＋</button>
    </div>
  );
}
