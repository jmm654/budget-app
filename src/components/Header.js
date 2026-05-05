import React from 'react';
import { formatMonthLabel } from '../utils/helpers';

const s = {
  header: {
    position: 'fixed',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 430,
    height: 56,
    background: 'rgba(10,10,10,0.92)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid #2D2D2D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    zIndex: 100,
  },
  title: { fontSize: 17, fontWeight: 700, color: '#F9FAFB' },
  monthNav: { display: 'flex', alignItems: 'center', gap: 8 },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: '#1E1E1E',
    border: '1px solid #2D2D2D',
    color: '#9CA3AF',
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  monthLabel: { fontSize: 15, fontWeight: 600, color: '#F9FAFB', minWidth: 90, textAlign: 'center' },
  todayBtn: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: 600,
    padding: '4px 8px',
    borderRadius: 6,
    background: 'rgba(139,92,246,0.1)',
  },
};

export default function Header({ year, month, onPrev, onNext, onToday, isCurrentMonth }) {
  return (
    <header style={s.header}>
      <span style={s.title}>💰 가계부</span>
      <div style={s.monthNav}>
        <button style={s.navBtn} onClick={onPrev}>‹</button>
        <span style={s.monthLabel}>{formatMonthLabel(year, month)}</span>
        <button style={s.navBtn} onClick={onNext}>›</button>
      </div>
      {!isCurrentMonth && (
        <button style={s.todayBtn} onClick={onToday}>오늘</button>
      )}
      {isCurrentMonth && <div style={{ width: 40 }} />}
    </header>
  );
}
