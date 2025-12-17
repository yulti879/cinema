<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use App\Http\Resources\MovieResource;
use Illuminate\Http\Request;

class MovieController extends Controller
{
    public function index()
    {
        return MovieResource::collection(
            Movie::orderBy('title')->get()
        );
    }

    public function store(Request $request)
    {
        // Валидация данных
        $data = $request->validate([
            'title'    => ['required', 'string', 'max:255'],
            'poster'   => ['nullable', 'file', 'mimes:png', 'max:2048'], // ограничение на PNG до 2 МБ
            'synopsis' => ['required', 'string'],
            'duration' => ['required', 'integer', 'min:1'],
            'origin'   => ['required', 'string'],
        ]);

        // Обработка файла постера
        $posterPath = null;
        if ($request->hasFile('poster')) {
            $file = $request->file('poster');

            // Генерация уникального имени файла
            $filename = uniqid('poster_', true) . '.png';

            // Перемещение файла в папку public/images/posters
            $file->move(public_path('images/posters'), $filename);

            $posterPath = '/images/posters/' . $filename;
        }

        // Создание фильма
        $movie = Movie::create([
            'title'      => $data['title'],
            'poster_url' => $posterPath, // если не загружен файл — null
            'synopsis'   => $data['synopsis'],
            'duration'   => $data['duration'],
            'origin'     => $data['origin'],
        ]);

        return new MovieResource($movie);
    }

    public function destroy($id)
    {
        Movie::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Movie deleted',
        ]);
    }
}
