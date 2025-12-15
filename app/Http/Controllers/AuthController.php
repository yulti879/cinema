<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Логин и выдача токена
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Неверный email или пароль',
            ], 422);
        }

        // Создаём персональный токен Sanctum
        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Логаут (удаление токена)
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {            
            $user->tokens()->delete();
        }

        return response()->json(['message' => 'Logged out']);
    }

    /**
     * Текущий пользователь
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
