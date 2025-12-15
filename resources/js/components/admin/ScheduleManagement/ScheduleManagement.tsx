import { useState, useRef } from 'react';
import { CinemaHall, Movie, Screening } from '../../../types';
import { ConfigSection } from '../ConfigSection/ConfigSection';
import { ConfigButton } from '../ConfigButton/ConfigButton';
import { DeleteForm } from '../DeleteForm/DeleteForm';
import { FormField } from '../FormField/FormField';
import { Popup } from '../Popup/Popup';
import { Poster } from '../Poster/Poster';
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
  halls = [],
  movies = [],
  screenings = [],
  onMovieAdded,
  onMovieDeleted,
  onScreeningAdded,
  onScreeningDeleted
}) => {
  const [isAddMoviePopupOpen, setIsAddMoviePopupOpen] = useState(false);
  const [isAddScreeningPopupOpen, setIsAddScreeningPopupOpen] = useState(false);
  const [isDeleteMoviePopupOpen, setIsDeleteMoviePopupOpen] = useState(false);
  const [isDeleteScreeningPopupOpen, setIsDeleteScreeningPopupOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPosterUploading, setIsPosterUploading] = useState(false);

  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [screeningToDelete, setScreeningToDelete] = useState<Screening | null>(null);

  const [newMovie, setNewMovie] = useState({
    title: '',
    duration: '',
    synopsis: '',
    origin: '',
    posterUrl: ''
  });

  const [newScreening, setNewScreening] = useState({
    hallId: '',
    movieId: '',
    startTime: '10:00',
    date: new Date().toISOString().split('T')[0]
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTimeInMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const hasTimeConflict = (hallId: string, startTime: string, date: string, duration: number) => {
    const newStart = getTimeInMinutes(startTime);
    const newEnd = newStart + duration;

    return screenings
      .filter(s => s.hallId === hallId && s.date === date)
      .some(s => {
        const existingStart = getTimeInMinutes(s.startTime);
        const existingEnd = existingStart + s.duration;
        return newStart < existingEnd && newEnd > existingStart;
      });
  };

  // Загрузка постера через fetch
  const uploadPosterToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('poster', file);

    const response = await fetch('/api/upload-poster', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Не удалось загрузить постер');
    }

    const data = await response.json();
    return data.url; // предполагаем, что API возвращает { url: string }
  };

  const handleUploadPosterClick = () => {
    fileInputRef.current?.click();
  };

  const handlePosterSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      return;
    }

    try {
      setIsPosterUploading(true);
      const reader = new FileReader();
      reader.onload = () => {
        setNewMovie(prev => ({ ...prev, posterUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);

      const posterUrl = await uploadPosterToServer(file);
      setNewMovie(prev => ({ ...prev, posterUrl }));
      alert('Постер успешно загружен!');
    } catch (err) {
      console.error(err);
      alert('Ошибка при загрузке постера');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsPosterUploading(false);
    }
  };

  const removePoster = () => {
    setNewMovie(prev => ({ ...prev, posterUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Обработчики для фильмов
  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMovie.title.trim() && newMovie.duration.trim() && newMovie.synopsis.trim() && newMovie.origin.trim()) {
      try {
        setIsUploading(true);
        
        // Используем загруженный постер или дефолтный
        const posterUrl = newMovie.posterUrl || '/images/posters/default.jpg';
        
        const movie: Movie = {
          id: '0', // временный ID, будет заменен сервером
          title: newMovie.title,
          poster: posterUrl,
          synopsis: newMovie.synopsis,
          duration: parseInt(newMovie.duration) || 120,
          origin: newMovie.origin
        };
        
        // Вызываем колбэк для создания фильма через API
        await onMovieAdded(movie);
        
        // Закрываем попап и сбрасываем форму только после успешного создания
        setIsAddMoviePopupOpen(false);
        setNewMovie({ 
          title: '', 
          duration: '', 
          synopsis: '', 
          origin: '',
          posterUrl: ''
        });
        setHasUnsavedChanges(true);
        
      } catch (error) {
        console.error('Ошибка при добавлении фильма:', error);        
      } finally {
        setIsUploading(false);
      }
    } else {
      alert('Заполните все обязательные поля');
    }
  };

  const handleDeleteMovie = (movie: Movie) => {
    setMovieToDelete(movie);
    setIsDeleteMoviePopupOpen(true);
  };

  const confirmDeleteMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (movieToDelete && onMovieDeleted) {
      onMovieDeleted(movieToDelete.id);
      setIsDeleteMoviePopupOpen(false);
      setMovieToDelete(null);
      setHasUnsavedChanges(true);
    }
  };

  const cancelDeleteMovie = () => {
    setIsDeleteMoviePopupOpen(false);
    setMovieToDelete(null);
  };

  // Обработчики для сеансов
  const handleAddScreening = (e: React.FormEvent) => {
    e.preventDefault();
    if (newScreening.hallId && newScreening.movieId && newScreening.startTime) {
      const movie = movies.find(m => m.id === newScreening.movieId);
      const hall = halls.find(h => h.id === newScreening.hallId);
      
      if (!movie || !hall) {
        alert('Ошибка: фильм или зал не найден');
        return;
      }

      if (hasTimeConflict(newScreening.hallId, newScreening.startTime, newScreening.date, movie.duration)) {
        alert('Невозможно добавить сеанс: время пересекается с существующим сеансом');
        return;
      }

      const screening: Omit<Screening, 'id'> = {
        movieId: movie.id,
        hallId: hall.id,
        startTime: newScreening.startTime,
        date: newScreening.date,
        duration: movie.duration
      };

      onScreeningAdded(screening);
      setIsAddScreeningPopupOpen(false);
      setNewScreening({ 
        hallId: '', 
        movieId: '', 
        startTime: '10:00', 
        date: new Date().toISOString().split('T')[0] 
      });
      setHasUnsavedChanges(true);
    }
  };

  const handleDeleteScreening = (screening: Screening, e: React.MouseEvent) => {
    e.stopPropagation();
    setScreeningToDelete(screening);
    setIsDeleteScreeningPopupOpen(true);
  };

  const confirmDeleteScreening = (e: React.FormEvent) => {
    e.preventDefault();
    if (screeningToDelete && onScreeningDeleted) {
      onScreeningDeleted(screeningToDelete.id);
      setIsDeleteScreeningPopupOpen(false);
      setScreeningToDelete(null);
      setHasUnsavedChanges(true);
    }
  };

  // Обработчики отмены
  const cancelAddMovie = () => {
    setIsAddMoviePopupOpen(false);
    setNewMovie({ 
      title: '', 
      duration: '', 
      synopsis: '', 
      origin: '',
      posterUrl: ''
    });
  };

  const cancelAddScreening = () => {
    setIsAddScreeningPopupOpen(false);
    setNewScreening({ 
      hallId: '', 
      movieId: '', 
      startTime: '10:00', 
      date: new Date().toISOString().split('T')[0] 
    });
  };

  const cancelDeleteScreening = () => {
    setIsDeleteScreeningPopupOpen(false);
    setScreeningToDelete(null);
  };

  // Обработчики сохранения и отмены
  const handleSave = () => {
    console.log('Сохранение всех изменений сетки сеансов');
    setHasUnsavedChanges(false);
    alert('Все изменения успешно сохранены!');
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm(
        'У вас есть несохраненные изменения. Вы уверены, что хотите отменить?'
      );
      if (!confirmCancel) return;
    }
    
    setHasUnsavedChanges(false);
    console.log('Отмена изменений');
  };

  // Вспомогательные функции
  const getTimePosition = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours * 60 + minutes) * 0.5;
  };

  const getMovieTitle = (movieId: string): string => {
    return movies.find(m => m.id === movieId)?.title || 'Неизвестный фильм';
  };

  const getHallName = (hallId: string): string => {
    return halls.find(h => h.id === hallId)?.name || 'Неизвестный зал';
  };

  return (
    <ConfigSection
      title={`Сетка сеансов${hasUnsavedChanges ? ' *' : ''}`}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <p className="conf-step__paragraph">
        <ConfigButton
          variant="accent"
          onClick={() => setIsAddMoviePopupOpen(true)}
        >
          Добавить фильм
        </ConfigButton>
      </p>

      {/* Попап добавления фильма */}
      <Popup
        isOpen={isAddMoviePopupOpen}
        onClose={cancelAddMovie}
        title="Добавление фильма"
      >
        <form onSubmit={handleAddMovie}>
          <div className="popup__container">
            <div className="popup__poster">
              <div className="poster-upload">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePosterSelect}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                {newMovie.posterUrl ? (
                  <div className="poster-preview">
                    <img 
                      src={newMovie.posterUrl} 
                      alt="Preview" 
                      className="poster-preview-image"
                    />
                    <button
                      type="button"
                      className="poster-remove"
                      onClick={removePoster}
                      title="Удалить постер"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="poster-placeholder">
                    <span>🎬</span>
                    <p>Постер не загружен</p>
                    <p className="poster-hint">Нажмите "Загрузить постер"</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="popup__form">
              <FormField
                label="Название фильма"
                name="title"
                type="text"
                placeholder="Например, «Гражданин Кейн»"
                value={newMovie.title}
                onChange={(e) => setNewMovie(prev => ({ ...prev, title: e.target.value }))}
                required
              />
              <FormField
                label="Продолжительность фильма (мин.)"
                name="duration"
                type="number"
                placeholder="120"
                value={newMovie.duration}
                onChange={(e) => setNewMovie(prev => ({ ...prev, duration: e.target.value }))}
                min="1"
                required
              />
              <FormField
                label="Описание фильма"
                name="synopsis"
                type="textarea"
                placeholder="Краткое описание сюжета..."
                value={newMovie.synopsis}
                onChange={(e) => setNewMovie(prev => ({ ...prev, synopsis: e.target.value }))}
                rows={4}
                required
              />
              <FormField
                label="Страна производства"
                name="origin"
                type="text"
                placeholder="Например, США, Франция, Россия"
                value={newMovie.origin}
                onChange={(e) => setNewMovie(prev => ({ ...prev, origin: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div className="conf-step__buttons text-center">
            <ConfigButton
              variant="accent"
              type="submit"
              disabled={isUploading}
            >
              {isUploading ? 'Добавление...' : 'Добавить фильм'}
            </ConfigButton>
            <ConfigButton
              variant="accent"
              type="button"
              onClick={handleUploadPosterClick}
              disabled={isPosterUploading}
            >
              {isPosterUploading ? 'Загрузка...' : 'Загрузить постер'}
            </ConfigButton>
            <ConfigButton
              variant="regular"
              onClick={cancelAddMovie}
              type="button"
              disabled={isUploading || isPosterUploading}
            >
              Отменить
            </ConfigButton>
          </div>
        </form>
      </Popup>      

      {/* Попап удаления фильма */}
      <Popup
        isOpen={isDeleteMoviePopupOpen}
        onClose={cancelDeleteMovie}
        title="Удаление фильма"
      >
        <DeleteForm
          message="Вы действительно хотите удалить фильм"
          itemName={movieToDelete?.title || ''}
          onSubmit={confirmDeleteMovie}
          onCancel={cancelDeleteMovie}
          submitText="Удалить"
        />
      </Popup>

      {/* Попап добавления сеанса */}
      <Popup
        isOpen={isAddScreeningPopupOpen}
        onClose={cancelAddScreening}
        title="Добавление сеанса"
      >
        <form onSubmit={handleAddScreening}>
          <FormField
            label="Зал"
            name="hallId"
            type="select"
            value={newScreening.hallId}
            onChange={(e) => setNewScreening(prev => ({ ...prev, hallId: e.target.value }))}
            options={[
              { value: '', label: 'Выберите зал' },
              ...halls.map(hall => ({ value: hall.id, label: hall.name }))
            ]}
            required
          />
          <FormField
            label="Фильм"
            name="movieId"
            type="select"
            value={newScreening.movieId}
            onChange={(e) => setNewScreening(prev => ({ ...prev, movieId: e.target.value }))}
            options={[
              { value: '', label: 'Выберите фильм' },
              ...movies.map(movie => ({ value: movie.id, label: movie.title }))
            ]}
            required
          />
          <FormField
            label="Дата сеанса"
            name="date"
            type="date"
            value={newScreening.date}
            onChange={(e) => setNewScreening(prev => ({ ...prev, date: e.target.value }))}
            required
          />
          <FormField
            label="Время начала"
            name="startTime"
            type="time"
            value={newScreening.startTime}
            onChange={(e) => setNewScreening(prev => ({ ...prev, startTime: e.target.value }))}
            required
          />
          
          <div className="conf-step__buttons text-center">
            <ConfigButton
              variant="accent"
              type="submit"
            >
              Добавить сеанс
            </ConfigButton>
            <ConfigButton
              variant="regular"
              onClick={cancelAddScreening}
              type="button"
            >
              Отменить
            </ConfigButton>
          </div>
        </form>
      </Popup>

      {/* Попап удаления сеанса */}
      <Popup
        isOpen={isDeleteScreeningPopupOpen}
        onClose={cancelDeleteScreening}
        title="Снятие с сеанса"
      >
        <DeleteForm
          message="Вы действительно хотите снять с сеанса фильм"
          itemName={screeningToDelete ? getMovieTitle(screeningToDelete.movieId) : ''}
          onSubmit={confirmDeleteScreening}
          onCancel={cancelDeleteScreening}
          submitText="Удалить"
        />
      </Popup>

      {/* Список фильмов */}
      <div className="conf-step__movies">
        {movies.map(movie => (
          <div key={movie.id} className="conf-step__movie">
            <Poster
              src={movie.poster}
              alt={`Постер фильма ${movie.title}`}
            />
            <div className="conf-step__movie-info">
              <h3 className="conf-step__movie-title">{movie.title}</h3>
              <p className="conf-step__movie-duration">{movie.duration} минут</p>
              <p className="conf-step__movie-origin">{movie.origin}</p>
            </div>
            <ConfigButton
              variant="trash"
              onClick={() => handleDeleteMovie(movie)}
              title="Удалить фильм"
              className="conf-step__movie-delete"
            />
          </div>
        ))}
        
        {movies.length === 0 && (
          <p className="conf-step__paragraph" style={{ color: '#848484', fontStyle: 'italic' }}>
            Пока нет добавленных фильмов. Нажмите "Добавить фильм" чтобы добавить первый фильм.
          </p>
        )}
        
        <p className="conf-step__paragraph">
          <ConfigButton
            variant="accent"
            onClick={() => setIsAddScreeningPopupOpen(true)}
          >
            Добавить сеанс
          </ConfigButton>
        </p>
      </div>

      {/* Расписание сеансов */}
      <div className="conf-step__seances">
        {halls.map(hall => (
          <div key={hall.id} className="conf-step__seances-hall">
            <h3 className="conf-step__seances-title">{hall.name}</h3>
            <div className="conf-step__seances-timeline">
              {screenings
                .filter(screening => screening.hallId === hall.id)
                .map(screening => {
                  const movie = movies.find(m => m.id === screening.movieId);
                  return (
                    <div
                      key={screening.id}
                      className="conf-step__seances-movie"
                      style={{
                        width: `${screening.duration}px`,
                        backgroundColor: `hsl(${Math.random() * 360}, 70%, 80%)`,
                        left: `${getTimePosition(screening.startTime)}px`
                      }}
                    >
                      <p className="conf-step__seances-movie-title">
                        {movie?.title || 'Неизвестный фильм'}
                      </p>
                      <p className="conf-step__seances-movie-start">{screening.startTime}</p>
                      
                      <ConfigButton 
                        variant="trash"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleDeleteScreening(screening, e);
                        }}
                        title="Удалить сеанс"
                        className="trash-seance-button"
                      />
                    </div>
                  );
                })
              }
              
              {screenings.filter(s => s.hallId === hall.id).length === 0 && (
                <div className="conf-step__seances-empty">
                  Нет сеансов в этом зале
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Кнопки сохранения и отмены */}
      <fieldset className="conf-step__buttons text-center">
        <ConfigButton 
          variant="regular" 
          onClick={handleCancel}
          disabled={!hasUnsavedChanges}
        >
          Отмена
        </ConfigButton>
        <ConfigButton 
          variant="accent" 
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
        >
          Сохранить
        </ConfigButton>
      </fieldset>
    </ConfigSection>
  );
};