<?php

namespace App\Http\Controllers;

use App\Models\Screening;
use App\Http\Resources\ScreeningResource;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ScreeningController extends Controller
{
    /**
     * Список всех сеансов
     */
    public function index()
    {
        $screenings = Screening::with(['movie', 'hall'])
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        return ScreeningResource::collection($screenings);
    }

    /**
     * Один сеанс
     */
    public function show($id)
    {
        $screening = Screening::with(['movie', 'hall'])
            ->findOrFail($id);

        return new ScreeningResource($screening);
    }

    /**
     * Создание сеанса (админка)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'movieId' => ['required', 'exists:movies,id'],
            'hallId'  => ['required', 'exists:halls,id'],
            'date'    => ['required', 'date'],
            'startTime' => ['required', 'date_format:H:i'],
        ]);

        $startDateTime = Carbon::parse("{$data['date']} {$data['startTime']}");

        // Нельзя создавать сеанс в прошлом
        if ($startDateTime->isPast()) {
            return response()->json([
                'message' => 'Нельзя создать сеанс в прошлом',
            ], 422);
        }

        $screening = Screening::create([
            'movie_id'       => $data['movieId'],
            'cinema_hall_id' => $data['hallId'],
            'date'           => $data['date'],
            'start_time'     => $data['startTime'],
        ]);

        return new ScreeningResource(
            $screening->load(['movie', 'hall'])
        );
    }

    /**
     * Удаление сеанса
     */
    public function destroy($id)
    {
        $screening = Screening::findOrFail($id);
        $screening->delete();

        return response()->json([
            'message' => 'Screening deleted',
        ]);
    }
}