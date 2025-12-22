<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use App\Http\Resources\MovieResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;


class MovieController extends Controller
{
    /**
     * Получить список всех фильмов
     */
    public function index()
    {
        return MovieResource::collection(
            Movie::orderBy('title')->get()
        );
    }

    /**
     * Создать новый фильм
     */
    // app/Http/Controllers/MovieController.php
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'    => ['required', 'string', 'max:255', 'unique:movies,title'],
            'poster'   => ['nullable', 'file', 'mimes:png', 'max:5120'],
            'synopsis' => ['required', 'string'],
            'duration' => ['required', 'integer'],
            'origin'   => ['required', 'string'],
        ]);

        $posterPath = null;
        if ($request->hasFile('poster')) {
            $path = $request->file('poster')->store('posters', 'public');
            $posterPath = Storage::url($path);
        }

        $movie = Movie::create([
            'title'      => $data['title'],
            'poster_url' => $posterPath,
            'synopsis'   => $data['synopsis'],
            'duration'   => $data['duration'],
            'origin'     => $data['origin'],
        ]);

        // Возвращаем MovieResource
        return new MovieResource($movie);
    }

    /**
     * Получить информацию о фильме
     */
    public function show($id)
    {
        $movie = Movie::findOrFail($id);
        return new MovieResource($movie);
    }

    /**
     * Обновить информацию о фильме
     */
    public function update(Request $request, $id)
    {
        $movie = Movie::findOrFail($id);

        // Валидация с учетом исключения текущего фильма
        $data = $request->validate([
            'title'    => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('movies')->ignore($movie->id)
            ],
            'poster'   => ['nullable', 'file', 'mimes:png', 'max:2048'],
            'synopsis' => ['sometimes', 'string'],
            'duration' => ['sometimes', 'integer'],
            'origin'   => ['sometimes', 'string'],
        ]);

        // Обработка постера (если загружен новый)
        if ($request->hasFile('poster')) {
            // Удаляем старый постер, если он существует
            if ($movie->poster_url) {
                $oldPath = str_replace('/storage/', '', $movie->poster_url);
                Storage::disk('public')->delete($oldPath);
            }

            $file = $request->file('poster');
            $extension = $file->extension();
            $filename = 'poster_' . time() . '_' . Str::random(10) . '.' . $extension;

            $path = $file->storeAs('posters', $filename, 'public');
            $data['poster_url'] = Storage::url($path);
        }

        // Обновляем фильм
        $movie->update($data);

        return new MovieResource($movie);
    }

    /**
     * Удалить фильм
     */
    public function destroy($id)
{
    $movie = Movie::findOrFail($id);

    // Удаляем файл постера, если он существует
    if ($movie->poster_url) {
        $path = str_replace('/storage/', '', $movie->poster_url);
        Storage::disk('public')->delete($path);
    }

    $movie->delete();

    // Возвращаем 200 и пустой объект, чтобы Axios точно не ругался
    return response()->json(['message' => 'Фильм успешно удален'], 200);
}
}
