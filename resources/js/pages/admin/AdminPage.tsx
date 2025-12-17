import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { AdminLayout } from '../../components/admin/AdminLayout/AdminLayout';
import { AdminHeader } from '../../components/admin/AdminHeader/AdminHeader';
import { HallManagement } from '../../components/admin/HallManagement/HallManagement';
import { HallConfiguration } from '../../components/admin/HallConfiguration/HallConfiguration';
import { LoginForm } from '../../components/admin/LoginForm/LoginForm';
import { PriceConfiguration } from '../../components/admin/PriceConfiguration/PriceConfiguration';
import { ScheduleManagement } from '../../components/admin/ScheduleManagement/ScheduleManagement';
import { SalesControl } from '../../components/admin/SalesControl/SalesControl';

import { useAccordeon } from '../../hooks/useAccordeon';
import { CinemaHall, Movie, Screening } from '../../types';

import './AdminPage.css';

axios.defaults.baseURL = 'http://127.0.0.1:8000';
axios.defaults.withCredentials = true;

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [halls, setHalls] = useState<CinemaHall[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [screenings, setScreenings] = useState<Screening[]>([]);

  const { openSections, toggleSection } = useAccordeon({
    hallManagement: true,
    hallConfiguration: false,
    priceConfiguration: false,
    scheduleManagement: false,
    salesControl: false,
  });

  // -----------------------
  // Проверка авторизации
  // -----------------------
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('/api/me');
        setIsAuthenticated(res.data?.role === 'admin');
      } catch {
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
    try {
      await axios.get('/sanctum/csrf-cookie');
      const res = await axios.post('/api/login', { email, password });

      if (res.data?.role === 'admin') {
        setIsAuthenticated(true);
        setError('');
      } else {
        setError('Неверный логин или пароль');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка авторизации');
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
    try {
      const res = await axios.get('/api/halls');
      setHalls(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
    } catch {
      alert('Не удалось загрузить список залов');
      setHalls([]);
    }
  };

  const loadMovies = async () => {
    try {
      const res = await axios.get('/api/movies');
      setMovies(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
    } catch {
      alert('Не удалось загрузить список фильмов');
      setMovies([]);
    }
  };

  const loadScreenings = async () => {
    try {
      const res = await axios.get('/api/screenings');
      setScreenings(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
    } catch {
      alert('Не удалось загрузить список сеансов');
      setScreenings([]);
    }
  };

  // -----------------------
  // Колбэки для HallManagement
  // -----------------------
  const handleHallCreated = (hall: CinemaHall) => {
    setHalls(prev => [...prev, hall]);
  };

  const handleHallDeleted = (hallId: string) => {
    setHalls(prev => prev.filter(hall => hall.id !== hallId));
  };

  // -----------------------
  // Загрузка данных при логине
  // -----------------------
  useEffect(() => {
    if (!isAuthenticated) return;

    loadHalls();
    loadMovies();
    loadScreenings();
  }, [isAuthenticated]);

  // -----------------------
  // UI состояния
  // -----------------------
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="loading">Загрузка…</div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLayout>
        <AdminHeader />
        <LoginForm onLogin={handleLogin} error={error} />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <AdminHeader onLogout={handleLogout} />

      <main className="conf-steps">
        <HallManagement
          isOpen={openSections.hallManagement}
          onToggle={() => toggleSection('hallManagement')}
          halls={halls}
          onHallCreated={handleHallCreated}
          onHallDeleted={handleHallDeleted}
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
          onSalesToggle={open => alert(`Продажи ${open ? 'открыты' : 'приостановлены'}`)}
        />
      </main>
    </AdminLayout>
  );
};