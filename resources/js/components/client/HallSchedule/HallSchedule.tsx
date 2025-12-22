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
              <Link
                className="movie-seances__time"
                to={`/hall/${screeningId}`}
                state={linkState}
              >
                {time}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};