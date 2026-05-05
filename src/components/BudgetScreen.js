import React, { useState } from 'react';
import { formatKRW, calcCategorySpend, getMonthTransactions } from '../utils/helpers';
import { getExpenseCategories } from '../utils/categories';

const s = {
  wrap: { padding: '16px 16px 80px' },
  info: {
    background: 'rgba(139,92,246,0.1)',
    border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 13,
    color: '#A78BFA',
    marginBottom: 16,
    lineHeight: 1.6,
  },
  card: {
    background: '#1A1A1A',
    borderRadius: 14,
    padding: '14px',
    marginBottom: 10,
    border: '1px solid #2D2D2D',
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  catIcon: (color) => ({
    width: 36,
    height: 36,
    borderRadius: 10,
    background: color + '22',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    flexShrink: 0,
  }),
  catInfo: { flex: 1 },
  catName: { fontSize: 14, fontWeight: 600, color: '#F9FAFB' },
  catSpent: (color) => ({ fontSize: 12, color, marginTop: 2 }),
  inputWrap: { display: 'flex', alignItems: 'center', gap: 8 },
  budgetInput: (focused) => ({
    flex: 1,
    background: '#252525',
    border: `1px solid ${focused ? '#8B5CF6' : '#3D3D3D'}`,
    borderRadius: 8,
    padding: '8px 12px',
    color: '#F9FAFB',
    fontSize: 14,
    textAlign: 'right',
  }),
  clearBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: '#252525',
    border: '1px solid #3D3D3D',
    color: '#9CA3AF',
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barWrap: { height: 6, background: '#2D2D2D', borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  barFill: (pct, color) => ({
    height: '100%',
    width: `${Math.min(pct, 100)}%`,
    background: color,
    borderRadius: 3,
    transition: 'width 0.4s ease',
  }),
  pctLabel: (color) => ({ fontSize: 11, color, marginTop: 4, textAlign: 'right' }),
  sectionTitle: { fontSize: 14, fontWeight: 700, color: '#9CA3AF', marginBottom: 10, letterSpacing: '0.5px' },
};

function getBarColor(pct) {
  if (pct >= 100) return '#EF4444';
  if (pct >= 80) return '#FBBF24';
  return '#10B981';
}

export default function BudgetScreen({ budgets, onUpdateBudget, transactions, year, month }) {
  const [focused, setFocused] = useState(null);
  const [localValues, setLocalValues] = useState({});
  const monthTxs = getMonthTransactions(transactions, year, month);
  const categorySpend = calcCategorySpend(monthTxs);
  const expenseCats = getExpenseCategories();

  const handleChange = (id, val) => {
    const raw = val.replace(/[^0-9]/g, '');
    setLocalValues((prev) => ({ ...prev, [id]: raw }));
  };

  const handleBlur = (id) => {
    const val = localValues[id];
    if (val !== undefined) {
      const num = parseInt(val, 10) || 0;
      onUpdateBudget(id, num);
      setLocalValues((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
    setFocused(null);
  };

  const getDisplayValue = (id) => {
    if (localValues[id] !== undefined) return localValues[id];
    const b = budgets[id];
    return b ? String(b) : '';
  };

  return (
    <div style={s.wrap}>
      <div style={s.info}>
        💡 카테고리별 월 예산을 설정하면 80% 도달 시 주의, 100% 초과 시 경고 알림이 표시됩니다.
      </div>
      <div style={s.sectionTitle}>지출 카테고리 예산</div>
      {expenseCats.map((cat) => {
        const spent = categorySpend[cat.id] || 0;
        const budget = budgets[cat.id] || 0;
        const pct = budget > 0 ? (spent / budget) * 100 : 0;
        const barColor = getBarColor(pct);

        return (
          <div key={cat.id} style={s.card}>
            <div style={s.cardTop}>
              <div style={s.catIcon(cat.color)}>{cat.icon}</div>
              <div style={s.catInfo}>
                <div style={s.catName}>{cat.name}</div>
                <div style={s.catSpent(spent > 0 ? '#9CA3AF' : '#6B7280')}>
                  이번 달: {formatKRW(spent)}
                </div>
              </div>
            </div>

            <div style={s.inputWrap}>
              <span style={{ fontSize: 13, color: '#6B7280', flexShrink: 0 }}>예산 ₩</span>
              <input
                style={s.budgetInput(focused === cat.id)}
                type="tel"
                inputMode="numeric"
                placeholder="0"
                value={getDisplayValue(cat.id)}
                onChange={(e) => handleChange(cat.id, e.target.value)}
                onFocus={() => setFocused(cat.id)}
                onBlur={() => handleBlur(cat.id)}
              />
              {budgets[cat.id] > 0 && (
                <button style={s.clearBtn} onClick={() => onUpdateBudget(cat.id, 0)}>✕</button>
              )}
            </div>

            {budget > 0 && (
              <>
                <div style={s.barWrap}>
                  <div style={s.barFill(pct, barColor)} />
                </div>
                <div style={s.pctLabel(barColor)}>
                  {pct >= 100
                    ? `🚨 ${formatKRW(spent - budget)} 초과`
                    : `${Math.round(pct)}% 사용 · ${formatKRW(budget - spent)} 남음`}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
