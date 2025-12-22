<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HallResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'rows' => $this->rows,
            'seatsPerRow' => $this->seats_per_row,
            'standardPrice' => $this->standard_price ?? 0,
            'vipPrice' => $this->vip_price ?? 0,
            'layout' => $this->layout ?? [],
            'totalSeats' => $this->rows * $this->seats_per_row,
            'isActive' => $this->is_active ?? true,
            'screeningsCount' => $this->whenLoaded('screenings', function () {
                return $this->screenings->count();
            }),
            'canBeDeleted' => $this->when($request->user()?->isAdmin(), function () {
                return $this->canBeDeleted();
            }),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
