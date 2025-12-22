<?php

namespace App\Http\Controllers;

use App\Models\Screening;
use App\Http\Resources\ScreeningResource;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ScreeningController extends Controller
{
    /**
     * Список сеансов
     */
    public function index(Request $request)
    {
        $query = Screening::with(['movie', 'hall']);

        if ($request->has('date')) {
            $query->where('date', $request->date);
        } else {
            $query->where('date', '>=', now()->format('Y-m-d'));
        }

        $screenings = $query
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
        $screening = Screening::with(['movie', 'hall'])->findOrFail($id);

        return new ScreeningResource($screening);
    }

    /**
     * Создание сеанса
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'movie_id'   => ['required', 'exists:movies,id'],
            'hall_id'    => ['required', 'exists:halls,id'],
            'date'       => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
        ]);

        $startDateTime = Carbon::parse(
            "{$data['date']} {$data['start_time']}"
        );

        if ($startDateTime->isPast()) {
            return response()->json([
                'message' => 'Нельзя создать сеанс в прошлом',
            ], 422);
        }

        $screening = Screening::create([
            'movie_id'   => $data['movie_id'],
            'hall_id'    => $data['hall_id'],
            'date'       => $data['date'],
            'start_time' => $data['start_time'],
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

        return response()->json(['message' => 'Сеанс удалён'], 200);
    }
}