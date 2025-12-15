export type SeatType = 'disabled' | 'standard' | 'vip' | 'taken';

export interface Seat {
  type: SeatType;
  row: number;
  number: number;
  price: number;
}

// Общие данные о кинотеатре / зале
export interface CinemaHall {
  id: string;
  name: string;
  rows: number;
  seatsPerRow: number;
  layout?: Seat[][];
  standardPrice?: number;
  vipPrice?: number;
}

export interface HallLayoutRow {
  types: SeatType[];
  prices: number[];
}

// Фильмы и сеансы
export interface Movie {
  id: string;
  title: string;
  poster: string;
  synopsis: string;
  duration: number;
  origin: string;
}

export interface Screening {
  id: string;
  movieId: string;
  hallId: string;
  startTime: string; // "HH:MM"
  date: string;      // "YYYY-MM-DD"
  duration: number;
}

export interface PriceData {
  hallId: string;
  hallName: string;
  standardPrice: number;
  vipPrice: number;
  timestamp?: string;
}

// Ответ API на бронирование
export interface BookingQrResponse {
  booking_code: string;
  qr_code_url: string;
}

// Данные, которые отправляем на страницу оплаты
export interface BookingData {
  id: string;                   // screening id
  movieTitle?: string;
  startTime?: string;
  date?: string;
  hallName?: string;
  seats: string[];              // ["1-3", "1-4"]
  selectedSeats: Seat[];        // более детальные объекты с ценой
  totalPrice: number;
  bookingTime: string;          // дата бронирования
  bookingCode: string;
  qrCodeUrl: string;
}

// =====================
// API response types
// =====================

export interface CinemaHallResponse {
  id: number;
  name: string;
  rows: number;
  seats_per_row: number;
  standard_price: number;
  vip_price: number;
  layout?: Seat[][];
}

export interface MovieResponse {
  id: number;
  title: string;
  poster_url: string;
  synopsis: string;
  duration: number;
  origin: string;
}

export interface ScreeningResponse {
  id: number;
  movie_id: number;
  cinema_hall_id: number;
  start_time: string;
  date: string;
  duration?: number;
}

export interface HallConfigData {
  hallId: string;
  rows: number;
  seatsPerRow: number;
  seats: Seat[][];
}