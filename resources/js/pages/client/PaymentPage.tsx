import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { BookingData, Ticket } from '../../types/client';
import { ClientLayout } from '../../components/client/ClientLayout';
import { ClientHeader } from '../../components/client/ClientHeader/ClientHeader';
import { TicketLayout } from '../../components/client/TicketLayout/TicketLayout';

export const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const bookingData = location.state as BookingData | null;

  if (
    !bookingData ||
    !Array.isArray(bookingData.seats) ||
    bookingData.seats.length === 0
  ) {
    return (
      <ClientLayout>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Данные бронирования не найдены</h2>
          <button onClick={() => navigate('/')}>Вернуться на главную</button>
        </div>
      </ClientLayout>
    );
  }

  const handleGetTicket = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screening_id: bookingData.id,
          seats: bookingData.seats,
          total_price: bookingData.totalPrice
        })
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Ошибка бронирования');
        return;
      }

      const ticket = {
        ...bookingData,
        qrCodeUrl: data.qr_code_url,
        bookingCode: data.booking_code
      };

      navigate('/ticket', { state: ticket });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ClientLayout>
      <ClientHeader />
      <TicketLayout
        type="payment"
        movieTitle={bookingData.movieTitle}
        seats={bookingData.seats}
        hall={bookingData.hallName}
        startTime={bookingData.startTime}
        date={bookingData.date}
        cost={bookingData.totalPrice}
        onGetTicket={handleGetTicket}
        isButtonDisabled={isLoading}
      />
    </ClientLayout>
  );
};