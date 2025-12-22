import { useEffect, useState } from 'react';
import axios from 'axios';
import type {
  AdminMovie,
  AdminHall,
  AdminScreening,
  CreateMovieDTO,
  CreateScreeningDTO
} from '../../../types/admin';
import { ConfigSection } from '../ConfigSection/ConfigSection';
import { ConfigButton } from '../ConfigButton/ConfigButton';
import { Popup } from '../Popup/Popup';
import { DeleteForm } from '../DeleteForm/DeleteForm';
import { Poster } from '../Poster/Poster';
import { AddMoviePopup } from '../AddMoviePopup';
import { AddScreeningPopup } from '../AddScreeningPopup';
import './ScheduleManagement.css';

interface ScheduleManagementProps {
  isOpen: boolean;
  onToggle: () => void;
  halls: AdminHall[];
  movies: AdminMovie[];
  screenings: AdminScreening[];
  onMovieCreated?: (movie: AdminMovie) => void;
  onScreeningCreated?: (screening: AdminScreening) => void;
  onMovieDeleted?: (movieId: string) => void;
  onScreeningDeleted?: (screeningId: string) => void;
}

export const ScheduleManagement: React.FC<ScheduleManagementProps> = ({
  isOpen,
  onToggle,
  halls,
  movies,
  screenings,
  onMovieCreated,
  onScreeningCreated,
  onMovieDeleted,
  onScreeningDeleted,
}) => {
  const [localMovies, setLocalMovies] = useState<AdminMovie[]>(movies.map(m => ({ ...m, id: m.id.toString() })));
  const [localScreenings, setLocalScreenings] = useState<AdminScreening[]>(screenings.map(s => ({
    ...s,
    id: s.id.toString(),
    movieId: s.movieId.toString(),
    hallId: s.hallId.toString(),
  })));
  const [isAddMoviePopupOpen, setIsAddMoviePopupOpen] = useState(false);
  const [isAddScreeningPopupOpen, setIsAddScreeningPopupOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<AdminMovie | null>(null);
  const [screeningToDelete, setScreeningToDelete] = useState<AdminScreening | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Синхронизация локального состояния при изменении пропсов
  useEffect(() => setLocalMovies(movies.map(m => ({ ...m, id: m.id.toString() }))), [movies]);
  useEffect(() => setLocalScreenings(screenings.map(s => ({
    ...s,
    id: s.id.toString(),
    movieId: s.movieId.toString(),
    hallId: s.hallId.toString(),
  }))), [screenings]);

  // Добавление фильма
  const handleMovieAdded = async (dto: CreateMovieDTO): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', dto.title);
      formData.append('synopsis', dto.synopsis);
      formData.append('duration', dto.duration.toString());
      formData.append('origin', dto.origin);
      if (dto.poster) formData.append('poster', dto.poster);

      const response = await axios.post('/api/movies', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newMovie: AdminMovie = {
        id: response.data.id.toString(),
        title: response.data.title,
        posterUrl: response.data.posterUrl,
        synopsis: response.data.synopsis,
        duration: response.data.duration,
        origin: response.data.origin,
      };

      setLocalMovies(prev => [...prev, newMovie]);
      onMovieCreated?.(newMovie);
      setIsAddMoviePopupOpen(false);

    } catch (err: any) {
      console.error('Error adding movie:', err);
      setError(err.response?.data?.message || 'Ошибка при добавлении фильма');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Добавление сеанса
  const handleScreeningAdded = async (dto: CreateScreeningDTO): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const movie = localMovies.find(m => m.id === dto.movieId.toString());
      if (!movie) throw new Error('Фильм не найден');

      // Преобразуем поля в snake_case для Laravel
      const payload = {
        movie_id: dto.movieId,
        hall_id: dto.hallId,
        date: dto.date,
        start_time: dto.startTime,
      };

      const response = await axios.post('/api/screenings', payload);

      const newScreening: AdminScreening = {
        id: response.data.id.toString(),
        movieId: response.data.movieId.toString(),
        hallId: response.data.hallId.toString(),
        date: response.data.date,
        startTime: response.data.startTime,
        movie,
        hall: halls.find(h => h.id === response.data.hallId.toString()),
      };

      setLocalScreenings(prev => [...prev, newScreening]);
      onScreeningCreated?.(newScreening);
      setIsAddScreeningPopupOpen(false);

    } catch (err: any) {
      console.error('Error adding screening:', err);
      setError(err.response?.data?.message || 'Ошибка при добавлении сеанса');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление фильма
  const handleDeleteMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieToDelete) return;

    setIsLoading(true);
    try {
      await axios.delete(`/api/movies/${movieToDelete.id}`);
      setLocalMovies(prev => prev.filter(m => m.id !== movieToDelete.id));
      onMovieDeleted?.(movieToDelete.id);
      setMovieToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при удалении фильма');
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление сеанса
  const handleDeleteScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screeningToDelete) return;

    setIsLoading(true);
    try {
      await axios.delete(`/api/screenings/${screeningToDelete.id}`);
      setLocalScreenings(prev => prev.filter(s => s.id !== screeningToDelete.id));
      onScreeningDeleted?.(screeningToDelete.id);
      setScreeningToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при удалении сеанса');
    } finally {
      setIsLoading(false);
    }
  };

  const getMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const hasConflict = (hallId: string, date: string, startTime: string, duration: number) => {
    const start = getMinutes(startTime);
    const end = start + duration;

    return localScreenings
      .filter(s => s.hallId === hallId.toString() && s.date === date)
      .some(s => {
        const movie = localMovies.find(m => m.id === s.movieId.toString());
        if (!movie) return false;

        const sStart = getMinutes(s.startTime);
        const sEnd = sStart + movie.duration;
        return start < sEnd && end > sStart;
      });
  };

  if (!isOpen) {
    return (
      <ConfigSection title="Сетка сеансов" isOpen={isOpen} onToggle={onToggle}>
        <></>
      </ConfigSection>
    );
  }

  const colors = [
    '#caff85',
    '#85ff89',
    '#85ffd3',
    '#85e2ff',
    '#8599ff',
    '#ba85ff',
    '#ff85fb',
    '#ff85b1',
    '#ffa285',
  ];

  const movieColors: Record<string, string> = Object.fromEntries(
    localMovies.map((m, i) => [m.id, colors[i % colors.length]])
  );

  return (
    <ConfigSection title="Сетка сеансов" isOpen={isOpen} onToggle={onToggle}>
      {error && (
        <div className="error-message" style={{ color: '#ff0000' }}>
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: '10px' }}>×</button>
        </div>
      )}

      <div className="conf-step__buttons">
        <ConfigButton
          variant="accent"
          onClick={() => setIsAddMoviePopupOpen(true)}
          disabled={isLoading}
        >
          Добавить фильм
        </ConfigButton>

        <ConfigButton
          variant="accent"
          onClick={() => setIsAddScreeningPopupOpen(true)}
          disabled={localMovies.length === 0 || halls.length === 0 || isLoading}
          title={localMovies.length === 0 ? "Добавьте фильмы" : halls.length === 0 ? "Добавьте залы" : ""}
        >
          Добавить сеанс
        </ConfigButton>
      </div>

      {/* Список фильмов */}
      {localMovies.length > 0 && (
        <div className="conf-step__movies">
          {localMovies.map(movie => (
            <div key={movie.id} className="conf-step__movie">
              <Poster src={movie.posterUrl} alt={movie.title} />
              <div className="conf-step__movie-info">
                <h4 className="conf-step__movie-title">{movie.title}</h4>
                <p className="conf-step__movie-duration">{movie.duration} минут</p>
                <p className="conf-step__movie-synopsis">
                  {movie.synopsis.length > 100 ? `${movie.synopsis.substring(0, 100)}...` : movie.synopsis}
                </p>
              </div>
              <div className="conf-step__movie-actions">
                <ConfigButton
                  variant="trash"
                  onClick={() => setMovieToDelete(movie)}
                  title="Удалить фильм"
                  disabled={isLoading}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Сетка сеансов */}
      {localScreenings.length > 0 && (
        <div className="conf-step__seances">
          {halls.map(hall => {
            const hallScreenings = localScreenings
              .filter(s => s.hallId === hall.id.toString())
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

            if (hallScreenings.length === 0) return null;

            // Для корректного смещения сеансов
            const lastMovieEnd: Record<string, number> = {};

            return (
              <div key={hall.id} className="conf-step__seances-hall">
                <h3 className="conf-step__seances-title">{hall.name}</h3>
                <div className="conf-step__seances-timeline">
                  {hallScreenings.map(screening => {
                    const movie = localMovies.find(m => m.id === screening.movieId.toString());
                    if (!movie) return null;
                    
                    const startTime = screening.startTime.split('T')[1]?.substring(0, 5) || screening.startTime;
                    
                    const [hour, minute] = startTime.split(':').map(Number);
                    let left = (hour * 60 + minute) / (24 * 60) * 100;
                    const width = (movie.duration / (24 * 60)) * 100;
                    
                    if (lastMovieEnd[screening.movieId]) {
                      left = Math.max(left, lastMovieEnd[screening.movieId] + 0.5); // 0.5% отступ
                    }
                    lastMovieEnd[screening.movieId] = left + width;

                    return (
                      <div
                        key={screening.id}
                        className="conf-step__seances-movie"
                        style={{
                          width: `${width}%`,
                          left: `${left}%`,
                          backgroundColor: movieColors[screening.movieId],
                        }}
                        title={`${movie.title} ${startTime}`}
                      >
                        <p className="conf-step__seances-movie-title">{movie.title}</p>
                        <p className="conf-step__seances-movie-start">{startTime}</p>
                        <button
                          className="conf-step__seances-movie-delete"
                          onClick={() => setScreeningToDelete(screening)}
                          title="Удалить сеанс"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Попапы */}
      <AddMoviePopup
        isOpen={isAddMoviePopupOpen}
        onClose={() => setIsAddMoviePopupOpen(false)}
        onAddMovie={handleMovieAdded}
      />

      <AddScreeningPopup
        isOpen={isAddScreeningPopupOpen}
        onClose={() => setIsAddScreeningPopupOpen(false)}
        halls={halls}
        movies={localMovies}
        hasConflict={hasConflict}
        onScreeningAdded={handleScreeningAdded}
      />

      <Popup
        isOpen={!!movieToDelete}
        onClose={() => setMovieToDelete(null)}
        title="Удаление фильма"
      >
        <DeleteForm
          message="Вы действительно хотите удалить фильм"
          itemName={movieToDelete?.title || ''}
          onSubmit={handleDeleteMovie}
          onCancel={() => setMovieToDelete(null)}
          submitText={isLoading ? 'Удаление...' : 'Удалить'}
        />
      </Popup>

      <Popup
        isOpen={!!screeningToDelete}
        onClose={() => setScreeningToDelete(null)}
        title="Удаление сеанса"
      >
        <DeleteForm
          message="Вы действительно хотите удалить сеанс"
          itemName={screeningToDelete?.movie?.title || ''}
          onSubmit={handleDeleteScreening}
          onCancel={() => setScreeningToDelete(null)}
          submitText={isLoading ? 'Удаление...' : 'Удалить'}
        />
      </Popup>
    </ConfigSection>
  );
};