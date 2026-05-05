export const formatKRW = (amount) => {
  if (amount === 0) return '₩0';
  return '₩' + Math.abs(amount).toLocaleString('ko-KR');
};

export const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

export const formatMonthLabel = (year, month) => `${year}년 ${month + 1}월`;

export const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getMonthStr = (year, month) =>
  `${year}-${String(month + 1).padStart(2, '0')}`;

export const getMonthTransactions = (transactions, year, month) => {
  const prefix = getMonthStr(year, month);
  return transactions.filter((t) => t.date.startsWith(prefix));
};

export const calcSummary = (transactions) => {
  let income = 0;
  let expense = 0;
  transactions.forEach((t) => {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  });
  return { income, expense, balance: income - expense };
};

// 선택한 달 말일까지의 모든 거래를 합산한 누적 잔액
export const calcCumulativeBalance = (transactions, year, month) => {
  const nextMonth = month === 11
    ? `${year + 1}-01`
    : `${year}-${String(month + 2).padStart(2, '0')}`;
  const past = transactions.filter((t) => t.date < nextMonth);
  return calcSummary(past).balance;
};

export const calcCategorySpend = (transactions) => {
  const map = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
  return map;
};

export const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

export const getDailySpend = (transactions, year, month) => {
  const days = getDaysInMonth(year, month);
  const daily = Array(days).fill(0);
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const day = parseInt(t.date.split('-')[2], 10) - 1;
      if (day >= 0 && day < days) daily[day] += t.amount;
    });
  return daily;
};

export const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const getWeekDayName = (day) =>
  ['일', '월', '화', '수', '목', '금', '토'][day];

export const applyRecurring = (recurringList, existingTransactions) => {
  const today = new Date();
  const todayStr = getTodayStr();
  const todayDOW = today.getDay();
  const todayDOM = today.getDate();
  const currentMonthStr = getMonthStr(today.getFullYear(), today.getMonth());

  const newTxs = [];

  recurringList
    .filter((r) => r.isActive)
    .forEach((r) => {
      if (r.startDate > todayStr) return;

      if (r.frequency === 'daily') {
        const already = existingTransactions.some(
          (t) => t.recurringId === r.id && t.date === todayStr
        );
        if (!already) newTxs.push(mkTx(r, todayStr));
      } else if (r.frequency === 'weekly') {
        if (todayDOW === r.dayOfWeek) {
          const already = existingTransactions.some(
            (t) => t.recurringId === r.id && t.date === todayStr
          );
          if (!already) newTxs.push(mkTx(r, todayStr));
        }
      } else if (r.frequency === 'monthly') {
        const lastDayOfMonth = getDaysInMonth(today.getFullYear(), today.getMonth());
        const targetDay = Math.min(r.dayOfMonth, lastDayOfMonth);
        if (todayDOM === targetDay) {
          const already = existingTransactions.some(
            (t) => t.recurringId === r.id && t.date.startsWith(currentMonthStr)
          );
          if (!already) newTxs.push(mkTx(r, todayStr));
        }
      }
    });

  return newTxs;
};

const mkTx = (r, date) => ({
  id: generateId(),
  type: r.type,
  amount: r.amount,
  category: r.category,
  description: r.description + ' (자동)',
  date,
  recurringId: r.id,
  createdAt: Date.now(),
});
