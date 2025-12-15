<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hall extends Model
{
    protected $fillable = [
        'name',
        'rows',
        'seats_per_row',
        'standard_price',
        'vip_price',
        'layout',
    ];

    protected $casts = [
        'layout' => 'array',
    ];

    /**
     * Получаем все сеансы, связанные с залом.
     */
    public function screenings()
    {
        return $this->hasMany(Screening::class, 'cinema_hall_id');
    }
}