<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        using: function () {
            // API маршруты
            Route::middleware('api')
                ->prefix('api')
                ->group(function () {
                    // ПУБЛИЧНЫЕ маршруты (без аутентификации)
                    Route::post('/login', [AuthController::class, 'login']);
                    
                    // ЗАЩИЩЕННЫЕ маршруты (требуют аутентификации)
                    Route::middleware('auth:sanctum')->group(function () {
                        Route::post('/logout', [AuthController::class, 'logout']);
                        Route::get('/me', [AuthController::class, 'me']);
                        
                        // Тестовый маршрут
                        Route::get('/test', function () {
                            return response()->json(['message' => 'API работает!']);
                        });
                    });
                });

            // Web маршруты (для React SPA)
            Route::middleware('web')
                ->group(function () {
                    Route::get('/', function () {
                        return view('app'); // Ваш React SPA
                    });
                    
                    // Fallback для SPA
                    Route::get('/{any}', function () {
                        return view('app');
                    })->where('any', '.*');
                });
        },
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // КРИТИЧЕСКИ ВАЖНО: CorsMiddleware должен быть ПЕРВЫМ
        $middleware->append(\App\Http\Middleware\CorsMiddleware::class);
        
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();