<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Screening extends Model
{
    protected $fillable = [
        'movie_id',
        'cinema_hall_id',
        'date',
        'start_time',
        'duration',
        'booked_seats', // хранится как JSON
    ];

    // Автоматическая конвертация booked_seats между JSON и массивом
    protected $casts = [
        'booked_seats' => 'array',
        'date'         => 'date',
        'start_time'   => 'datetime:H:i', // можно настроить формат по необходимости
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
        return $this->belongsTo(Hall::class, 'cinema_hall_id');
    }
}