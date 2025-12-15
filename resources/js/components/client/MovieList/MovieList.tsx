import { useCinema } from '../../../context/CinemaContext';
import { MovieCard } from '../MovieCard/MovieCard';

export const MovieList: React.FC = () => {
  const { movies, selectedDate, loading, error } = useCinema();

  // Фильтруем фильмы, у которых есть сеансы на выбранную дату
  const moviesWithScreenings = movies.filter(movie =>
    movie.halls.some(hall => hall.times.length > 0)
  );

  if (loading) {
    return (
      <div className="loading-message">
        <div className="loading-spinner"></div>
        <p>Загрузка расписания...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <h3>Не удалось загрузить фильмы</h3>
        <p>{error}</p>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Обновить страницу
        </button>
      </div>
    );
  }

  return (
    <main>
      {moviesWithScreenings.map(movie => (
        <MovieCard
          key={movie.id}
          movie={movie}          
        />
      ))}

      {moviesWithScreenings.length === 0 && !loading && (
        <div className="no-movies-message">
          <h3>На {selectedDate.toLocaleDateString('ru-RU')} сеансов нет</h3>
          <p>Выберите другую дату или проверьте расписание позже</p>
        </div>
      )}
    </main>
  );
};