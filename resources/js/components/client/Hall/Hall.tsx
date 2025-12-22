import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Seat, Screening } from '../../../types/client';
import { convertAdminHallToClient } from '../../../utils/convertTypes';
import './Hall.css';

export const Hall: React.FC = () => {
  const { screeningId } = useParams<{ screeningId: string }>();
  const navigate = useNavigate();

  const [hallLayout, setHallLayout] = useState<Seat[][]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [screening, setScreening] = useState<Screening | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Цены мест
  const seatPrices = { standard: 250, vip: 350 };

  useEffect(() => {
    const fetchData = async () => {
      if (!screeningId) {
        setError('ID сеанса не указан');
        return;
      }

      try {
        setIsLoading(true);

        // 1. Загружаем сеанс
        const screeningRes = await fetch(`/api/screenings/${screeningId}`);
        if (!screeningRes.ok) throw new Error('Сеанс не найден');

        const screeningData: Screening = await screeningRes.json();
        setScreening(screeningData);
        setBookedSeats(screeningData.bookedSeats || []);

        // 2. Загружаем зал
        const hallRes = await fetch(`/api/halls/${screeningData.hallId}`);
        if (!hallRes.ok) throw new Error('Зал не найден');

        const adminHall = await hallRes.json();

        // 3. Конвертируем зал в клиентский формат
        const clientHall = convertAdminHallToClient(
          adminHall,
          screeningData.bookedSeats || []
        );

        setHallLayout(clientHall.layout);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [screeningId]);

  // Клик по месту
  const handleSeatClick = (rowIndex: number, seatIndex: number, seatType: Seat['type']) => {
    if (seatType === 'taken') return;

    const seat: Seat = {
      type: seatType,
      row: rowIndex + 1,
      seat: seatIndex + 1
    };

    const seatId = `${seat.row}-${seat.seat}`;
    const isAlreadySelected = selectedSeats.some(s => `${s.row}-${s.seat}` === seatId);

    if (isAlreadySelected) {
      setSelectedSeats(prev => prev.filter(s => `${s.row}-${s.seat}` !== seatId));
    } else {
      if (selectedSeats.length >= 6) {
        alert('Можно выбрать не более 6 мест');
        return;
      }
      setSelectedSeats(prev => [...prev, seat]);
    }
  };

  const getSeatDisplayType = (rowIndex: number, seatIndex: number, baseType: Seat['type']): Seat['type'] => {
    const seatId = `${rowIndex + 1}-${seatIndex + 1}`;
    if (bookedSeats.includes(seatId) || baseType === 'taken') return 'taken';
    if (selectedSeats.some(s => `${s.row}-${s.seat}` === seatId)) return 'selected';
    return baseType;
  };

  const handleBooking = () => {
    if (!screening) {
      alert('Данные сеанса не загружены');
      return;
    }
    if (selectedSeats.length === 0) {
      alert('Выберите хотя бы одно место');
      return;
    }

    navigate('/payment', {
      state: {
        screeningId,
        movieTitle: screening.movie?.title || 'Фильм',
        startTime: screening.startTime,
        hallName: screening.hall?.name || 'Зал',
        date: screening.date,
        seats: selectedSeats,
        totalSeats: selectedSeats.length
      }
    });
  };

  if (error) {
    return (
      <main>
        <section className="buying">
          <div className="error-message">{error}</div>
        </section>
      </main>
    );
  }

  if (isLoading || !screening) {
    return (
      <main>
        <section className="buying">
          <div className="loading">Загрузка...</div>
        </section>
      </main>
    );
  }

  // Форматируем начало сеанса в HH:MM
  const startTime = new Date(screening.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <main>
      <section className="buying">
        <div className="buying__info">
          <div className="buying__info-description">
            <h2 className="buying__info-title">{screening.movie?.title || 'Фильм'}</h2>
            <p className="buying__info-start">Начало сеанса: {startTime}</p>
            <p className="buying__info-hall">{screening.hall?.name || 'Зал'}</p>
          </div>
          <div className="buying__info-hint">
            <p>Тапните дважды,<br/>чтобы увеличить</p>
          </div>
        </div>

        <div className="buying-scheme">
          <div className="buying-scheme__wrapper">
            {hallLayout.map((row, rowIndex) => (
              <div key={rowIndex} className="buying-scheme__row">
                {row.map((seat, seatIndex) => {
                  const displayType = getSeatDisplayType(rowIndex, seatIndex, seat.type);
                  return (
                    <span
                      key={seatIndex}
                      className={`buying-scheme__chair buying-scheme__chair_${displayType}`}
                      onClick={() => handleSeatClick(rowIndex, seatIndex, seat.type)}
                      title={`Ряд ${rowIndex + 1}, Место ${seatIndex + 1}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div className="buying-scheme__legend">
            <div className="col">
              <p className="buying-scheme__legend-price">
                <span className="buying-scheme__chair buying-scheme__chair_standard"></span>
                Свободно (<span className="buying-scheme__legend-value">{seatPrices.standard}</span>руб)
              </p>
              <p className="buying-scheme__legend-price">
                <span className="buying-scheme__chair buying-scheme__chair_vip"></span>
                Свободно VIP (<span className="buying-scheme__legend-value">{seatPrices.vip}</span>руб)
              </p>
            </div>
            <div className="col">
              <p className="buying-scheme__legend-price">
                <span className="buying-scheme__chair buying-scheme__chair_taken"></span> Занято
              </p>
              <p className="buying-scheme__legend-price">
                <span className="buying-scheme__chair buying-scheme__chair_selected"></span> Выбрано
              </p>
            </div>
          </div>
        </div>

        <button 
          className="accept-button" 
          onClick={handleBooking}
          disabled={selectedSeats.length === 0}
        >
          {`Забронировать (${selectedSeats.length})`}
        </button>
      </section>
    </main>
  );
};