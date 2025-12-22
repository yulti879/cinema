// ========== БАЗОВЫЕ ТИПЫ ==========

export type SeatType = 'standard' | 'vip' | 'taken' | 'selected';

// ========== ОСНОВНЫЕ СУЩНОСТИ ==========

export interface Booking {
  id: string;
  screeningId: string;
  code: string;                 // Уникальный код брони
  customerEmail?: string;
  seats: Seat[];                // Выбранные места
  totalPrice: number;
  expiresAt: string;           // Время истечения брони???????
  isConfirmed: boolean;
  createdAt: string;
}

export interface Hall {
  id: string;
  name: string;
  rows: number;
  seatsPerRow: number;
  layout: Seat[][];
  totalSeats: number;
}

export interface Movie {
  id: string;
  title: string;
  posterUrl?: string;
  synopsis: string;
  duration: number;      // в минутах
  origin: string;
}

export interface Screening {
  id: string;
  movieId: string;
  hallId: string;
  date: string;         // "YYYY-MM-DD"
  startTime: string;   // "HH:MM"
  bookedSeats?: string[]; // ["1-1", "1-2"]
  movie?: Movie;
  hall?: Hall;
}

export interface ApiMovie {
  id: number;
  title: string;
  posterUrl?: string;
  synopsis: string;
  duration: number;
  origin: string;
}

export interface ApiScreening {
  id: number;
  movieId: number;
  hallId: number;
  date: string;
  startTime: string;
  hall?: {
    id: number;
    name: string;
  };
}

// ========== ТИПЫ ДЛЯ КОМПОНЕНТОВ ==========

export interface ClientMovie {
  id: string;
  title: string;
  posterUrl?: string;
  synopsis: string;
  duration: number;
  origin: string;
  halls: HallSchedule[];
}

export interface Day {
  date: Date;
  day: string;
  number: number;
  today: boolean;
  chosen: boolean;
  weekend: boolean;
}

export interface HallSchedule {
  id: string;
  name: string;
  times: string[];          // ["10:20", "14:10"]
  screeningIds: string[];
}

export interface Seat {
  type: SeatType;
  row: number;
  seat: number;
  price?: number;
}

// ========== ТИПЫ ДЛЯ СТРАНИЦ ==========

export interface PaymentData {
  screeningId: string;
  movieTitle: string;
  startTime: string;
  hallName: string;
  date: string;
  seats: Seat[];
  totalSeats: number;
  totalPrice?: number;
}

export interface TicketData {
  bookingCode: string;
  movieTitle: string;
  startTime: string;
  hallName: string;
  date: string;
  seats: string[]; // ["Ряд 1, Место 3", "Ряд 1, Место 4"]
  totalPrice: number;
  qrCodeUrl?: string;
}