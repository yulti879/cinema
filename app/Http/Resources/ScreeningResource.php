<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScreeningResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'date'      => $this->date,
            'startTime' => $this->start_time,

            'movie' => [
                'id'       => $this->movie->id,
                'title'    => $this->movie->title,
                'duration' => $this->movie->duration,
            ],

            'hall' => [
                'id'   => $this->hall->id,
                'name' => $this->hall->name,
            ],
        ];
    }
}