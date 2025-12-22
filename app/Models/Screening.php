<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Screening extends Model
{
    protected $fillable = [
        'movie_id',
        'hall_id',
        'date',
        'start_time',
        'duration',
        'booked_seats',
    ];

    // Автоматическая конвертация booked_seats между JSON и массивом
    protected $casts = [
        'booked_seats' => 'array',
        'date'         => 'date',
        'start_time'   => 'datetime:H:i',
    ];

    /**
     * Фильм, к которому относится сеанс
     */
    public function movie()
    {
        return $this->belongsTo(Movie::class);
    }

    /**
     * Зал, в котором проходит сеанс
     */
    public function hall()
    {
        return $this->belongsTo(Hall::class, 'hall_id');
    }
}