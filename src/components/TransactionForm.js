import React, { useState, useEffect } from 'react';
import { getTodayStr, generateId } from '../utils/helpers';

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  sheet: {
    width: '100%',
    maxWidth: 430,
    background: '#141414',
    borderRadius: '20px 20px 0 0',
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column',
  },
  sheetHeader: { padding: '0 16px', flexShrink: 0 },
  scrollContent: {
    flex: 1,
    overflowY: 'scroll',
    WebkitOverflowScrolling: 'touch',
    overscrollBehavior: 'contain',
    padding: '0 16px 8px',
  },
  sheetFooter: {
    flexShrink: 0,
    padding: '12px 16px calc(16px + env(safe-area-inset-bottom, 0px))',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    background: '#3D3D3D',
    margin: '12px auto 16px',
  },
  sheetTitle: { fontSize: 18, fontWeight: 700, color: '#F9FAFB', marginBottom: 20, textAlign: 'center' },
  typeRow: { display: 'flex', gap: 8, marginBottom: 20 },
  typeBtn: (active, color) => ({
    flex: 1,
    padding: '12px',
    borderRadius: 12,
    border: `2px solid ${active ? color : '#2D2D2D'}`,
    background: active ? color + '22' : 'transparent',
    color: active ? color : '#9CA3AF',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s',
  }),
  label: { fontSize: 13, fontWeight: 600, color: '#9CA3AF', marginBottom: 8, letterSpacing: '0.3px' },
  input: {
    width: '100%',
    background: '#1E1E1E',
    border: '1px solid #2D2D2D',
    borderRadius: 10,
    padding: '12px 14px',
    color: '#F9FAFB',
    fontSize: 16,
    marginBottom: 16,
  },
  amountInput: {
    width: '100%',
    background: '#1E1E1E',
    border: '1px solid #8B5CF6',
    borderRadius: 10,
    padding: '12px 14px',
    color: '#A78BFA',
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 16,
    letterSpacing: '-0.5px',
  },
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 },
  catBtn: (active, color) => ({
    padding: '10px 4px',
    borderRadius: 10,
    border: `2px solid ${active ? color : '#2D2D2D'}`,
    background: active ? color + '22' : '#1E1E1E',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    cursor: 'pointer',
    transition: 'all 0.15s',
  }),
  catIcon: { fontSize: 20 },
  catLabel: (active, color) => ({ fontSize: 11, color: active ? color : '#9CA3AF', fontWeight: active ? 700 : 400, textAlign: 'center' }),
  btnRow: { display: 'flex', gap: 10 },
  cancelBtn: {
    flex: 1,
    padding: '14px',
    borderRadius: 12,
    background: '#1E1E1E',
    border: '1px solid #3D3D3D',
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  saveBtn: {
    flex: 2,
    padding: '14px',
    borderRadius: 12,
    background: 'linear-gradient(135deg,#7C3AED,#8B5CF6)',
    color: 'white',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    border: 'none',
  },
};

export default function TransactionForm({ editingId, transactions, categories, onSave, onClose }) {
  const today = getTodayStr();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(today);

  useEffect(() => {
    const screens = document.querySelectorAll('.screen');
    screens.forEach((el) => { el.style.overflowY = 'hidden'; });
    return () => { screens.forEach((el) => { el.style.overflowY = ''; }); };
  }, []);

  useEffect(() => {
    if (editingId) {
      const tx = transactions.find((t) => t.id === editingId);
      if (tx) {
        setType(tx.type);
        setAmount(String(tx.amount));
        setCategory(tx.category);
        setDescription(tx.description);
        setDate(tx.date);
      }
    }
  }, [editingId, transactions]);

  useEffect(() => {
    const defaultCat = type === 'income' ? 'salary' : 'food';
    setCategory(defaultCat);
  }, [type]);

  const filteredCats = categories.filter((c) => c.type === type);

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setAmount(raw);
  };

  const handleSave = () => {
    const parsed = parseInt(amount, 10);
    if (!parsed || parsed <= 0) return;
    if (!category) return;

    const tx = {
      id: editingId || generateId(),
      type,
      amount: parsed,
      category,
      description: description.trim(),
      date,
      recurringId: editingId ? (transactions.find((t) => t.id === editingId)?.recurringId || null) : null,
      createdAt: editingId ? (transactions.find((t) => t.id === editingId)?.createdAt || Date.now()) : Date.now(),
    };
    onSave(tx);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const displayAmount = amount
    ? parseInt(amount, 10).toLocaleString('ko-KR')
    : '';

  return (
    <div style={s.overlay} onClick={handleOverlayClick}>
      <div style={s.sheet}>
        <div style={s.sheetHeader}>
          <div style={s.handle} />
          <div style={s.sheetTitle}>{editingId ? '내역 수정' : '내역 추가'}</div>
        </div>

        <div style={s.scrollContent}>
          <div style={s.typeRow}>
            <button style={s.typeBtn(type === 'income', '#10B981')} onClick={() => setType('income')}>
              💚 수입
            </button>
            <button style={s.typeBtn(type === 'expense', '#F87171')} onClick={() => setType('expense')}>
              ❤️ 지출
            </button>
          </div>

          <div style={s.label}>금액 (원)</div>
          <input
            style={s.amountInput}
            type="tel"
            inputMode="numeric"
            placeholder="0"
            value={displayAmount}
            onChange={handleAmountChange}
            autoFocus
          />

          <div style={s.label}>카테고리</div>
          <div style={s.catGrid}>
            {filteredCats.map((c) => (
              <button key={c.id} style={s.catBtn(category === c.id, c.color)} onClick={() => setCategory(c.id)}>
                <span style={s.catIcon}>{c.icon}</span>
                <span style={s.catLabel(category === c.id, c.color)}>{c.name}</span>
              </button>
            ))}
          </div>

          <div style={s.label}>메모 (선택)</div>
          <input
            style={s.input}
            type="text"
            placeholder="내역 메모를 입력하세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={50}
          />

          <div style={s.label}>날짜</div>
          <input
            style={s.input}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={today}
          />
        </div>

        <div style={s.sheetFooter}>
          <div style={s.btnRow}>
            <button style={s.cancelBtn} onClick={onClose}>취소</button>
            <button
              style={{ ...s.saveBtn, opacity: !amount || parseInt(amount) <= 0 ? 0.5 : 1 }}
              onClick={handleSave}
              disabled={!amount || parseInt(amount) <= 0}
            >
              {editingId ? '수정 완료' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
