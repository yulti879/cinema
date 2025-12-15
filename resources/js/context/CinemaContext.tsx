import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ClientMovie, ClientHall } from '../types/client';

interface CinemaContextType {
  movies: ClientMovie[];
  selectedDate: Date;
  loading: boolean;
  error: string | null;
  setSelectedDate: (date: Date) => void;
}

const CinemaContext = createContext<CinemaContextType | null>(null);

export const CinemaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movies, setMovies] = useState<ClientMovie[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);

      const [moviesRes, hallsRes, screeningsRes] = await Promise.all([
        fetch('/api/movies'),
        fetch('/api/halls'),
        fetch('/api/screenings'),
      ]);

      if (!moviesRes.ok || !hallsRes.ok || !screeningsRes.ok) {
        throw new Error('Ошибка загрузки API');
      }

      const moviesData = await moviesRes.json();
      const hallsData = await hallsRes.json();
      const screeningsData = await screeningsRes.json();

      // Создаем карты фильмов и залов
      const moviesMap: ClientMovie[] = moviesData.map((m: any) => ({
        id: m.id.toString(),
        title: m.title,
        poster: m.poster_url,
        synopsis: m.synopsis,
        duration: m.duration.toString(),
        origin: m.origin,
        halls: [],
      }));

      const hallsMap = new Map<string, ClientHall>(
        hallsData.map((h: any) => [
          String(h.id),
          { id: String(h.id), name: String(h.name) } // теперь TS не ругается
        ])
      );

      // Формируем дату для фильтрации сеансов в формате YYYY-MM-DD
      const dateString = selectedDate.toLocaleDateString('en-CA'); 

      screeningsData.forEach((s: any) => {
        if (s.date !== dateString) return;

        const movie = moviesMap.find((m) => m.id === String(s.movie_id));
        if (!movie) return;

        let hall = movie.halls.find((h) => h.id === String(s.cinema_hall_id));
        if (!hall) {
          const hallBase = hallsMap.get(String(s.cinema_hall_id));
          if (!hallBase) return;

          hall = {
            id: hallBase.id,
            name: hallBase.name,
            times: [],
            screeningIds: [],
          };
          movie.halls.push(hall);
        }

        hall.times.push(s.start_time.slice(0, 5));
        hall.screeningIds.push(String(s.id));
      });

      setMovies(moviesMap);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  return (
    <CinemaContext.Provider
      value={{
        movies,
        selectedDate,
        loading,
        error,
        setSelectedDate,
      }}
    >
      {children}
    </CinemaContext.Provider>
  );
};

export const useCinema = () => {
  const ctx = useContext(CinemaContext);
  if (!ctx) throw new Error('CinemaContext must be used inside provider');
  return ctx;
};