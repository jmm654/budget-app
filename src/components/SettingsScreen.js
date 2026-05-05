import React, { useState } from 'react';
import { formatKRW, generateId, getTodayStr, getWeekDayName } from '../utils/helpers';
import { CATEGORIES, getCategoryById } from '../utils/categories';

const FREQ_LABELS = { daily: '매일', weekly: '매주', monthly: '매월' };

const s = {
  wrap: { padding: '16px 16px 80px' },
  addBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: 14,
    background: 'linear-gradient(135deg,#7C3AED,#8B5CF6)',
    color: 'white',
    fontSize: 15,
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: '#9CA3AF', marginBottom: 10, letterSpacing: '0.5px' },
  card: {
    background: '#1A1A1A',
    borderRadius: 14,
    padding: '14px',
    marginBottom: 10,
    border: '1px solid #2D2D2D',
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: 10 },
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
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 14, fontWeight: 600, color: '#F9FAFB' },
  meta: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  amount: (type) => ({ fontSize: 15, fontWeight: 700, color: type === 'income' ? '#10B981' : '#F87171', flexShrink: 0 }),
  actions: { display: 'flex', gap: 8, marginTop: 10 },
  toggleBtn: (active) => ({
    flex: 1,
    padding: '8px',
    borderRadius: 8,
    background: active ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)',
    color: active ? '#10B981' : '#6B7280',
    fontSize: 12,
    fontWeight: 600,
    border: `1px solid ${active ? '#10B981' : '#3D3D3D'}`,
    cursor: 'pointer',
  }),
  deleteBtn: {
    padding: '8px 12px',
    borderRadius: 8,
    background: 'rgba(239,68,68,0.1)',
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 600,
    border: '1px solid rgba(239,68,68,0.3)',
    cursor: 'pointer',
  },
  emptyWrap: { textAlign: 'center', color: '#6B7280', padding: '30px 0', fontSize: 13 },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
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
    padding: '0 16px calc(20px + env(safe-area-inset-bottom, 0px))',
    maxHeight: '88vh',
    overflowY: 'auto',
  },
  handle: { width: 40, height: 4, borderRadius: 2, background: '#3D3D3D', margin: '12px auto 16px' },
  sheetTitle: { fontSize: 17, fontWeight: 700, color: '#F9FAFB', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: 600, color: '#9CA3AF', marginBottom: 8 },
  input: {
    width: '100%',
    background: '#1E1E1E',
    border: '1px solid #2D2D2D',
    borderRadius: 10,
    padding: '12px 14px',
    color: '#F9FAFB',
    fontSize: 15,
    marginBottom: 14,
  },
  select: {
    width: '100%',
    background: '#1E1E1E',
    border: '1px solid #2D2D2D',
    borderRadius: 10,
    padding: '12px 14px',
    color: '#F9FAFB',
    fontSize: 15,
    marginBottom: 14,
    appearance: 'none',
  },
  typeRow: { display: 'flex', gap: 8, marginBottom: 14 },
  typeBtn: (active, color) => ({
    flex: 1, padding: '10px', borderRadius: 10,
    border: `2px solid ${active ? color : '#2D2D2D'}`,
    background: active ? color + '22' : 'transparent',
    color: active ? color : '#9CA3AF',
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
  }),
  btnRow: { display: 'flex', gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, padding: '13px', borderRadius: 12, background: '#1E1E1E', border: '1px solid #3D3D3D', color: '#9CA3AF', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  saveBtn: { flex: 2, padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg,#7C3AED,#8B5CF6)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none' },
};

function AddForm({ onSave, onClose }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);

  const cats = CATEGORIES.filter((c) => c.type === type);

  const handleSave = () => {
    const parsed = parseInt(amount, 10);
    if (!parsed || parsed <= 0 || !category) return;
    onSave({
      id: generateId(),
      type, amount: parsed, category,
      description: description.trim() || getCategoryById(category).name,
      frequency,
      dayOfWeek: frequency === 'weekly' ? dayOfWeek : null,
      dayOfMonth: frequency === 'monthly' ? dayOfMonth : null,
      startDate: getTodayStr(),
      isActive: true,
    });
  };

  return (
    <div style={s.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={s.sheet}>
        <div style={s.handle} />
        <div style={s.sheetTitle}>반복 내역 추가</div>

        <div style={s.label}>수입/지출</div>
        <div style={s.typeRow}>
          <button style={s.typeBtn(type === 'income', '#10B981')} onClick={() => { setType('income'); setCategory('salary'); }}>💚 수입</button>
          <button style={s.typeBtn(type === 'expense', '#F87171')} onClick={() => { setType('expense'); setCategory('food'); }}>❤️ 지출</button>
        </div>

        <div style={s.label}>금액 (원)</div>
        <input style={s.input} type="tel" inputMode="numeric" placeholder="0" value={amount ? parseInt(amount).toLocaleString() : ''} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} />

        <div style={s.label}>카테고리</div>
        <select style={s.select} value={category} onChange={(e) => setCategory(e.target.value)}>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>

        <div style={s.label}>메모</div>
        <input style={s.input} type="text" placeholder="메모 (선택)" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={50} />

        <div style={s.label}>반복 주기</div>
        <select style={s.select} value={frequency} onChange={(e) => setFrequency(e.target.value)}>
          <option value="daily">매일</option>
          <option value="weekly">매주</option>
          <option value="monthly">매월</option>
        </select>

        {frequency === 'weekly' && (
          <>
            <div style={s.label}>요일</div>
            <select style={s.select} value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))}>
              {[0,1,2,3,4,5,6].map((d) => <option key={d} value={d}>{getWeekDayName(d)}요일</option>)}
            </select>
          </>
        )}

        {frequency === 'monthly' && (
          <>
            <div style={s.label}>날짜</div>
            <select style={s.select} value={dayOfMonth} onChange={(e) => setDayOfMonth(Number(e.target.value))}>
              {Array.from({ length: 28 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}일</option>)}
            </select>
          </>
        )}

        <div style={s.btnRow}>
          <button style={s.cancelBtn} onClick={onClose}>취소</button>
          <button style={{ ...s.saveBtn, opacity: !amount ? 0.5 : 1 }} onClick={handleSave} disabled={!amount}>저장</button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsScreen({ recurring, onAddRecurring, onToggleRecurring, onDeleteRecurring }) {
  const [showForm, setShowForm] = useState(false);

  const freqDetail = (r) => {
    if (r.frequency === 'daily') return '매일';
    if (r.frequency === 'weekly') return `매주 ${getWeekDayName(r.dayOfWeek)}요일`;
    return `매월 ${r.dayOfMonth}일`;
  };

  return (
    <div style={s.wrap}>
      <button style={s.addBtn} onClick={() => setShowForm(true)}>＋ 반복 내역 추가</button>

      <div style={s.sectionTitle}>반복 내역 목록 ({recurring.length})</div>

      {recurring.length === 0 ? (
        <div style={s.emptyWrap}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔄</div>
          <div>반복 내역이 없습니다.<br />매월 고정 지출을 등록해보세요!</div>
        </div>
      ) : (
        recurring.map((r) => {
          const cat = getCategoryById(r.category);
          return (
            <div key={r.id} style={{ ...s.card, opacity: r.isActive ? 1 : 0.5 }}>
              <div style={s.cardTop}>
                <div style={s.catIcon(cat.color)}>{cat.icon}</div>
                <div style={s.info}>
                  <div style={s.name}>{r.description}</div>
                  <div style={s.meta}>{freqDetail(r)} · {cat.name}</div>
                </div>
                <div style={s.amount(r.type)}>
                  {r.type === 'income' ? '+' : '-'}{formatKRW(r.amount)}
                </div>
              </div>
              <div style={s.actions}>
                <button style={s.toggleBtn(r.isActive)} onClick={() => onToggleRecurring(r.id)}>
                  {r.isActive ? '✓ 활성' : '✕ 비활성'}
                </button>
                <button style={s.deleteBtn} onClick={() => onDeleteRecurring(r.id)}>삭제</button>
              </div>
            </div>
          );
        })
      )}

      {showForm && (
        <AddForm
          onSave={(r) => { onAddRecurring(r); setShowForm(false); }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
