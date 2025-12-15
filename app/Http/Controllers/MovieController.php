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
        $data = $request->validate([
            'title'    => ['required', 'string', 'max:255'],
            'poster'   => ['nullable', 'string'],
            'synopsis' => ['required', 'string'],
            'duration' => ['required', 'integer', 'min:1'],
            'origin'   => ['required', 'string'],
        ]);

        $movie = Movie::create([
            'title'      => $data['title'],
            'poster_url' => $data['poster'] ?? null,
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