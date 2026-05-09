import React, { useState } from 'react';
import { hashPin } from '../utils/crypto';

const PAD = ['1','2','3','4','5','6','7','8','9',null,'0','del'];

const s = {
  screen: {
    position: 'fixed', inset: 0, background: '#0A0A0A',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 500, userSelect: 'none',
  },
  appTitle: { fontSize: 24, fontWeight: 800, color: '#F9FAFB', marginBottom: 6 },
  prompt: { fontSize: 14, color: '#6B7280', marginBottom: 40 },
  dotsRow: { display: 'flex', gap: 16, marginBottom: 12 },
  dot: (filled) => ({
    width: 14, height: 14, borderRadius: '50%',
    background: filled ? '#8B5CF6' : 'transparent',
    border: `2px solid ${filled ? '#8B5CF6' : '#3D3D3D'}`,
    transition: 'background 0.15s, border-color 0.15s',
  }),
  errorMsg: { fontSize: 13, color: '#EF4444', height: 20, marginBottom: 28 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 72px)', gap: 12 },
  numBtn: {
    width: 72, height: 72, borderRadius: '50%',
    background: '#1E1E1E', border: '1px solid #2D2D2D',
    color: '#F9FAFB', fontSize: 24, fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
  },
  delBtn: {
    width: 72, height: 72, borderRadius: '50%',
    background: 'transparent', border: 'none',
    color: '#9CA3AF', fontSize: 22,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
  },
  emptyCell: { width: 72, height: 72 },
};

export default function LockScreen({ pinHash, onUnlock }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const press = async (val) => {
    if (val === 'del') { setInput((p) => p.slice(0, -1)); setError(''); return; }
    if (input.length >= 4) return;
    const next = input + val;
    setInput(next);
    if (next.length === 4) {
      const hash = await hashPin(next);
      if (hash === pinHash) {
        onUnlock();
      } else {
        setError('비밀번호가 틀렸습니다');
        setTimeout(() => { setInput(''); setError(''); }, 700);
      }
    }
  };

  return (
    <div style={s.screen}>
      <div style={s.appTitle}>💰 가계부</div>
      <div style={s.prompt}>비밀번호를 입력하세요</div>
      <div style={s.dotsRow}>
        {[0,1,2,3].map((i) => <div key={i} style={s.dot(i < input.length)} />)}
      </div>
      <div style={s.errorMsg}>{error}</div>
      <div style={s.grid}>
        {PAD.map((btn, i) => {
          if (btn === null) return <div key={i} style={s.emptyCell} />;
          if (btn === 'del') return <button key={i} style={s.delBtn} onClick={() => press('del')}>⌫</button>;
          return <button key={i} style={s.numBtn} onClick={() => press(btn)}>{btn}</button>;
        })}
      </div>
    </div>
  );
}
