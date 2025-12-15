// Типы мест
export type SeatType = 'standard' | 'vip' | 'disabled' | 'taken';

export interface Seat {
  type: SeatType;
  row: number;
  number: number;
  price?: number;
}

// Навигация
export interface Day {
  date: Date;
  day: string;
  number: string;
  today: boolean;
  chosen: boolean;
  weekend: boolean;
  next?: boolean;
  prev?: boolean;
}

// Адаптированные для клиента интерфейсы
export interface ClientHall {
  id: string;
  name: string;
  times: string[];
  screeningIds: string[];
  seats?: Seat[][];
}

export interface ClientMovie {
  id: string;
  title: string;
  poster: string;
  synopsis: string;
  duration: string;
  origin: string;
  halls: ClientHall[];
}

// Бронирование и билеты
export interface BookingData {
  id: string;
  movieTitle: string;
  startTime: string;
  date: string;
  hallName: string;
  seats: string[];
  selectedSeats: string[];
  totalPrice: number;
  bookingTime: string;
  bookingCode: string;
  qrCodeUrl?: string;
}


export interface Ticket {
  id: string;
  movieTitle: string;
  hallName: string;
  startTime: string;
  date: string; // ← ДОБАВИТЬ
  seats: string[];
  totalPrice: number;
  qrCode?: string;
  qrCodeUrl?: string;
  bookingTime: string;
  bookingCode: string;
  bookingId?: string;
  expiresAt?: string;
  status?: 'active' | 'used' | 'cancelled';
}

// Контекст и пропсы
export interface CinemaState {
  selectedDate: Date;
  movies: ClientMovie[];
  setSelectedDate: (date: Date) => void;
  setMovies: (movies: ClientMovie[]) => void;
}

export interface MovieCardProps {
  movie: ClientMovie;
}

export interface HallScheduleProps {
  hall: ClientHall;
  movieTitle: string;
}

export interface TicketLayoutProps {
  type: 'payment' | 'ticket';
  movieTitle: string;
  seats: string;
  hall: string;
  startTime: string;
  cost?: number;
  qrCode?: string;
  qrCodeUrl?: string;
  bookingCode?: string;
  onGetTicket?: () => void;
  isButtonDisabled?: boolean;
}