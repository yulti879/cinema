// resources/js/components/client/Hall/Hall.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Seat, SeatType, HallLayoutRow, BookingData } from '../../../types';
import { useSeatSelection } from '../../../hooks/useSeatSelection';
import { useSeatCalculations } from '../../../hooks/useSeatCalculations';
import './Hall.css';

interface HallProps {
  movieTitle?: string;
  startTime?: string;
  hallName?: string;
  screeningId?: string;
  date?: string;
}

export const Hall: React.FC<HallProps> = ({
  movieTitle,
  startTime,
  hallName,
  screeningId: propScreeningId,
  date
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [hallLayout, setHallLayout] = useState<HallLayoutRow[] | null>(null);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [standardPrice, setStandardPrice] = useState(250);
  const [vipPrice, setVipPrice] = useState(350);

  const { selectedSeats, handleSeatClick, getSelectedCount, isSeatSelected } = useSeatSelection(6);
  const { calculateTotalPrice, getSelectedSeatsInfo } = useSeatCalculations();

  const { movieTitle: stateMovieTitle, startTime: stateStartTime, hallName: stateHallName, screeningId: stateScreeningId, date: stateDate } = location.state || {};

  const finalScreeningId = propScreeningId || stateScreeningId;
  const finalMovieTitle = stateMovieTitle || movieTitle;
  const finalStartTime = stateStartTime || startTime;
  const finalHallName = stateHallName || hallName;
  const finalDate = stateDate || date;

  useEffect(() => {
    if (!finalScreeningId) return;
    setSeatsLoading(true);

    const loadData = async () => {
      try {
        const res = await fetch(`/api/screenings/${finalScreeningId}`);
        if (!res.ok) throw new Error('Ошибка загрузки сеанса');

        const screeningData = await res.json();
        const hall = screeningData.hall;
        if (!hall || !hall.layout) throw new Error('Схема зала не настроена');

        const sPrice = hall.standard_price && hall.standard_price > 0 ? hall.standard_price : 250;
        const vPrice = hall.vip_price && hall.vip_price > 0 ? hall.vip_price : 350;
        setStandardPrice(sPrice);
        setVipPrice(vPrice);

        const layout: HallLayoutRow[] = hall.layout.map((row: any[]) => ({
          types: row.map((seat: any) => {
            switch (seat.type) {
              case 'vip': return 'vip';
              case 'standard': return 'standard';
              case 'taken': return 'taken';
              default: return 'standard';
            }
          }) as SeatType[],
          prices: row.map((seat: any) => (seat.price && seat.price > 0 ? seat.price : seat.type === 'vip' ? vPrice : sPrice))
        }));

        setHallLayout(layout);
        setBookedSeats(screeningData.booked_seats || []);
      } catch (err) {
        console.error(err);
        alert('Ошибка загрузки данных зала или сеанса');
        setHallLayout(null);
        setBookedSeats([]);
      } finally {
        setSeatsLoading(false);
      }
    };

    loadData();
  }, [finalScreeningId]);

  const handleSchemeDoubleClick = () => setIsZoomed(prev => !prev);

  const getSeatType = (rowIndex: number, seatIndex: number, baseType: SeatType): SeatType => {
    const seatId = `${rowIndex + 1}-${seatIndex + 1}`;
    return bookedSeats.includes(seatId) ? 'taken' : baseType;
  };

  const seats: Seat[][] = useMemo(() => {
    if (!hallLayout) return [];

    return hallLayout.map((row, rowIndex) =>
      row.types.map((type, seatIndex) => {
        const seatType = getSeatType(rowIndex, seatIndex, type);
        const price = seatType === 'taken' || seatType === 'disabled' ? 0 : row.prices[seatIndex];
        return { type: seatType, row: rowIndex + 1, number: seatIndex + 1, price };
      })
    );
  }, [hallLayout, bookedSeats]);

  const handleBooking = async () => {
    if (!finalScreeningId || selectedSeats.length === 0 || !hallLayout) {
      alert('Ошибка: выберите место и убедитесь, что схема загружена');
      return;
    }

    setIsLoading(true);
    try {
      const totalPrice = calculateTotalPrice(seats, selectedSeats);

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screening_id: Number(finalScreeningId),
          seats: selectedSeats,
          total_price: totalPrice,
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Ошибка сервера: ${errorText}`);
      }

      const booking: BookingData = await res.json();

      navigate('/payment', { state: booking });
    } catch (err: any) {
      console.error('Ошибка бронирования:', err);
      alert(`Ошибка бронирования: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <section className="buying">
        <div className="buying__info">
          <div className="buying__info-description">
            <h2 className="buying__info-title">{finalMovieTitle}</h2>
            <p className="buying__info-start">Начало сеанса: {finalStartTime}</p>
            <p className="buying__info-hall">{finalHallName}</p>
          </div>
          <div className="buying__info-hint">
            <p>Тапните дважды,<br />чтобы увеличить</p>
          </div>
        </div>

        {!seatsLoading && seats.length > 0 && (
          <div className={`buying-scheme ${isZoomed ? 'buying-scheme--zoomed' : ''}`} onDoubleClick={handleSchemeDoubleClick}>
            <div className="buying-scheme__wrapper">
              {seats.map((row, rowIndex) => (
                <div key={rowIndex} className="buying-scheme__row">
                  <span className="buying-scheme__row-number">{rowIndex + 1}</span>
                  {row.map((seat, seatIndex) => {
                    const selected = isSeatSelected(rowIndex, seatIndex);
                    return (
                      <span
                        key={seatIndex}
                        className={`buying-scheme__chair buying-scheme__chair_${seat.type} ${selected ? 'buying-scheme__chair_selected' : ''}`}
                        onClick={() => handleSeatClick(rowIndex, seatIndex, seat.type)}
                        title={`Ряд ${rowIndex + 1}, Место ${seatIndex + 1} - ${seat.type}`}
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
                  Свободно (<span className="buying-scheme__legend-value">{standardPrice}</span>руб)
                </p>
                <p className="buying-scheme__legend-price">
                  <span className="buying-scheme__chair buying-scheme__chair_vip"></span>
                  Свободно VIP (<span className="buying-scheme__legend-value">{vipPrice}</span>руб)
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
        )}

        <button
          className="acceptin-button"
          onClick={handleBooking}
          disabled={selectedSeats.length === 0 || isLoading || seats.length === 0 || seatsLoading}
        >
          {isLoading ? 'Бронируем...' : `Забронировать (${getSelectedCount()})`}
        </button>
      </section>
    </main>
  );
};