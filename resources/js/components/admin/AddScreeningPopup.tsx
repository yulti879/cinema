import { useState } from 'react';
import { ConfigButton } from './ConfigButton/ConfigButton';
import { ConfigSection } from './ConfigSection/ConfigSection';
import { FormField } from './FormField/FormField';
import { CinemaHall, Movie } from '../../types';

interface AddScreeningPopupProps {
  isOpen: boolean;
  onClose: () => void;
  halls: CinemaHall[];
  movies: Movie[];
  onAddScreening: (screening: {
    hallId: string;
    movieId: string;
    date: string;
    startTime: string;
  }) => void;
}

export const AddScreeningPopup: React.FC<AddScreeningPopupProps> = ({
  isOpen,
  onClose,
  halls,
  movies,
  onAddScreening
}) => {
  const [hallId, setHallId] = useState('');
  const [movieId, setMovieId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hallId || !movieId || !startTime) {
      alert('Заполните все поля');
      return;
    }
    onAddScreening({ hallId, movieId, date, startTime });
    setHallId('');
    setMovieId('');
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('10:00');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="popup active">
      <div className="popup__container">
        <div className="popup__content">
          <div className="popup__header">
            <h2 className="popup__title">
              Добавление сеанса
              <a className="popup__dismiss" href="#" onClick={onClose}>
                <img src="/images/admin/close.png" alt="Закрыть" />
              </a>
            </h2>
          </div>
          <div className="popup__wrapper">
            <ConfigSection title="Данные сеанса" isOpen>
              <form onSubmit={handleSubmit}>
                <FormField
                  label="Зал"
                  name="hall"
                  type="select"
                  value={hallId}
                  onChange={e => setHallId(e.target.value)}
                  options={halls.map(h => ({ value: h.id, label: h.name }))}
                  required
                />
                <FormField
                  label="Фильм"
                  name="movie"
                  type="select"
                  value={movieId}
                  onChange={e => setMovieId(e.target.value)}
                  options={movies.map(m => ({ value: m.id, label: m.title }))}
                  required
                />
                <FormField
                  label="Дата"
                  name="date"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
                <FormField
                  label="Время начала"
                  name="startTime"
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  required
                />

                <div className="conf-step__buttons text-center">
                  <ConfigButton variant="accent" type="submit">Добавить сеанс</ConfigButton>
                  <ConfigButton variant="regular" type="button" onClick={onClose}>Отменить</ConfigButton>
                </div>
              </form>
            </ConfigSection>
          </div>
        </div>
      </div>
    </div>
  );
};