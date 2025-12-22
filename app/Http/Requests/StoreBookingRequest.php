<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'screening_id' => 'required|integer|exists:screenings,id',
            'seats' => 'required|array|min:1',
            'seats.*' => [
                'required',
                'string',
                'regex:/^\d+-\d+$/', // строки вида "ряд-место", например "4-6"
            ],
            'total_price' => 'required|numeric|min:0',
        ];
    }

    public function messages()
    {
        return [
            'seats.*.regex' => 'Каждое место должно быть в формате "ряд-номер", например "4-6".',
        ];
    }
}