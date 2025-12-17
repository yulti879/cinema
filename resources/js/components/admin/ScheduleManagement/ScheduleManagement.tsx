import { useState, useEffect } from 'react';
import { CinemaHall, Movie, Screening } from '../../../types';
import { ConfigSection } from '../ConfigSection/ConfigSection';
import { ConfigButton } from '../ConfigButton/ConfigButton';
import { DeleteForm } from '../DeleteForm/DeleteForm';
import { Poster } from '../Poster/Poster';
import { AddMoviePopup } from '../AddMoviePopup';
import { AddScreeningPopup } from '../AddScreeningPopup';
import './ScheduleManagement.css';

interface ScheduleManagementProps {
  isOpen: boolean;
  onToggle: () => void;
  halls?: CinemaHall[];
  movies?: Movie[];
  screenings?: Screening[];
  onMovieAdded: (movie: Movie) => Promise<void>;
  onMovieDeleted?: (movieId: string) => void;
  onScreeningAdded: (screening: Omit<Screening, 'id'>) => void;
  onScreeningDeleted?: (screeningId: string) => void;
}

export const ScheduleManagement: React.FC<ScheduleManagementProps> = ({
  isOpen,
  onToggle,
  halls,
  movies,
  screenings,
  onMovieAdded,
  onMovieDeleted,
  onScreeningAdded,
  onScreeningDeleted,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [safeHalls, setSafeHalls] = useState<CinemaHall[]>([]);
  const [safeMovies, setSafeMovies] = useState<Movie[]>([]);
  const [safeScreenings, setSafeScreenings] = useState<Screening[]>([]);

  // Попапы и состояния
  const [isAddMoviePopupOpen, setIsAddMoviePopupOpen] = useState(false);
  const [isAddScreeningPopupOpen, setIsAddScreeningPopupOpen] = useState(false);
  const [isDeleteMoviePopupOpen, setIsDeleteMoviePopupOpen] = useState(false);
  const [isDeleteScreeningPopupOpen, setIsDeleteScreeningPopupOpen] = useState(false);

  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [screeningToDelete, setScreeningToDelete] = useState<Screening | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ----------------------------
  // Обновление safe массивов при приходе props
  // ----------------------------
  useEffect(() => {
    if (Array.isArray(halls) && Array.isArray(movies) && Array.isArray(screenings)) {
      setSafeHalls(halls);
      setSafeMovies(movies);
      setSafeScreenings(screenings);
      setIsLoading(false);
    }
  }, [halls, movies, screenings]);

  // ----------------------------
  // Вспомогательные функции
  // ----------------------------
  const getTimeInMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const hasTimeConflict = (hallId: string, startTime: string, date: string, duration: number) => {
    const newStart = getTimeInMinutes(startTime);
    const newEnd = newStart + duration;

    return safeScreenings
      .filter(s => s.hallId === hallId && s.date === date)
      .some(s => {
        const existingStart = getTimeInMinutes(s.startTime);
        const existingEnd = existingStart + s.duration;
        return newStart < existingEnd && newEnd > existingStart;
      });
  };

  const getTimePosition = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours * 60 + minutes) * 0.5;
  };

  const getMovieTitle = (movieId: string) => safeMovies.find(m => m.id === movieId)?.title || 'Неизвестный фильм';
  const getHallName = (hallId: string) => safeHalls.find(h => h.id === hallId)?.name || 'Неизвестный зал';

  // ----------------------------
  // Работа с удалением
  // ----------------------------
  const handleDeleteMovie = (movie: Movie) => {
    setMovieToDelete(movie);
    setIsDeleteMoviePopupOpen(true);
  };

  const confirmDeleteMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (movieToDelete && onMovieDeleted) {
      onMovieDeleted(movieToDelete.id);
      setMovieToDelete(null);
      setIsDeleteMoviePopupOpen(false);
      setHasUnsavedChanges(true);
    }
  };

  const handleDeleteScreening = (screening: Screening) => {
    setScreeningToDelete(screening);
    setIsDeleteScreeningPopupOpen(true);
  };

  const confirmDeleteScreening = (e: React.FormEvent) => {
    e.preventDefault();
    if (screeningToDelete && onScreeningDeleted) {
      onScreeningDeleted(screeningToDelete.id);
      setScreeningToDelete(null);
      setIsDeleteScreeningPopupOpen(false);
      setHasUnsavedChanges(true);
    }
  };

  // ----------------------------
  // Loader
  // ----------------------------
  if (isLoading) {
    return (
      <ConfigSection title="Сетка сеансов" isOpen={isOpen} onToggle={onToggle}>
        <p style={{ fontStyle: 'italic', color: '#848484' }}>Загрузка данных...</p>
      </ConfigSection>
    );
  }

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <ConfigSection title={`Сетка сеансов${hasUnsavedChanges ? ' *' : ''}`} isOpen={isOpen} onToggle={onToggle}>
      {/* Кнопки для добавления */}
      <p className="conf-step__paragraph">
        <ConfigButton variant="accent" onClick={() => setIsAddMoviePopupOpen(true)}>Добавить фильм</ConfigButton>
      </p>
      <p className="conf-step__paragraph">
        <ConfigButton variant="accent" onClick={() => setIsAddScreeningPopupOpen(true)}>Добавить сеанс</ConfigButton>
      </p>

      {/* Список фильмов */}
      {safeMovies.length > 0 ? (
        safeMovies.map(movie => (
          <div key={movie.id} className="conf-step__movie">
            <Poster src={movie.poster} alt={movie.title} />
            <div className="conf-step__movie-info">
              <h3>{movie.title}</h3>
              <p>{movie.duration} мин.</p>
              <p>{movie.origin}</p>
            </div>
            <ConfigButton variant="trash" onClick={() => handleDeleteMovie(movie)} title="Удалить фильм" />
          </div>
        ))
      ) : (
        <p style={{ color: '#848484', fontStyle: 'italic' }}>Пока нет добавленных фильмов.</p>
      )}

      {/* Сетка сеансов по залам */}
      {safeHalls.map(hall => (
        <div key={hall.id}>
          <h3>{hall.name}</h3>
          <div className="conf-step__seances-timeline">
            {safeScreenings.filter(s => s.hallId === hall.id).map(screening => (
              <div
                key={screening.id}
                className="conf-step__seances-movie"
                style={{ left: `${getTimePosition(screening.startTime)}px`, width: `${screening.duration}px` }}
              >
                <p>{getMovieTitle(screening.movieId)}</p>
                <p>{screening.startTime}</p>
                <ConfigButton variant="trash" onClick={() => handleDeleteScreening(screening)} />
              </div>
            ))}
            {safeScreenings.filter(s => s.hallId === hall.id).length === 0 && (
              <div>Нет сеансов в этом зале</div>
            )}
          </div>
        </div>
      ))}

      {/* Попапы */}
      <AddMoviePopup
        isOpen={isAddMoviePopupOpen}
        onClose={() => setIsAddMoviePopupOpen(false)}
        onMovieAdded={onMovieAdded}
      />

      <AddScreeningPopup
        isOpen={isAddScreeningPopupOpen}
        onClose={() => setIsAddScreeningPopupOpen(false)}
        halls={safeHalls}
        movies={safeMovies}
        onAddScreening={screening => {
          const movie = safeMovies.find(m => m.id === screening.movieId);
          if (!movie) return;
          onScreeningAdded({ ...screening, duration: movie.duration });
        }}
      />

      {/* Delete попапы */}
      {isDeleteMoviePopupOpen && movieToDelete && (
        <DeleteForm
          message="Вы уверены, что хотите удалить фильм"
          itemName={movieToDelete.title}
          onSubmit={confirmDeleteMovie}
          onCancel={() => setIsDeleteMoviePopupOpen(false)}
        />
      )}

      {isDeleteScreeningPopupOpen && screeningToDelete && (
        <DeleteForm
          message="Вы уверены, что хотите удалить сеанс"
          itemName={`${getMovieTitle(screeningToDelete.movieId)} ${screeningToDelete.startTime}`}
          onSubmit={confirmDeleteScreening}
          onCancel={() => setIsDeleteScreeningPopupOpen(false)}
        />
      )}
    </ConfigSection>
  );
};