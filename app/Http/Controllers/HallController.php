<?php

namespace App\Http\Controllers;

use App\Models\Hall;
use App\Http\Resources\HallResource;
use Illuminate\Http\Request;

class HallController extends Controller
{
    /**
     * Список залов
     */
    public function index()
    {
        return HallResource::collection(
            Hall::orderBy('name')->get()
        );
    }

    /**
     * Создание зала (админ)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'          => ['required', 'string', 'max:255', 'unique:halls,name'],
            'rows'          => ['required', 'integer', 'min:1'],
            'seatsPerRow'   => ['required', 'integer', 'min:1'],
            'standardPrice' => ['required', 'integer', 'min:0'],
            'vipPrice'      => ['required', 'integer', 'min:0'],
            'layout'        => ['nullable', 'array'],
        ]);

        $hall = Hall::create([
            'name'           => $data['name'],
            'rows'           => $data['rows'],
            'seats_per_row'  => $data['seatsPerRow'],
            'standard_price' => $data['standardPrice'],
            'vip_price'      => $data['vipPrice'],
            'layout'         => $data['layout'] ?? null,
        ]);

        return new HallResource($hall);
    }

    /**
     * Обновление зала
     */
    public function update(Request $request, $id)
    {
        $hall = Hall::findOrFail($id);

        $data = $request->validate([
            'name'          => ['sometimes', 'string', 'max:255', "unique:halls,name,{$hall->id}"],
            'rows'          => ['sometimes', 'integer', 'min:1'],
            'seatsPerRow'   => ['sometimes', 'integer', 'min:1'],
            'standardPrice' => ['sometimes', 'integer', 'min:0'],
            'vipPrice'      => ['sometimes', 'integer', 'min:0'],
            'layout'        => ['nullable', 'array'],
        ]);

        $hall->update([
            'name'           => $data['name'] ?? $hall->name,
            'rows'           => $data['rows'] ?? $hall->rows,
            'seats_per_row'  => $data['seatsPerRow'] ?? $hall->seats_per_row,
            'standard_price' => $data['standardPrice'] ?? $hall->standard_price,
            'vip_price'      => $data['vipPrice'] ?? $hall->vip_price,
            'layout'         => $data['layout'] ?? $hall->layout,
        ]);

        return new HallResource($hall);
    }

    /**
     * Удаление зала
     */
    public function destroy($id)
    {
        Hall::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Hall deleted',
        ]);
    }
}