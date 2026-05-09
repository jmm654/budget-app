import React, { useState, useEffect } from 'react';
import { formatKRW, generateId } from '../utils/helpers';

export const ASSET_CATEGORIES = [
  { id: 'cash',       name: '현금',     icon: '💵', color: '#10B981' },
  { id: 'bank',       name: '은행계좌', icon: '🏦', color: '#60A5FA' },
  { id: 'stock',      name: '주식/펀드',icon: '📈', color: '#FBBF24' },
  { id: 'realestate', name: '부동산',   icon: '🏠', color: '#F87171' },
  { id: 'car',        name: '자동차',   icon: '🚗', color: '#A78BFA' },
  { id: 'other',      name: '기타',     icon: '📦', color: '#94A3B8' },
];

/* ─── AssetForm ─── */
const f = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' },
  sheet: { width:'100%', maxWidth:430, background:'#141414', borderRadius:'20px 20px 0 0', maxHeight:'90vh', display:'flex', flexDirection:'column' },
  sheetHeader: { padding:'0 16px', flexShrink:0 },
  scrollContent: { flex:1, overflowY:'scroll', WebkitOverflowScrolling:'touch', overscrollBehavior:'contain', padding:'0 16px 8px' },
  sheetFooter: { flexShrink:0, padding:'12px 16px calc(16px + env(safe-area-inset-bottom,0px))' },
  handle: { width:40, height:4, borderRadius:2, background:'#3D3D3D', margin:'12px auto 16px' },
  title: { fontSize:18, fontWeight:700, color:'#F9FAFB', marginBottom:20, textAlign:'center' },
  label: { fontSize:13, fontWeight:600, color:'#9CA3AF', marginBottom:8, letterSpacing:'0.3px' },
  input: { width:'100%', background:'#1E1E1E', border:'1px solid #2D2D2D', borderRadius:10, padding:'12px 14px', color:'#F9FAFB', fontSize:15, marginBottom:16 },
  amountInput: { width:'100%', background:'#1E1E1E', border:'1px solid #8B5CF6', borderRadius:10, padding:'12px 14px', color:'#A78BFA', fontSize:22, fontWeight:700, marginBottom:16, letterSpacing:'-0.5px' },
  select: { width:'100%', background:'#1E1E1E', border:'1px solid #2D2D2D', borderRadius:10, padding:'12px 14px', color:'#F9FAFB', fontSize:15, marginBottom:16, appearance:'none', WebkitAppearance:'none' },
  btnRow: { display:'flex', gap:10 },
  cancelBtn: { flex:1, padding:'14px', borderRadius:12, background:'#1E1E1E', border:'1px solid #3D3D3D', color:'#9CA3AF', fontSize:15, fontWeight:600, cursor:'pointer' },
  saveBtn: (ok) => ({ flex:2, padding:'14px', borderRadius:12, background:'linear-gradient(135deg,#7C3AED,#8B5CF6)', color:'white', fontSize:15, fontWeight:700, border:'none', cursor:'pointer', opacity: ok ? 1 : 0.5 }),
};

export function AssetForm({ editingAsset, onSave, onClose }) {
  const [name, setName] = useState(editingAsset?.name || '');
  const [category, setCategory] = useState(editingAsset?.category || 'bank');
  const [amount, setAmount] = useState(editingAsset ? String(editingAsset.amount) : '');
  const [description, setDescription] = useState(editingAsset?.description || '');

  useEffect(() => {
    const screens = document.querySelectorAll('.screen');
    screens.forEach((el) => { el.style.overflowY = 'hidden'; });
    return () => { screens.forEach((el) => { el.style.overflowY = ''; }); };
  }, []);

  const canSave = name.trim().length > 0 && parseInt(amount, 10) > 0;
  const displayAmount = amount ? parseInt(amount, 10).toLocaleString('ko-KR') : '';

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: editingAsset?.id || generateId(),
      name: name.trim(),
      category,
      amount: parseInt(amount, 10),
      description: description.trim(),
      createdAt: editingAsset?.createdAt || Date.now(),
    });
  };

  return (
    <div style={f.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={f.sheet}>
        <div style={f.sheetHeader}>
          <div style={f.handle} />
          <div style={f.title}>{editingAsset ? '자산 수정' : '자산 추가'}</div>
        </div>

        <div style={f.scrollContent}>
          <div style={f.label}>자산 이름</div>
          <input
            style={f.input}
            type="text"
            placeholder="예: 국민은행 통장"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            autoFocus
          />

          <div style={f.label}>카테고리</div>
          <select style={f.select} value={category} onChange={(e) => setCategory(e.target.value)}>
            {ASSET_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>

          <div style={f.label}>금액 (원)</div>
          <input
            style={f.amountInput}
            type="tel"
            inputMode="numeric"
            placeholder="0"
            value={displayAmount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
          />

          <div style={f.label}>메모 (선택)</div>
          <input
            style={f.input}
            type="text"
            placeholder="메모를 입력하세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={50}
          />
        </div>

        <div style={f.sheetFooter}>
          <div style={f.btnRow}>
            <button style={f.cancelBtn} onClick={onClose}>취소</button>
            <button style={f.saveBtn(canSave)} onClick={handleSave} disabled={!canSave}>
              {editingAsset ? '수정 완료' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── AssetScreen ─── */
const s = {
  wrap: { padding:'16px 16px 80px' },
  totalCard: {
    background:'linear-gradient(135deg,#1a0533 0%,#1E1E2E 100%)',
    borderRadius:16,
    padding:'20px',
    marginBottom:20,
    border:'1px solid #3D2D5D',
    textAlign:'center',
  },
  totalLabel: { fontSize:13, color:'#9CA3AF', marginBottom:8 },
  totalAmount: { fontSize:32, fontWeight:800, color:'#A78BFA' },
  sectionGroup: { marginBottom:20 },
  sectionHeader: {
    fontSize:13, fontWeight:700, color:'#9CA3AF', marginBottom:8,
    letterSpacing:'0.5px', display:'flex', alignItems:'center', gap:6,
  },
  sectionSubtotal: { fontSize:13, color:'#6B7280', fontWeight:400 },
  card: (selected) => ({
    background: selected ? 'rgba(139,92,246,0.12)' : '#1A1A1A',
    border: `1px solid ${selected ? '#8B5CF6' : '#2D2D2D'}`,
    borderRadius:14,
    padding:'14px',
    marginBottom:8,
    cursor:'pointer',
    transition:'border-color 0.15s, background 0.15s',
  }),
  cardRow: { display:'flex', alignItems:'center', gap:10 },
  catIcon: (color) => ({
    width:40, height:40, borderRadius:10, background:color+'22',
    display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0,
  }),
  info: { flex:1, minWidth:0 },
  name: { fontSize:14, fontWeight:600, color:'#F9FAFB', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  desc: { fontSize:12, color:'#6B7280', marginTop:2 },
  amount: { fontSize:16, fontWeight:700, color:'#A78BFA', flexShrink:0 },
  actions: { display:'flex', gap:8, marginTop:10 },
  editBtn: { flex:1, padding:'8px', borderRadius:8, background:'rgba(139,92,246,0.15)', color:'#A78BFA', fontSize:13, fontWeight:600, border:'1px solid rgba(139,92,246,0.3)', cursor:'pointer' },
  deleteBtn: { padding:'8px 14px', borderRadius:8, background:'rgba(239,68,68,0.1)', color:'#EF4444', fontSize:13, fontWeight:600, border:'1px solid rgba(239,68,68,0.3)', cursor:'pointer' },
  emptyWrap: { textAlign:'center', color:'#6B7280', padding:'60px 0', fontSize:14 },
  emptyIcon: { fontSize:44, marginBottom:12 },
  fab: {
    position:'fixed',
    bottom:'calc(80px + env(safe-area-inset-bottom,0px))',
    right:'calc(50% - 207px)',
    width:56, height:56, borderRadius:28,
    background:'linear-gradient(135deg,#7C3AED,#8B5CF6)',
    color:'white', fontSize:26,
    display:'flex', alignItems:'center', justifyContent:'center',
    boxShadow:'0 4px 20px rgba(139,92,246,0.5)',
    cursor:'pointer', zIndex:90, border:'none',
  },
};

export default function AssetScreen({ assets, onEdit, onDelete, onAddClick }) {
  const [selectedId, setSelectedId] = useState(null);

  const totalAmount = assets.reduce((sum, a) => sum + a.amount, 0);

  const grouped = ASSET_CATEGORIES
    .map((cat) => ({ ...cat, items: assets.filter((a) => a.category === cat.id) }))
    .filter((g) => g.items.length > 0);

  const handleCardClick = (id) => setSelectedId((prev) => (prev === id ? null : id));

  return (
    <div style={s.wrap}>
      <div style={s.totalCard}>
        <div style={s.totalLabel}>전체 자산</div>
        <div style={s.totalAmount}>{formatKRW(totalAmount)}</div>
      </div>

      {assets.length === 0 ? (
        <div style={s.emptyWrap}>
          <div style={s.emptyIcon}>🏛️</div>
          <div>등록된 자산이 없습니다.<br />+ 버튼으로 자산을 추가해보세요!</div>
        </div>
      ) : (
        grouped.map((group) => (
          <div key={group.id} style={s.sectionGroup}>
            <div style={s.sectionHeader}>
              <span>{group.icon}</span>
              <span>{group.name}</span>
              <span style={s.sectionSubtotal}>
                ({formatKRW(group.items.reduce((sum, a) => sum + a.amount, 0))})
              </span>
            </div>
            {group.items.map((asset) => {
              const selected = selectedId === asset.id;
              return (
                <div key={asset.id} style={s.card(selected)} onClick={() => handleCardClick(asset.id)}>
                  <div style={s.cardRow}>
                    <div style={s.catIcon(group.color)}>{group.icon}</div>
                    <div style={s.info}>
                      <div style={s.name}>{asset.name}</div>
                      {asset.description && <div style={s.desc}>{asset.description}</div>}
                    </div>
                    <div style={s.amount}>{formatKRW(asset.amount)}</div>
                  </div>
                  {selected && (
                    <div style={s.actions}>
                      <button style={s.editBtn} onClick={(e) => { e.stopPropagation(); onEdit(asset); }}>수정</button>
                      <button style={s.deleteBtn} onClick={(e) => { e.stopPropagation(); onDelete(asset.id); }}>삭제</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}

      <button style={s.fab} onClick={onAddClick} aria-label="자산 추가">＋</button>
    </div>
  );
}
