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

// 기간: 당월 25일 ~ 익월 24일  (예: 5월 = 5/25 ~ 6/24)
export const getPeriodStart = (year, month) =>
  `${year}-${String(month + 1).padStart(2, '0')}-25`;

export const getPeriodEnd = (year, month) => {
  const ny = month === 11 ? year + 1 : year;
  const nm = month === 11 ? 0 : month + 1;
  return `${ny}-${String(nm + 1).padStart(2, '0')}-24`;
};

// 날짜가 속하는 기간 {year, month} 반환
// 25일 이상 → 당월 기간 / 24일 이하 → 전월 기간
export const getPeriodForDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const month0 = m - 1;
  if (d >= 25) return { year: y, month: month0 };
  return month0 === 0 ? { year: y - 1, month: 11 } : { year: y, month: month0 - 1 };
};

// 오늘 날짜가 속하는 기간 반환
export const getCurrentPeriod = () => {
  const today = new Date();
  return getPeriodForDate(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  );
};

export const getMonthTransactions = (transactions, year, month) => {
  const start = getPeriodStart(year, month);
  const end = getPeriodEnd(year, month);
  return transactions.filter((t) => t.date >= start && t.date <= end);
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

// 선택한 기간 말일(익월 24일)까지의 누적 잔액
export const calcCumulativeBalance = (transactions, year, month) => {
  const end = getPeriodEnd(year, month);
  return calcSummary(transactions.filter((t) => t.date <= end)).balance;
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

// 기간(당월 25일~익월 24일)의 총 일수 = 당월의 일수
export const getDaysInPeriod = (year, month) => getDaysInMonth(year, month);

// 차트 인덱스 i에 해당하는 실제 날짜 숫자 반환 (25→말일, 1→24)
export const getPeriodDayLabel = (i, year, month) => {
  const daysFromCurrent = getDaysInMonth(year, month) - 24;
  return i < daysFromCurrent ? 25 + i : i - daysFromCurrent + 1;
};

// 오늘이 해당 기간에서 몇 번째 인덱스인지 반환 (기간 아니면 -1)
export const getTodayPeriodIdx = (year, month) => {
  const today = new Date();
  const td = today.getDate(), tm = today.getMonth(), ty = today.getFullYear();
  const ny = month === 11 ? year + 1 : year;
  const nm = month === 11 ? 0 : month + 1;
  const daysFromCurrent = getDaysInMonth(year, month) - 24;
  if (ty === year && tm === month && td >= 25) return td - 25;
  if (ty === ny && tm === nm && td <= 24) return daysFromCurrent + td - 1;
  return -1;
};

export const getDailySpend = (transactions, year, month) => {
  const daysFromCurrent = getDaysInMonth(year, month) - 24;
  const ny = month === 11 ? year + 1 : year;
  const nm = month === 11 ? 0 : month + 1;
  const daily = Array(daysFromCurrent + 24).fill(0);
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const parts = t.date.split('-');
      const ty = parseInt(parts[0]), tm1 = parseInt(parts[1]), td = parseInt(parts[2]);
      const tm = tm1 - 1;
      if (ty === year && tm === month && td >= 25) daily[td - 25] += t.amount;
      else if (ty === ny && tm === nm && td <= 24) daily[daysFromCurrent + td - 1] += t.amount;
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
