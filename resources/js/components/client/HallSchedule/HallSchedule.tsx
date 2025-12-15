import { Link } from 'react-router-dom';
import { useCinema } from '../../../context/CinemaContext';
import type { ClientHall } from '../../../types/client';
import './HallSchedule.css';

interface HallScheduleProps {
    hall: ClientHall;
    movieTitle: string;
}

export const HallSchedule: React.FC<HallScheduleProps> = ({ 
    hall, 
    movieTitle 
}) => {
    const { selectedDate } = useCinema();
    
    return (
        <div className="movie-seances__hall">
            <h3 className="movie-seances__hall-title">{hall.name}</h3>
            <ul className="movie-seances__list">
                {hall.times.map((time: string, timeIndex: number) => {
                    const screeningId = hall.screeningIds[timeIndex];
                    
                    const linkState = {
                        movieTitle,
                        startTime: time,
                        hallName: hall.name,
                        screeningId: screeningId,
                        date: selectedDate.toLocaleDateString('ru-RU')
                    };
                    
                    return (
                        <li key={timeIndex} className="movie-seances__time-block">
                            <Link
                                className="movie-seances__time"
                                to="/hall"
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