<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HallController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\ScreeningController;

// ВСЁ через web middleware (сессии, куки, CSRF)
Route::middleware('web')->group(function () {
    // React SPA - главная страница
    Route::get('/', function () {
        return view('app');
    })->name('home');

    // API маршруты - тоже через web для сессий
    Route::prefix('api')->group(function () {
        // Публичные API
        Route::post('/login', [AuthController::class, 'login']);

        // Защищённые API (требуют аутентификации)
        Route::middleware('auth')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);

            // Тестовый маршрут
            Route::get('/test', function () {
                return response()->json([
                    'message' => 'API работает!',
                    'user' => Auth::user()
                ]);
            });

            // Залы
            Route::get('/halls', [HallController::class, 'index']);
            Route::post('/halls', [HallController::class, 'store']);
            Route::delete('/halls/{id}', [HallController::class, 'destroy']);

            // Фильмы
            Route::get('/movies', [MovieController::class, 'index']);
            Route::post('/movies', [MovieController::class, 'store']);
            Route::delete('/movies/{id}', [MovieController::class, 'destroy']);

            // Сеансы
            Route::get('/screenings', [ScreeningController::class, 'index']);
            Route::post('/screenings', [ScreeningController::class, 'store']);
            Route::delete('/screenings/{id}', [ScreeningController::class, 'destroy']);
        });
    });

    Route::get('/{any}', function () {
        return view('app');
    })->where('any', '.*');
});