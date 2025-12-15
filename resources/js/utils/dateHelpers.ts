export const DAYS_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

/**
 * Возвращает понедельник той недели, к которой относится указанная дата.
 * Корректно работает при переходах месяца, года и DST.
 */
export const getMondayOfWeek = (date: Date): Date => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate() + diff
  );
};

/**
 * Генерирует массив из 7 дней недели, начиная с понедельника.
 */
export const generateWeekDays = (selectedDate: Date) => {
  const monday = getMondayOfWeek(selectedDate);

  const today = new Date();
  const todayKey = today.toDateString();
  const selectedKey = selectedDate.toDateString();

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + i
    );

    const dayOfWeek = d.getDay();

    return {
      date: d,
      day: DAYS_SHORT[dayOfWeek],
      number: String(d.getDate()),
      today: d.toDateString() === todayKey,
      chosen: d.toDateString() === selectedKey,
      weekend: dayOfWeek === 0 || dayOfWeek === 6,
    };
  });
};