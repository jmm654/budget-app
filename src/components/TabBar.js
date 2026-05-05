import React from 'react';

const TABS = [
  { id: 0, label: '홈', icon: '🏠' },
  { id: 1, label: '내역', icon: '📋' },
  { id: 2, label: '예산', icon: '🎯' },
  { id: 3, label: '분석', icon: '📊' },
  { id: 4, label: '설정', icon: '⚙️' },
];

const s = {
  bar: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 430,
    height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
    background: 'rgba(10,10,10,0.95)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderTop: '1px solid #2D2D2D',
    display: 'flex',
    alignItems: 'flex-start',
    paddingTop: 4,
    zIndex: 100,
  },
  tab: (active) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '6px 0',
    cursor: 'pointer',
    opacity: active ? 1 : 0.45,
    transition: 'opacity 0.15s',
  }),
  icon: { fontSize: 22 },
  label: (active) => ({
    fontSize: 11,
    fontWeight: active ? 700 : 400,
    color: active ? '#8B5CF6' : '#9CA3AF',
  }),
};

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <nav style={s.bar}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          style={s.tab(activeTab === tab.id)}
          onClick={() => onTabChange(tab.id)}
        >
          <span style={s.icon}>{tab.icon}</span>
          <span style={s.label(activeTab === tab.id)}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
