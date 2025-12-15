<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MovieResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'       => $this->id,
            'title'    => $this->title,
            'poster'   => $this->poster_url,
            'synopsis' => $this->synopsis,
            'duration' => $this->duration,
            'origin'   => $this->origin,
        ];
    }
}