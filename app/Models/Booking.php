<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'screening_id',
        'seats',
        'total_price',
        'booking_code',
    ];

    protected $casts = [
        'seats' => 'array',
    ];

    public function screening()
    {
        return $this->belongsTo(Screening::class);
    }
}