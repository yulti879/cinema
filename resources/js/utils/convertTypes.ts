import type { AdminSeat, AdminHall, AdminSeatType } from '../types/admin';
import type { Seat, SeatType, Hall } from '../types/client';

/**
 * Конвертирует тип места из админки в клиентский
 */
export const convertSeatType = (adminType: AdminSeatType, isBooked: boolean = false): SeatType => {
  if (isBooked || adminType === 'disabled') {
    return 'taken';
  }
  return adminType; // 'standard' или 'vip'
};

/**
 * Конвертирует место из админского формата в клиентский
 */
export const convertAdminSeatToClient = (
  adminSeat: AdminSeat, 
  isBooked: boolean = false,
  price?: number
): Seat => {
  return {
    type: convertSeatType(adminSeat.type, isBooked),
    row: adminSeat.row,
    number: adminSeat.seat,
    price
  };
};

/**
 * Конвертирует весь зал из админского формата в клиентский
 */
export const convertAdminHallToClient = (
  adminHall: AdminHall, 
  bookedSeats: string[] = []
): Hall => {
  const layout: Seat[][] = adminHall.layout.map((rowSeats, rowIndex) =>
    rowSeats.map((seat, seatIndex) => {
      const seatId = `${rowIndex + 1}-${seatIndex + 1}`;
      const isBooked = bookedSeats.includes(seatId);
      
      // Определяем цену места
      const price = seat.type === 'vip' 
        ? adminHall.vipPrice || 0 
        : adminHall.standardPrice || 0;
      
      return convertAdminSeatToClient(seat, isBooked, price);
    })
  );
  
  return {
    id: adminHall.id,
    name: adminHall.name,
    rows: adminHall.rows,
    seatsPerRow: adminHall.seatsPerRow,
    layout,
    totalSeats: adminHall.rows * adminHall.seatsPerRow
  };
};

/**
 * Конвертирует место из клиентского формата в админский
 */
export const convertClientSeatToAdmin = (clientSeat: Seat): AdminSeat => {
  // В клиентской части 'taken' и 'selected' - это состояния,
  // в админке они переводятся в 'standard' или 'vip'
  let type: AdminSeatType = 'standard';
  if (clientSeat.type === 'vip') type = 'vip';
  else if (clientSeat.type === 'taken') type = 'standard'; // или 'disabled' по логике
  
  return {
    row: clientSeat.row,
    seat: clientSeat.number,
    type,
    is_active: clientSeat.type !== 'taken'
  };
};