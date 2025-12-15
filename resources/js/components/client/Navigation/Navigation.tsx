import { useCinema } from '../../../context/CinemaContext';
import { getMondayOfWeek, generateWeekDays } from '../../../utils/dateHelpers';
import type { Day } from '../../../types/client';

import './Navigation.css';

export const Navigation: React.FC = () => {
  const { selectedDate, setSelectedDate } = useCinema();

  const days: Day[] = generateWeekDays(selectedDate);

  const canGoBack =
    getMondayOfWeek(selectedDate).getTime() >
    getMondayOfWeek(new Date()).getTime();

  const handleChangeWeek = (offset: number) => {
    const monday = getMondayOfWeek(selectedDate);
    const next = new Date(monday.getTime() + offset * 24 * 60 * 60 * 1000);
    setSelectedDate(next);
  };

  return (
    <nav className="page-nav">
      {canGoBack && (
        <button
          className="page-nav__day page-nav__day_prev"
          onClick={() => handleChangeWeek(-7)}
          aria-label="Предыдущая неделя"
        />
      )}

      {days.map(day => (
        <button
          key={day.date.toISOString()}
          className={[
            'page-nav__day',
            day.today && 'page-nav__day_today',
            day.chosen && 'page-nav__day_chosen',
            day.weekend && 'page-nav__day_weekend'
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => setSelectedDate(day.date)}
          aria-current={day.chosen ? 'date' : undefined}
          aria-label={`${day.day} ${day.number}`}
        >
          <span className="page-nav__day-week">{day.day}</span>
          <span className="page-nav__day-number">{day.number}</span>
        </button>
      ))}

      <button
        className="page-nav__day page-nav__day_next"
        onClick={() => handleChangeWeek(7)}
        aria-label="Следующая неделя"
      />
    </nav>
  );
};