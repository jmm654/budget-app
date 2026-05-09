import React, { useState } from 'react';
import { hashPin } from '../utils/crypto';

const PAD = ['1','2','3','4','5','6','7','8','9',null,'0','del'];

const MODE_TITLE = { set: '비밀번호 설정', change: '비밀번호 변경', remove: '비밀번호 해제' };

const STEP_CONFIG = {
  verify: { title: '현재 비밀번호',  sub: '현재 비밀번호를 입력하세요' },
  new:    { title: '새 비밀번호',    sub: '새 비밀번호 4자리를 입력하세요' },
  confirm:{ title: '비밀번호 확인',  sub: '비밀번호를 다시 입력하세요' },
};

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: '#0A0A0A',
    zIndex: 200, display: 'flex', flexDirection: 'column',
    alignItems: 'center', userSelect: 'none',
  },
  header: {
    width: '100%', maxWidth: 430, flexShrink: 0,
    display: 'flex', alignItems: 'center',
    padding: 'calc(env(safe-area-inset-top,0px) + 12px) 16px 12px',
    borderBottom: '1px solid #2D2D2D',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    background: '#1E1E1E', border: '1px solid #2D2D2D',
    color: '#F9FAFB', fontSize: 18, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: 700, color: '#F9FAFB', textAlign: 'center' },
  body: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: '0 16px 80px',
  },
  stepTitle: { fontSize: 18, fontWeight: 700, color: '#F9FAFB', marginBottom: 6 },
  stepSub: { fontSize: 14, color: '#6B7280', marginBottom: 40 },
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

export default function PinFlow({ mode, currentHash, onComplete, onClose }) {
  const [step, setStep] = useState(mode === 'set' ? 'new' : 'verify');
  const [input, setInput] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState('');

  const press = async (val) => {
    if (val === 'del') { setInput((p) => p.slice(0, -1)); setError(''); return; }
    if (input.length >= 4) return;
    const next = input + val;
    setInput(next);
    if (next.length < 4) return;

    if (step === 'verify') {
      const hash = await hashPin(next);
      if (hash !== currentHash) {
        setError('비밀번호가 틀렸습니다');
        setTimeout(() => { setInput(''); setError(''); }, 700);
        return;
      }
      if (mode === 'remove') { onComplete(null); return; }
      setStep('new'); setInput('');
    } else if (step === 'new') {
      setFirstPin(next); setStep('confirm'); setInput('');
    } else {
      if (next !== firstPin) {
        setError('비밀번호가 일치하지 않습니다');
        setTimeout(() => { setInput(''); setStep('new'); setFirstPin(''); setError(''); }, 800);
        return;
      }
      const hash = await hashPin(next);
      onComplete(hash);
    }
  };

  const { title, sub } = STEP_CONFIG[step];

  return (
    <div style={s.overlay}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onClose}>‹</button>
        <div style={s.headerTitle}>{MODE_TITLE[mode]}</div>
        <div style={{ width: 36 }} />
      </div>
      <div style={s.body}>
        <div style={s.stepTitle}>{title}</div>
        <div style={s.stepSub}>{sub}</div>
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
    </div>
  );
}
