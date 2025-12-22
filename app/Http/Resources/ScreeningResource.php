<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScreeningResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'movieId' => $this->movie_id,
            'hallId' => $this->hall_id,
            'date' => $this->date,
            'startTime' => $this->start_time,
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
