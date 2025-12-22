<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Screening;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'screening_id' => 'required|exists:screenings,id',
            'seats'        => 'required|array|min:1',
        ]);

        $screening = Screening::with('hall')->findOrFail($data['screeningId']);

        // Проверка занятости мест
        $bookedSeats = $screening->booked_seats ?? [];
        foreach ($data['seats'] as $seat) {
            if (in_array($seat, $bookedSeats)) {
                return response()->json([
                    'error' => "Seat row {$seat['row']} seat {$seat['seat']} is already booked"
                ], 422);
            }
        }

        // Расчёт total_price на сервере
        $totalPrice = 0;
        foreach ($data['seats'] as $seat) {
            $totalPrice += $seat['type'] === 'vip'
                ? $screening->hall->vip_price
                : $screening->hall->standard_price;
        }

        // Генерация уникального кода бронирования
        $bookingCode = strtoupper('BK'.Str::random(6));

        // Создание бронирования
        $booking = Booking::create([
            'screening_id' => $screening->id,
            'seats' => $data['seats'],
            'total_price' => $totalPrice,
            'booking_code' => $bookingCode,
        ]);

        // Обновляем booked_seats в Screening
        $screening->booked_seats = array_merge($bookedSeats, $data['seats']);
        $screening->save();

        return response()->json([
            'booking_code' => $bookingCode,
            'qr_code_url' => route('bookings.qr', $bookingCode)
        ]);
    }
}