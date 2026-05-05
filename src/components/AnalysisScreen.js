import React, { useMemo } from 'react';
import { formatKRW, calcSummary, calcCumulativeBalance, calcCategorySpend, getDailySpend, getMonthTransactions, getDaysInMonth } from '../utils/helpers';
import { getExpenseCategories, getCategoryById } from '../utils/categories';

const s = {
  wrap: { padding: '16px 16px 80px' },
  summaryCards: { display: 'flex', gap: 10, marginBottom: 20 },
  sCard: (color, bg) => ({
    flex: 1,
    background: bg,
    border: `1px solid ${color}33`,
    borderRadius: 14,
    padding: '12px',
    textAlign: 'center',
  }),
  sLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
  sAmount: (color) => ({ fontSize: 16, fontWeight: 700, color }),
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: '#9CA3AF', marginBottom: 12, letterSpacing: '0.5px' },
  catRow: { marginBottom: 10 },
  catTop: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  catDot: (color) => ({ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }),
  catName: { fontSize: 13, color: '#F9FAFB', flex: 1 },
  catAmt: { fontSize: 13, fontWeight: 700, color: '#F87171' },
  catPct: { fontSize: 11, color: '#6B7280', marginLeft: 6 },
  barBg: { height: 8, background: '#2D2D2D', borderRadius: 4, overflow: 'hidden' },
  barFill: (pct, color) => ({
    height: '100%',
    width: `${pct}%`,
    background: color,
    borderRadius: 4,
    transition: 'width 0.5s ease',
  }),
  dailyChart: { background: '#1A1A1A', borderRadius: 14, padding: '16px', border: '1px solid #2D2D2D' },
  barsRow: { display: 'flex', alignItems: 'flex-end', gap: 3, height: 80, marginBottom: 6 },
  bar: (heightPct, isToday) => ({
    flex: 1,
    height: `${heightPct}%`,
    minHeight: heightPct > 0 ? 4 : 0,
    background: isToday ? '#8B5CF6' : '#3D3D3D',
    borderRadius: '3px 3px 0 0',
    transition: 'height 0.4s ease',
    position: 'relative',
  }),
  dayLabels: { display: 'flex', gap: 3 },
  dayLabel: (isToday) => ({
    flex: 1,
    textAlign: 'center',
    fontSize: 8,
    color: isToday ? '#A78BFA' : '#6B7280',
    fontWeight: isToday ? 700 : 400,
  }),
  noData: { textAlign: 'center', color: '#6B7280', padding: '40px 0', fontSize: 14 },
  ratioBar: { height: 20, borderRadius: 10, display: 'flex', overflow: 'hidden', marginBottom: 10 },
  ratioFill: (flex, color) => ({ flex, background: color, minWidth: flex > 0 ? 4 : 0 }),
  ratioLegend: { display: 'flex', gap: 16, justifyContent: 'center' },
  legendDot: (color) => ({ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, marginRight: 4 }),
  legendLabel: { fontSize: 12, color: '#9CA3AF' },
};

export default function AnalysisScreen({ transactions, year, month }) {
  const monthTxs = getMonthTransactions(transactions, year, month);
  const { income, expense } = calcSummary(monthTxs);
  const balance = calcCumulativeBalance(transactions, year, month);
  const categorySpend = calcCategorySpend(monthTxs);
  const dailySpend = getDailySpend(monthTxs, year, month);
  const days = getDaysInMonth(year, month);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayIdx = isCurrentMonth ? today.getDate() - 1 : -1;

  const topCats = useMemo(() => {
    return getExpenseCategories()
      .map((cat) => ({ ...cat, amount: categorySpend[cat.id] || 0 }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [categorySpend]);

  const maxDaily = Math.max(...dailySpend, 1);
  const maxCat = topCats[0]?.amount || 1;

  return (
    <div style={s.wrap}>
      {/* Summary */}
      <div style={s.summaryCards}>
        <div style={s.sCard('#10B981', 'rgba(16,185,129,0.08)')}>
          <div style={s.sLabel}>수입</div>
          <div style={s.sAmount('#10B981')}>{formatKRW(income)}</div>
        </div>
        <div style={s.sCard('#F87171', 'rgba(248,113,113,0.08)')}>
          <div style={s.sLabel}>지출</div>
          <div style={s.sAmount('#F87171')}>{formatKRW(expense)}</div>
        </div>
        <div style={s.sCard('#A78BFA', 'rgba(167,139,250,0.08)')}>
          <div style={s.sLabel}>누적 잔액</div>
          <div style={s.sAmount(balance >= 0 ? '#A78BFA' : '#F87171')}>{formatKRW(balance)}</div>
        </div>
      </div>

      {/* Income vs Expense ratio bar */}
      {(income > 0 || expense > 0) && (
        <div style={{ ...s.section }}>
          <div style={s.sectionTitle}>수입 vs 지출</div>
          <div style={s.ratioBar}>
            <div style={s.ratioFill(income, '#10B981')} />
            <div style={s.ratioFill(expense, '#F87171')} />
          </div>
          <div style={s.ratioLegend}>
            <span>
              <span style={s.legendDot('#10B981')} />
              <span style={s.legendLabel}>수입 {income > 0 ? Math.round((income / (income + expense)) * 100) : 0}%</span>
            </span>
            <span>
              <span style={s.legendDot('#F87171')} />
              <span style={s.legendLabel}>지출 {expense > 0 ? Math.round((expense / (income + expense)) * 100) : 0}%</span>
            </span>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      <div style={s.section}>
        <div style={s.sectionTitle}>카테고리별 지출</div>
        {topCats.length === 0 ? (
          <div style={s.noData}>지출 내역이 없습니다</div>
        ) : (
          topCats.map((cat) => {
            const pct = Math.round((cat.amount / maxCat) * 100);
            const totalPct = expense > 0 ? Math.round((cat.amount / expense) * 100) : 0;
            return (
              <div key={cat.id} style={s.catRow}>
                <div style={s.catTop}>
                  <span style={{ fontSize: 16 }}>{cat.icon}</span>
                  <span style={s.catName}>{cat.name}</span>
                  <span style={s.catAmt}>{formatKRW(cat.amount)}</span>
                  <span style={s.catPct}>{totalPct}%</span>
                </div>
                <div style={s.barBg}>
                  <div style={s.barFill(pct, cat.color)} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Daily spend chart */}
      <div style={s.section}>
        <div style={s.sectionTitle}>일별 지출</div>
        <div style={s.dailyChart}>
          <div style={s.barsRow}>
            {dailySpend.map((amt, i) => (
              <div
                key={i}
                style={s.bar(amt > 0 ? Math.max((amt / maxDaily) * 100, 8) : 0, i === todayIdx)}
                title={`${i + 1}일: ${formatKRW(amt)}`}
              />
            ))}
          </div>
          <div style={s.dayLabels}>
            {Array.from({ length: days }, (_, i) => (
              <span key={i} style={s.dayLabel(i === todayIdx)}>
                {(i + 1) % 5 === 1 || i === todayIdx ? i + 1 : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
