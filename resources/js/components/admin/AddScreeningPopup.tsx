import { useState } from 'react';
import { ConfigButton } from './ConfigButton/ConfigButton';
import { FormField } from './FormField/FormField';
import { Popup } from './Popup/Popup';
import type { 
  AdminHall, 
  AdminMovie,
  CreateScreeningDTO 
} from '../../types/admin';

interface AddScreeningPopupProps {
  isOpen: boolean;
  onClose: () => void;
  halls: AdminHall[];
  movies: AdminMovie[];
  hasConflict: (hallId: string, date: string, startTime: string, duration: number) => boolean;
  onScreeningAdded: (screening: CreateScreeningDTO) => Promise<void>;
}

export const AddScreeningPopup: React.FC<AddScreeningPopupProps> = ({
  isOpen,
  onClose,
  halls,
  movies,
  hasConflict,
  onScreeningAdded,
}) => {
  const [movieId, setMovieId] = useState('');
  const [hallId, setHallId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hallId || !movieId || !date || !startTime) {
      setError('Заполните все поля');
      return;
    }

    const selectedMovie = movies.find(m => m.id === movieId.toString());
    if (!selectedMovie) {
      setError('Фильм не найден');
      return;
    }

    // Проверка конфликтов
    if (hasConflict(hallId.toString(), date, startTime, selectedMovie.duration)) {
      setError('В этом зале уже есть сеанс на это время');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const screening: CreateScreeningDTO = {
        movieId: movieId.toString(),
        hallId: hallId.toString(),
        date,
        startTime,
      };

      await onScreeningAdded(screening);
      
      // Сброс формы
      setMovieId('');
      setHallId('');
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime('10:00');
      onClose();
      
    } catch (err: any) {
      setError(err.message || 'Ошибка при добавлении сеанса');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    onClose();
  };

  return (
    <Popup
      isOpen={isOpen}
      onClose={handleCancel}
      title="Добавление сеанса"
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="error-message" style={{ color: '#ff0000', marginBottom: '15px' }}>
            {error}
          </div>
        )}

        <FormField
          label="Зал"
          name="hall_id"
          type="select"
          value={hallId}
          onChange={e => setHallId(e.target.value)}
          options={halls.map(hall => ({ value: hall.id.toString(), label: hall.name }))}
          required
          disabled={isLoading}
        />

        <FormField
          label="Фильм"
          name="movie_id"
          type="select"
          value={movieId}
          onChange={e => setMovieId(e.target.value)}
          options={movies.map(movie => ({ value: movie.id.toString(), label: movie.title }))}
          required
          disabled={isLoading}
        />

        <FormField
          label="Дата"
          name="date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
          disabled={isLoading}
        />

        <FormField
          label="Время начала"
          name="start_time"
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          required
          disabled={isLoading}
        />

        <div className="conf-step__buttons text-center">
          <ConfigButton
            variant="accent"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Добавление...' : 'Добавить сеанс'}
          </ConfigButton>
          
          <ConfigButton
            variant="regular"
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Отменить
          </ConfigButton>
        </div>
      </form>
    </Popup>
  );
};