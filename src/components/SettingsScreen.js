import React, { useState } from 'react';
import { formatKRW, generateId, getTodayStr, getWeekDayName } from '../utils/helpers';
import { CATEGORIES } from '../utils/categories';

const PRESET_COLORS = [
  '#F87171','#FB923C','#FBBF24','#A3E635',
  '#34D399','#22D3EE','#60A5FA','#818CF8',
  '#C084FC','#F472B6','#94A3B8','#A78BFA',
];

const PRESET_ICONS = ['🍕','🍺','🎮','🐶','🐱','✈️','🚗','⛽','💊','💇','🎁','🏋️','📷','🎵','🌿','🛒','🧴','🍷','☕','🏠','📚','💻','👗','🎬'];

/* ─── 카테고리 추가 폼 ─── */
const catFormS = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:300, display:'flex', alignItems:'flex-end', justifyContent:'center' },
  sheet: { width:'100%', maxWidth:430, background:'#141414', borderRadius:'20px 20px 0 0', maxHeight:'90vh', display:'flex', flexDirection:'column' },
  sheetHeader: { padding:'0 16px', flexShrink:0 },
  scrollContent: { flex:1, overflowY:'scroll', WebkitOverflowScrolling:'touch', overscrollBehavior:'contain', padding:'0 16px 8px' },
  sheetFooter: { flexShrink:0, padding:'12px 16px calc(24px + env(safe-area-inset-bottom,0px))' },
  handle: { width:40, height:4, borderRadius:2, background:'#3D3D3D', margin:'12px auto 16px' },
  title: { fontSize:17, fontWeight:700, color:'#F9FAFB', textAlign:'center', marginBottom:20 },
  label: { fontSize:13, fontWeight:600, color:'#9CA3AF', marginBottom:8 },
  typeRow: { display:'flex', gap:8, marginBottom:16 },
  typeBtn: (active, color) => ({ flex:1, padding:'10px', borderRadius:10, border:`2px solid ${active ? color : '#2D2D2D'}`, background: active ? color+'22' : 'transparent', color: active ? color : '#9CA3AF', fontSize:14, fontWeight:700, cursor:'pointer' }),
  input: { width:'100%', background:'#1E1E1E', border:'1px solid #2D2D2D', borderRadius:10, padding:'11px 14px', color:'#F9FAFB', fontSize:15, marginBottom:16 },
  iconGrid: { display:'grid', gridTemplateColumns:'repeat(8,1fr)', gap:6, marginBottom:16 },
  iconBtn: (active) => ({ padding:'8px 4px', borderRadius:8, background: active ? '#8B5CF622' : '#1E1E1E', border:`2px solid ${active ? '#8B5CF6' : '#2D2D2D'}`, fontSize:20, cursor:'pointer', textAlign:'center' }),
  colorGrid: { display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8, marginBottom:20 },
  colorBtn: (color, active) => ({ width:'100%', aspectRatio:'1', borderRadius:8, background:color, border:`3px solid ${active ? 'white' : 'transparent'}`, cursor:'pointer', boxSizing:'border-box' }),
  previewRow: { display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'#1A1A1A', borderRadius:12, marginBottom:16 },
  previewIcon: (color) => ({ width:40, height:40, borderRadius:10, background:color+'22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }),
  btnRow: { display:'flex', gap:10 },
  cancelBtn: { flex:1, padding:'13px', borderRadius:12, background:'#1E1E1E', border:'1px solid #3D3D3D', color:'#9CA3AF', fontSize:14, fontWeight:600, cursor:'pointer' },
  saveBtn: (ok) => ({ flex:2, padding:'13px', borderRadius:12, background:'linear-gradient(135deg,#7C3AED,#8B5CF6)', color:'white', fontSize:14, fontWeight:700, cursor:'pointer', border:'none', opacity: ok ? 1 : 0.45 }),
};

function CategoryForm({ onSave, onClose }) {
  const [type, setType] = useState('expense');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [customIcon, setCustomIcon] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const finalIcon = customIcon.trim() || icon;
  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: 'custom_' + generateId(),
      name: name.trim(),
      type,
      icon: finalIcon,
      color,
    });
  };

  return (
    <div style={catFormS.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={catFormS.sheet}>
        <div style={catFormS.sheetHeader}>
          <div style={catFormS.handle} />
          <div style={catFormS.title}>카테고리 추가</div>
        </div>

        <div style={catFormS.scrollContent}>
          <div style={catFormS.previewRow}>
            <div style={catFormS.previewIcon(color)}>{finalIcon}</div>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:'#F9FAFB' }}>{name || '카테고리 이름'}</div>
              <div style={{ fontSize:12, color: type === 'income' ? '#10B981' : '#F87171', marginTop:2 }}>{type === 'income' ? '수입' : '지출'}</div>
            </div>
          </div>

          <div style={catFormS.label}>종류</div>
          <div style={catFormS.typeRow}>
            <button style={catFormS.typeBtn(type === 'income', '#10B981')} onClick={() => setType('income')}>💚 수입</button>
            <button style={catFormS.typeBtn(type === 'expense', '#F87171')} onClick={() => setType('expense')}>❤️ 지출</button>
          </div>

          <div style={catFormS.label}>카테고리 이름</div>
          <input style={catFormS.input} type="text" placeholder="예: 반려동물" value={name} onChange={(e) => setName(e.target.value)} maxLength={8} autoFocus />

          <div style={catFormS.label}>아이콘 선택</div>
          <div style={catFormS.iconGrid}>
            {PRESET_ICONS.map((ic) => (
              <button key={ic} style={catFormS.iconBtn(!customIcon && icon === ic)} onClick={() => { setIcon(ic); setCustomIcon(''); }}>
                {ic}
              </button>
            ))}
          </div>
          <input
            style={{ ...catFormS.input, marginTop: -8 }}
            type="text"
            placeholder="직접 입력 (이모지 붙여넣기)"
            value={customIcon}
            onChange={(e) => setCustomIcon(e.target.value)}
            maxLength={2}
          />

          <div style={catFormS.label}>색상</div>
          <div style={catFormS.colorGrid}>
            {PRESET_COLORS.map((c) => (
              <button key={c} style={catFormS.colorBtn(c, color === c)} onClick={() => setColor(c)} />
            ))}
          </div>
        </div>

        <div style={catFormS.sheetFooter}>
          <div style={catFormS.btnRow}>
            <button style={catFormS.cancelBtn} onClick={onClose}>취소</button>
            <button style={catFormS.saveBtn(canSave)} onClick={handleSave} disabled={!canSave}>추가하기</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 카테고리 관리 섹션 ─── */
const catMgrS = {
  addCatBtn: {
    width:'100%', padding:'12px', borderRadius:12,
    background:'rgba(139,92,246,0.12)', border:'1px dashed #8B5CF6',
    color:'#A78BFA', fontSize:14, fontWeight:600, cursor:'pointer', marginBottom:16,
  },
  catList: { display:'flex', flexDirection:'column', gap:8, marginBottom:8 },
  catRow: { display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'#1A1A1A', borderRadius:12, border:'1px solid #2D2D2D' },
  catIcon: (color) => ({ width:34, height:34, borderRadius:8, background:color+'22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }),
  catName: { flex:1, fontSize:14, fontWeight:500, color:'#F9FAFB' },
  catType: (type) => ({ fontSize:11, color: type === 'income' ? '#10B981' : '#F87171', background: type === 'income' ? 'rgba(16,185,129,0.12)' : 'rgba(248,113,113,0.12)', padding:'2px 8px', borderRadius:10, fontWeight:600 }),
  defaultBadge: { fontSize:11, color:'#6B7280', background:'#252525', padding:'2px 8px', borderRadius:10 },
  deleteBtn: { width:28, height:28, borderRadius:7, background:'rgba(239,68,68,0.1)', color:'#EF4444', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, border:'none' },
};

/* ─── 반복 내역 폼 ─── */
const s = {
  wrap: { padding: '16px 16px 80px' },
  addBtn: { width:'100%', padding:'14px', borderRadius:14, background:'linear-gradient(135deg,#7C3AED,#8B5CF6)', color:'white', fontSize:15, fontWeight:700, border:'none', cursor:'pointer', marginBottom:20 },
  sectionTitle: { fontSize:14, fontWeight:700, color:'#9CA3AF', marginBottom:10, letterSpacing:'0.5px' },
  divider: { height:1, background:'#2D2D2D', margin:'20px 0' },
  card: { background:'#1A1A1A', borderRadius:14, padding:'14px', marginBottom:10, border:'1px solid #2D2D2D' },
  cardTop: { display:'flex', alignItems:'center', gap:10 },
  catIcon: (color) => ({ width:36, height:36, borderRadius:10, background:color+'22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }),
  info: { flex:1, minWidth:0 },
  name: { fontSize:14, fontWeight:600, color:'#F9FAFB' },
  meta: { fontSize:12, color:'#9CA3AF', marginTop:2 },
  amount: (type) => ({ fontSize:15, fontWeight:700, color: type==='income' ? '#10B981' : '#F87171', flexShrink:0 }),
  actions: { display:'flex', gap:8, marginTop:10 },
  toggleBtn: (active) => ({ flex:1, padding:'8px', borderRadius:8, background: active ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)', color: active ? '#10B981' : '#6B7280', fontSize:12, fontWeight:600, border:`1px solid ${active ? '#10B981' : '#3D3D3D'}`, cursor:'pointer' }),
  deleteBtn: { padding:'8px 12px', borderRadius:8, background:'rgba(239,68,68,0.1)', color:'#EF4444', fontSize:12, fontWeight:600, border:'1px solid rgba(239,68,68,0.3)', cursor:'pointer' },
  emptyWrap: { textAlign:'center', color:'#6B7280', padding:'24px 0', fontSize:13 },
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' },
  sheet: { width:'100%', maxWidth:430, background:'#141414', borderRadius:'20px 20px 0 0', maxHeight:'88vh', display:'flex', flexDirection:'column' },
  sheetHeader: { padding:'0 16px', flexShrink:0 },
  scrollContent: { flex:1, overflowY:'scroll', WebkitOverflowScrolling:'touch', overscrollBehavior:'contain', padding:'0 16px 8px' },
  sheetFooter: { flexShrink:0, padding:'12px 16px calc(20px + env(safe-area-inset-bottom,0px))' },
  handle: { width:40, height:4, borderRadius:2, background:'#3D3D3D', margin:'12px auto 16px' },
  sheetTitle: { fontSize:17, fontWeight:700, color:'#F9FAFB', marginBottom:20, textAlign:'center' },
  label: { fontSize:13, fontWeight:600, color:'#9CA3AF', marginBottom:8 },
  input: { width:'100%', background:'#1E1E1E', border:'1px solid #2D2D2D', borderRadius:10, padding:'12px 14px', color:'#F9FAFB', fontSize:15, marginBottom:14 },
  select: { width:'100%', background:'#1E1E1E', border:'1px solid #2D2D2D', borderRadius:10, padding:'12px 14px', color:'#F9FAFB', fontSize:15, marginBottom:14, appearance:'none' },
  typeRow: { display:'flex', gap:8, marginBottom:14 },
  typeBtn: (active, color) => ({ flex:1, padding:'10px', borderRadius:10, border:`2px solid ${active ? color : '#2D2D2D'}`, background: active ? color+'22' : 'transparent', color: active ? color : '#9CA3AF', fontSize:14, fontWeight:700, cursor:'pointer' }),
  btnRow: { display:'flex', gap:10 },
  cancelBtn: { flex:1, padding:'13px', borderRadius:12, background:'#1E1E1E', border:'1px solid #3D3D3D', color:'#9CA3AF', fontSize:14, fontWeight:600, cursor:'pointer' },
  saveBtn: { flex:2, padding:'13px', borderRadius:12, background:'linear-gradient(135deg,#7C3AED,#8B5CF6)', color:'white', fontSize:14, fontWeight:700, cursor:'pointer', border:'none' },
};

function AddRecurringForm({ categories, onSave, onClose }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);

  const cats = categories.filter((c) => c.type === type);
  const getCat = (id) => categories.find((c) => c.id === id) || categories[categories.length - 1];

  const handleSave = () => {
    const parsed = parseInt(amount, 10);
    if (!parsed || parsed <= 0 || !category) return;
    onSave({
      id: generateId(),
      type, amount: parsed, category,
      description: description.trim() || getCat(category).name,
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
        <div style={s.sheetHeader}>
          <div style={s.handle} />
          <div style={s.sheetTitle}>반복 내역 추가</div>
        </div>

        <div style={s.scrollContent}>
          <div style={s.label}>수입/지출</div>
          <div style={s.typeRow}>
            <button style={s.typeBtn(type === 'income', '#10B981')} onClick={() => { setType('income'); setCategory(cats[0]?.id || 'salary'); }}>💚 수입</button>
            <button style={s.typeBtn(type === 'expense', '#F87171')} onClick={() => { setType('expense'); setCategory(cats[0]?.id || 'food'); }}>❤️ 지출</button>
          </div>

          <div style={s.label}>금액 (원)</div>
          <input style={s.input} type="tel" inputMode="numeric" placeholder="0"
            value={amount ? parseInt(amount).toLocaleString() : ''}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} />

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
                {Array.from({ length: 28 }, (_, i) => <option key={i+1} value={i+1}>{i+1}일</option>)}
              </select>
            </>
          )}
        </div>

        <div style={s.sheetFooter}>
          <div style={s.btnRow}>
            <button style={s.cancelBtn} onClick={onClose}>취소</button>
            <button style={{ ...s.saveBtn, opacity: !amount ? 0.5 : 1 }} onClick={handleSave} disabled={!amount}>저장</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsScreen({ categories, recurring, onAddRecurring, onToggleRecurring, onDeleteRecurring, onAddCategory, onDeleteCategory }) {
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const getCat = (id) => categories.find((c) => c.id === id) || categories[categories.length - 1];

  const freqDetail = (r) => {
    if (r.frequency === 'daily') return '매일';
    if (r.frequency === 'weekly') return `매주 ${getWeekDayName(r.dayOfWeek)}요일`;
    return `매월 ${r.dayOfMonth}일`;
  };

  const customCats = categories.filter((c) => c.isCustom);
  const defaultCats = CATEGORIES;

  return (
    <div style={s.wrap}>
      {/* ── 카테고리 관리 ── */}
      <div style={s.sectionTitle}>카테고리 관리</div>

      <button style={catMgrS.addCatBtn} onClick={() => setShowCategoryForm(true)}>
        ＋ 카테고리 직접 추가
      </button>

      <div style={catMgrS.catList}>
        {/* 커스텀 카테고리 */}
        {customCats.map((cat) => (
          <div key={cat.id} style={catMgrS.catRow}>
            <div style={catMgrS.catIcon(cat.color)}>{cat.icon}</div>
            <span style={catMgrS.catName}>{cat.name}</span>
            <span style={catMgrS.catType(cat.type)}>{cat.type === 'income' ? '수입' : '지출'}</span>
            <button style={catMgrS.deleteBtn} onClick={() => onDeleteCategory(cat.id)}>✕</button>
          </div>
        ))}

        {/* 기본 카테고리 (접을 수 있게) */}
        {defaultCats.map((cat) => (
          <div key={cat.id} style={{ ...catMgrS.catRow, opacity: 0.55 }}>
            <div style={catMgrS.catIcon(cat.color)}>{cat.icon}</div>
            <span style={catMgrS.catName}>{cat.name}</span>
            <span style={catMgrS.catType(cat.type)}>{cat.type === 'income' ? '수입' : '지출'}</span>
            <span style={catMgrS.defaultBadge}>기본</span>
          </div>
        ))}
      </div>

      <div style={s.divider} />

      {/* ── 반복 내역 ── */}
      <button style={s.addBtn} onClick={() => setShowRecurringForm(true)}>＋ 반복 내역 추가</button>
      <div style={s.sectionTitle}>반복 내역 목록 ({recurring.length})</div>

      {recurring.length === 0 ? (
        <div style={s.emptyWrap}>
          <div style={{ fontSize:36, marginBottom:8 }}>🔄</div>
          <div>반복 내역이 없습니다.<br />매월 고정 지출을 등록해보세요!</div>
        </div>
      ) : (
        recurring.map((r) => {
          const cat = getCat(r.category);
          return (
            <div key={r.id} style={{ ...s.card, opacity: r.isActive ? 1 : 0.5 }}>
              <div style={s.cardTop}>
                <div style={s.catIcon(cat.color)}>{cat.icon}</div>
                <div style={s.info}>
                  <div style={s.name}>{r.description}</div>
                  <div style={s.meta}>{freqDetail(r)} · {cat.name}</div>
                </div>
                <div style={s.amount(r.type)}>{r.type === 'income' ? '+' : '-'}{formatKRW(r.amount)}</div>
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

      {showCategoryForm && (
        <CategoryForm
          onSave={(cat) => { onAddCategory(cat); setShowCategoryForm(false); }}
          onClose={() => setShowCategoryForm(false)}
        />
      )}
      {showRecurringForm && (
        <AddRecurringForm
          categories={categories}
          onSave={(r) => { onAddRecurring(r); setShowRecurringForm(false); }}
          onClose={() => setShowRecurringForm(false)}
        />
      )}
    </div>
  );
}
