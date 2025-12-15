import { useLocation, useNavigate } from 'react-router-dom';
import type { Ticket } from '../../types/client';
import { ClientLayout } from '../../components/client/ClientLayout';
import { ClientHeader } from '../../components/client/ClientHeader/ClientHeader';
import { TicketLayout } from '../../components/client/TicketLayout/TicketLayout';

export const TicketPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const ticket = location.state as Ticket | null;

  if (
    !ticket ||
    !Array.isArray(ticket.seats) ||
    ticket.seats.length === 0
  ) {
    return (
      <ClientLayout>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Билет не найден</h2>
          <button onClick={() => navigate('/')}>Вернуться на главную</button>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <ClientHeader />
      <TicketLayout
        type="ticket"
        movieTitle={ticket.movieTitle}
        seats={ticket.seats} // массив строк
        hall={ticket.hallName}
        startTime={ticket.startTime}
        date={ticket.date}
        cost={ticket.totalPrice}
        qrCodeUrl={ticket.qrCodeUrl}
        bookingCode={ticket.bookingCode}
      />
    </ClientLayout>
  );
};