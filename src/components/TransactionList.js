import React, { useState, useMemo } from 'react';
import { formatKRW, formatDate, getMonthTransactions } from '../utils/helpers';
import { getCategoryById, CATEGORIES } from '../utils/categories';

const s = {
  wrap: { padding: '12px 16px 20px' },
  filterRow: { display: 'flex', gap: 8, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 },
  filterBtn: (active) => ({
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: active ? 700 : 400,
    background: active ? '#8B5CF6' : '#1E1E1E',
    color: active ? 'white' : '#9CA3AF',
    border: `1px solid ${active ? '#8B5CF6' : '#2D2D2D'}`,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    cursor: 'pointer',
    transition: 'all 0.15s',
  }),
  searchBox: {
    width: '100%',
    background: '#1E1E1E',
    border: '1px solid #2D2D2D',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#F9FAFB',
    fontSize: 14,
    marginBottom: 12,
  },
  dateGroup: { marginBottom: 4 },
  dateLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#6B7280',
    padding: '10px 0 6px',
    letterSpacing: '0.5px',
  },
  txRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 12,
    marginBottom: 4,
    background: '#1A1A1A',
    cursor: 'pointer',
    transition: 'background 0.1s',
  },
  icon: (color) => ({
    width: 38,
    height: 38,
    borderRadius: 10,
    background: color + '22',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 17,
    flexShrink: 0,
  }),
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 14, fontWeight: 500, color: '#F9FAFB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  catName: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  amount: (type) => ({ fontSize: 15, fontWeight: 700, color: type === 'income' ? '#10B981' : '#F87171', flexShrink: 0 }),
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: 'rgba(239,68,68,0.1)',
    color: '#EF4444',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    cursor: 'pointer',
  },
  emptyWrap: { textAlign: 'center', padding: '60px 20px', color: '#6B7280' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
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
};

export default function TransactionList({ transactions, year, month, onEdit, onDelete, onAddClick }) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');

  const monthTxs = getMonthTransactions(transactions, year, month);

  const filtered = useMemo(() => {
    return monthTxs
      .filter((t) => typeFilter === 'all' || t.type === typeFilter)
      .filter((t) => catFilter === 'all' || t.category === catFilter)
      .filter((t) => {
        if (!search) return true;
        const cat = getCategoryById(t.category);
        return (
          t.description.toLowerCase().includes(search.toLowerCase()) ||
          cat.name.includes(search)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  }, [monthTxs, typeFilter, catFilter, search]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((t) => {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const usedCats = useMemo(() => {
    const ids = new Set(monthTxs.map((t) => t.category));
    return CATEGORIES.filter((c) => ids.has(c.id));
  }, [monthTxs]);

  return (
    <div style={s.wrap}>
      <div style={s.filterRow}>
        {['all', 'income', 'expense'].map((f) => (
          <button key={f} style={s.filterBtn(typeFilter === f)} onClick={() => setTypeFilter(f)}>
            {f === 'all' ? '전체' : f === 'income' ? '💚 수입' : '❤️ 지출'}
          </button>
        ))}
        {usedCats.map((c) => (
          <button key={c.id} style={s.filterBtn(catFilter === c.id)} onClick={() => setCatFilter(catFilter === c.id ? 'all' : c.id)}>
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      <input
        style={s.searchBox}
        placeholder="🔍 검색..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {grouped.length === 0 ? (
        <div style={s.emptyWrap}>
          <div style={s.emptyIcon}>📭</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>내역이 없습니다</div>
          <div style={{ fontSize: 13 }}>+ 버튼으로 첫 내역을 추가해보세요!</div>
        </div>
      ) : (
        grouped.map(([date, txs]) => (
          <div key={date} style={s.dateGroup}>
            <div style={s.dateLabel}>{formatDate(date)}</div>
            {txs.map((tx) => {
              const cat = getCategoryById(tx.category);
              return (
                <div key={tx.id} style={s.txRow}>
                  <div style={s.icon(cat.color)} onClick={() => onEdit(tx.id)}>{cat.icon}</div>
                  <div style={s.info} onClick={() => onEdit(tx.id)}>
                    <div style={s.name}>{tx.description || cat.name}</div>
                    <div style={s.catName}>{cat.name}{tx.recurringId ? ' · 🔄' : ''}</div>
                  </div>
                  <div style={s.amount(tx.type)} onClick={() => onEdit(tx.id)}>
                    {tx.type === 'income' ? '+' : '-'}{formatKRW(tx.amount)}
                  </div>
                  <button style={s.deleteBtn} onClick={() => onDelete(tx.id)}>✕</button>
                </div>
              );
            })}
          </div>
        ))
      )}
      <button style={s.fab} onClick={onAddClick} aria-label="내역 추가">＋</button>
    </div>
  );
}
