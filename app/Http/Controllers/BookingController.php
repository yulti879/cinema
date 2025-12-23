<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Screening;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;

class BookingController extends Controller
{
    public function store(Request $request)
    {

        $data = $request->validate([
            'screening_id' => 'required|exists:screenings,id',
            'seats'        => 'required|array|min:1',
            'seats.*.row'  => 'required|integer|min:1',
            'seats.*.seat' => 'required|integer|min:1',
            'seats.*.type' => 'required|in:standard,vip',
            'email'        => 'nullable|email',
        ]);

        $screening = Screening::with('hall')->findOrFail($data['screening_id']);

        $screeningDateTime = Carbon::parse(
            $screening->date . ' ' . $screening->start_time
        );

        if ($screeningDateTime->isPast()) {
            return response()->json([
                'message' => 'Этот сеанс уже завершён. Бронирование невозможно.'
            ], 422);
        }

        $bookedSeats = $screening->booked_seats ?? [];

        foreach ($data['seats'] as $seat) {
            $seatKey = "{$seat['row']}-{$seat['seat']}";

            if (in_array($seatKey, $bookedSeats, true)) {
                return response()->json([
                    'error' => "Место {$seatKey} уже забронировано"
                ], 422);
            }
        }

        $totalPrice = 0;
        foreach ($data['seats'] as $seat) {
            $totalPrice += $seat['type'] === 'vip'
                ? $screening->hall->vip_price
                : $screening->hall->standard_price;
        }

        $bookingCode = 'BK' . strtoupper(Str::random(6));

        $booking = Booking::create([
            'screening_id' => $screening->id,
            'seats' => $data['seats'],
            'total_price' => $totalPrice,
            'booking_code' => $bookingCode,
            'email' => $data['email'] ?? null,
        ]);

        $newBookedSeats = array_map(
            fn($seat) => "{$seat['row']}-{$seat['seat']}",
            $data['seats']
        );

        $screening->booked_seats = array_merge($bookedSeats, $newBookedSeats);
        $screening->save();

        return response()->json([
            'booking_code' => $bookingCode,
            'qr_code_url' => route('bookings.qr', $bookingCode),
        ], 201);
    }

    public function qr(string $code)
    {
        return response()->json([
            'booking_code' => $code,
            'message' => 'QR will be here'
        ]);
    }
}
