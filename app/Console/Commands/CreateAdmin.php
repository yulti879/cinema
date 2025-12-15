<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class CreateAdmin extends Command
{
    protected $signature = 'admin:create
                            {email : Email администратора}
                            {password : Пароль администратора}';

    protected $description = 'Создаёт администратора с указанным email и паролем';

    public function handle(): int
    {
        $email = $this->argument('email');
        $password = $this->argument('password');

        if (User::where('email', $email)->exists()) {
            $this->error("Пользователь с email {$email} уже существует.");
            return self::FAILURE;
        }

        $user = User::create([
            'name' => 'Admin',
            'email' => $email,
            'password' => $password,
            'role' => User::ROLE_ADMIN,
        ]);

        $this->info("Администратор создан: {$user->email}");
        return self::SUCCESS;
    }
}