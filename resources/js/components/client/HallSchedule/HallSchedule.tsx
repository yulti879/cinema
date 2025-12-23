import { Link } from 'react-router-dom';
import { useCinema } from '../../../context/CinemaContext';
import type { HallSchedule as HallScheduleType } from '../../../types/client';
import './HallSchedule.css';

interface HallScheduleProps {
  hall: HallScheduleType;
  movieTitle: string;
}

export const HallSchedule: React.FC<HallScheduleProps> = ({ 
  hall, 
  movieTitle 
}) => {
  const { selectedDate } = useCinema();
  const now = new Date();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\./g, '-');
  };

  return (
    <div className="movie-seances__hall">
      <h3 className="movie-seances__hall-title">{hall.name}</h3>
      <ul className="movie-seances__list">
        {hall.times.map((time: string, index: number) => {
          const screeningId = hall.screeningIds[index];

          // Определяем дату и время сеанса
          const [hours, minutes] = time.split(':').map(Number);
          const screeningDateTime = new Date(selectedDate);
          screeningDateTime.setHours(hours, minutes, 0, 0);

          const isPast = screeningDateTime < now;

          // Формируем состояние для передачи залу
          const linkState = {
            movieTitle,
            startTime: time,
            hallName: hall.name,
            screeningId: screeningId,
            date: formatDate(selectedDate),
            hallId: hall.id,
          };

          return (
            <li key={`${time}-${index}`} className="movie-seances__time-block">
              {isPast ? (
                <span className="movie-seances__time movie-seances__time--past">
                  {time}
                </span>
              ) : (
                <Link
                  className="movie-seances__time"
                  to={`/hall/${screeningId}`}
                  state={linkState}
                >
                  {time}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};