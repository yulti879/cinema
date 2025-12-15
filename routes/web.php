<?php

use Illuminate\Support\Facades\Route;

// SPA root
Route::middleware('web')->group(function () {
    Route::view('/', 'app');

    // SPA fallback
    Route::get('/{any}', function () {
        return view('app');
    })->where('any', '.*');
});