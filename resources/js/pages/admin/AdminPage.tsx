import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout/AdminLayout';
import { AdminHeader } from '../../components/admin/AdminHeader/AdminHeader';
import { HallManagement } from '../../components/admin/HallManagement/HallManagement';
import { HallConfiguration } from '../../components/admin/HallConfiguration/HallConfiguration';
import { PriceConfiguration } from '../../components/admin/PriceConfiguration/PriceConfiguration';
import { ScheduleManagement } from '../../components/admin/ScheduleManagement/ScheduleManagement';
import { SalesControl } from '../../components/admin/SalesControl/SalesControl';
import { useAccordeon } from '../../hooks/useAccordeon';
import axios from 'axios';
import './AdminPage.css';
import { CinemaHall, Movie, Screening, HallConfigData } from '../../types';

axios.defaults.baseURL = 'http://127.0.0.1:8000';
axios.defaults.withCredentials = true;

// Хелпер для безопасного преобразования данных в массив
const safeArray = (data: any, endpointName: string = ''): any[] => {
  console.log(`safeArray for ${endpointName}:`, {
    data,
    type: typeof data,
    isArray: Array.isArray(data)
  });
  
  if (Array.isArray(data)) return data;
  
  if (typeof data === 'string') {
    console.warn(`Endpoint ${endpointName} returned string instead of array:`, data);
    return [];
  }
  
  if (typeof data === 'object' && data !== null) {
    // Попробуем найти массив в общих свойствах
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.movies)) return data.movies;
    if (Array.isArray(data.halls)) return data.halls;
    if (Array.isArray(data.screenings)) return data.screenings;
    if (Array.isArray(data.results)) return data.results;
    
    // Если это объект с полем "success" и "data"
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
  }
  
  console.warn(`Endpoint ${endpointName} returned unexpected data:`, typeof data, data);
  return [];
};

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [halls, setHalls] = useState<CinemaHall[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [screenings, setScreenings] = useState<Screening[]>([]);

  const [loadingHalls, setLoadingHalls] = useState(false);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingScreenings, setLoadingScreenings] = useState(false);

  const { openSections, toggleSection } = useAccordeon({
    hallManagement: true,
    hallConfiguration: false,
    priceConfiguration: false,
    scheduleManagement: false,
    salesControl: false
  });

  // -----------------------
  // Проверка авторизации
  // -----------------------
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking auth...');
        const res = await axios.get('/api/me');
        console.log('Auth response:', res.data);
        if (res.data.role === 'admin') {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // -----------------------
  // Login / Logout
  // -----------------------
  const handleLogin = async (email: string, password: string) => {
    console.log('Logging in...');
    await axios.get('/sanctum/csrf-cookie');
    const res = await axios.post('/api/login', { email, password });
    console.log('Login response:', res.data);
    if (res.data.role === 'admin') {
      setIsAuthenticated(true);
    } else {
      throw new Error('Неверный email или пароль');
    }
  };

  const handleLogout = async () => {
    await axios.post('/api/logout');
    setIsAuthenticated(false);
    setHalls([]);
    setMovies([]);
    setScreenings([]);
  };

  // -----------------------
  // Загрузка данных
  // -----------------------
  const loadHalls = async () => {
    setLoadingHalls(true);
    try {
      console.log('Loading halls...');
      const res = await axios.get('/api/halls');
      console.log('Halls API response:', res.data);
      const normalizedHalls = safeArray(res.data, 'halls');
      console.log('Normalized halls:', normalizedHalls);
      setHalls(normalizedHalls);
    } catch (err) {
      console.error('Ошибка загрузки залов', err);
      alert('Не удалось загрузить список залов');
      setHalls([]);
    } finally {
      setLoadingHalls(false);
    }
  };

  const loadMovies = async () => {
    setLoadingMovies(true);
    try {
      console.log('Loading movies...');
      const res = await axios.get('/api/movies');
      console.log('Movies API response:', {
        data: res.data,
        type: typeof res.data,
        isArray: Array.isArray(res.data),
        status: res.status,
        headers: res.headers
      });
      
      const normalizedMovies = safeArray(res.data, 'movies');
      console.log('Normalized movies:', normalizedMovies);
      setMovies(normalizedMovies);
    } catch (err) {
      console.error('Ошибка загрузки фильмов', err);
      alert('Не удалось загрузить список фильмов');
      setMovies([]);
    } finally {
      setLoadingMovies(false);
    }
  };

  const loadScreenings = async () => {
    setLoadingScreenings(true);
    try {
      console.log('Loading screenings...');
      const res = await axios.get('/api/screenings');
      console.log('Screenings API response:', res.data);
      const normalizedScreenings = safeArray(res.data, 'screenings');
      console.log('Normalized screenings:', normalizedScreenings);
      setScreenings(normalizedScreenings);
    } catch (err) {
      console.error('Ошибка загрузки сеансов', err);
      alert('Не удалось загрузить список сеансов');
      setScreenings([]);
    } finally {
      setLoadingScreenings(false);
    }
  };

  // Логирование изменений состояний
  useEffect(() => {
    console.log('Movies state updated:', {
      movies,
      length: movies.length,
      type: typeof movies,
      isArray: Array.isArray(movies),
      firstItem: movies[0]
    });
  }, [movies]);

  useEffect(() => {
    console.log('Halls state updated:', {
      halls,
      length: halls.length,
      type: typeof halls,
      isArray: Array.isArray(halls),
      firstItem: halls[0]
    });
  }, [halls]);

  useEffect(() => {
    console.log('Screenings state updated:', {
      screenings,
      length: screenings.length,
      type: typeof screenings,
      isArray: Array.isArray(screenings),
      firstItem: screenings[0]
    });
  }, [screenings]);

  // Загрузка данных при авторизации
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated, loading data...');
      loadHalls();
      loadMovies();
      loadScreenings();
      
      // Временный мок для тестирования, если API не работает
      setTimeout(() => {
        if (movies.length === 0) {
          console.log('No movies loaded, adding mock data for testing');
          const mockMovies = [
            {
              id: '1',
              title: 'Тестовый фильм',
              poster: '/images/posters/default.jpg',
              synopsis: 'Описание тестового фильма',
              duration: 120,
              origin: 'Россия'
            },
            {
              id: '2', 
              title: 'Другой фильм',
              poster: '/images/posters/default.jpg',
              synopsis: 'Еще одно описание',
              duration: 90,
              origin: 'США'
            }
          ];
          setMovies(mockMovies);
        }
      }, 1000);
    } else {
      console.log('User not authenticated');
    }
  }, [isAuthenticated]);

  // -----------------------
  // UI при загрузке
  // -----------------------
  if (isLoading) return <AdminLayout><div className="loading">Загрузка...</div></AdminLayout>;
  if (!isAuthenticated) return <LoginForm onLogin={handleLogin} />;

  return (
    <AdminLayout>
      <AdminHeader onLogout={handleLogout} />

      <main className="conf-steps">
        <HallManagement
          isOpen={openSections.hallManagement}
          onToggle={() => toggleSection('hallManagement')}
          halls={halls}
          onHallCreated={loadHalls}
          onHallDeleted={loadHalls}
        />

        <HallConfiguration
          isOpen={openSections.hallConfiguration}
          onToggle={() => toggleSection('hallConfiguration')}
          halls={halls}
          onConfigurationSaved={loadHalls}
        />

        <PriceConfiguration
          isOpen={openSections.priceConfiguration}
          onToggle={() => toggleSection('priceConfiguration')}
          halls={halls}
          onPricesSaved={loadHalls}
        />

        <ScheduleManagement
          isOpen={openSections.scheduleManagement}
          onToggle={() => toggleSection('scheduleManagement')}
          halls={halls}
          movies={movies}
          screenings={screenings}
          onMovieAdded={loadMovies}
          onMovieDeleted={loadMovies}
          onScreeningAdded={loadScreenings}
          onScreeningDeleted={loadScreenings}
        />

        <SalesControl
          isOpen={openSections.salesControl}
          onToggle={() => toggleSection('salesControl')}
          onSalesToggle={(open) => alert(`Продажи ${open ? 'открыты' : 'приостановлены'}`)}
        />
      </main>
    </AdminLayout>
  );
};

// -----------------------
// Login Form
// -----------------------
interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onLogin(email, password);
    } catch {
      setError('Неверный email или пароль');
    }
  };

  return (
    <div className="admin-login">
      <header className="page-header">
        <h1 className="page-header__title">Идём<span>в</span>кино</h1>
        <span className="page-header__subtitle">Администраторррская</span>
      </header>

      <main>
        <section className="login">
          <header className="login__header">
            <h2 className="login__title">Авторизация</h2>
          </header>
          <div className="login__wrapper">
            <form className="login__form" onSubmit={handleSubmit}>
              <label className="login__label" htmlFor="email">
                E-mail
                <input
                  className="login__input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </label>
              <label className="login__label" htmlFor="password">
                Пароль
                <input
                  className="login__input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </label>
              {error && <div className="login__error">{error}</div>}
              <div className="text-center">
                <button type="submit" className="login__button">Авторизоваться</button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};