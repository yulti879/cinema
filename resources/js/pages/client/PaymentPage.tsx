import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Payment, Ticket } from '../../types/client';
import { ClientLayout } from '../../components/client/ClientLayout';
import { ClientHeader } from '../../components/client/ClientHeader/ClientHeader';
import { TicketLayout } from '../../components/client/TicketLayout/TicketLayout';

export const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState('');

  const paymentData = location.state as Payment | null;

  if (!paymentData || paymentData.seats.length === 0) {
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
      const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content');

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken ?? '',
        },
        body: JSON.stringify({
          screening_id: paymentData.screeningId,
          seats: paymentData.seats,
          email: email || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || data.error || 'Ошибка бронирования');
        return;
      }

      const ticket: Ticket = {
        bookingCode: data.booking_code,
        movieTitle: paymentData.movieTitle,
        startTime: paymentData.startTime,
        hallName: paymentData.hallName,
        date: paymentData.date,
        seats: paymentData.seats.map(
          s => `Ряд ${s.row}, Место ${s.seat}`
        ),
        totalPrice: paymentData.totalPrice,
        qrCodeUrl: data.qr_code_url,
      };

      navigate('/ticket', { state: ticket });
    } catch (err) {
      alert(`Ошибка бронирования: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ClientLayout>
      <ClientHeader />
      <div className='email_input'>
        <label>
          Email (необязательно):
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="example@mail.com"
            style={{ width: '100%', marginTop: 8 }}
          />
        </label>
      </div>
      <TicketLayout
        type="payment"
        movieTitle={paymentData.movieTitle}
        seats={paymentData.seats.map(
          s => `Ряд ${s.row}, Место ${s.seat}`
        )}
        hall={paymentData.hallName}
        startTime={paymentData.startTime}
        date={paymentData.date}
        cost={paymentData.totalPrice}
        onGetTicket={handleGetTicket}
        isButtonDisabled={isLoading}
      />
    </ClientLayout>
  );
};