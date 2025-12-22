// resources/js/types/shared.ts

/**
 * Пользователь системы
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'guest';
  created_at?: string;
  updated_at?: string;
}

/**
 * Ответ API с пагинацией
 */
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

/**
 * Ошибка API
 */
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

/**
 * Состояние загрузки
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Успешный ответ API
 */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}