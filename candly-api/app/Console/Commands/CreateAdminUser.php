<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Command
{
    /*
     * The name and signature of the console command.
     */
    protected $signature = 'candly:create-admin-user {email : Admin email} {password : Admin password} {--status=1 : 1=true, 0=false}';

    /**
     * The console command description.
     */
    protected $description = 'Create an admin user (role=admin) in the Candly API database.';

    public function handle(): int
    {
        $email = (string) $this->argument('email');
        $password = (string) $this->argument('password');
        $statusInput = (string) $this->option('status');

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email address.');
            return self::FAILURE;
        }

        $status = match (strtolower($statusInput)) {
            '1', 'true', 'yes' => true,
            '0', 'false', 'no' => false,
            default => null,
        };

        if ($status === null) {
            $this->error('Invalid --status value. Use 1/0 (or true/false).');
            return self::FAILURE;
        }

        /** @var User|null $existing */
        $existing = User::query()->where('email', $email)->first();

        if ($existing) {
            $this->warn('A user with this email already exists.');

            // Update existing user to admin + new password.
            $existing->fill([
                'role' => 'admin',
                'status' => $status,
                'password' => Hash::make($password),
            ])->save();

            $this->info('Existing user updated to admin.');
            return self::SUCCESS;
        }

        User::query()->create([
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'admin',
            'status' => $status,
        ]);

        $this->info('Admin user created successfully.');
        return self::SUCCESS;
    }
}

