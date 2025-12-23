<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class ScreeningResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        // безопасный парсинг даты и времени
        $dateTime = null;
        try {
            $dateTime = Carbon::parse("{$this->date} {$this->start_time}");
        } catch (\Exception $e) {
            $dateTime = now()->addDay(); // если ошибка — считаем будущее
        }

        return [
            'id' => $this->id,
            'movieId' => $this->movie_id,
            'hallId' => $this->hall_id,
            'date' => $this->date,
            'startTime' => $this->start_time,
            'isPast' => $dateTime->isPast(),
            'bookedSeats' => $this->booked_seats ?? [],

            'movie' => $this->whenLoaded('movie', function () {
                return [
                    'id' => $this->movie->id,
                    'title' => $this->movie->title,
                    'duration' => $this->movie->duration,
                ];
            }),

            'hall' => $this->whenLoaded('hall', function () {
                return [
                    'id' => $this->hall->id,
                    'name' => $this->hall->name,
                ];
            }),
        ];
    }
}