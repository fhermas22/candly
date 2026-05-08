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
    protected $signature = 'candly:create-admin-user {email : Admin email} {--status=1 : 1=true, 0=false} {--password= : Admin password (use only for testing)} {--password-stdin : Read password from stdin}';

    /**
     * The console command description.
     */
    protected $description = 'Create an admin user (role=admin) in the Candly API database. Password is read from a hidden prompt, stdin, or CANDLY_ADMIN_PASSWORD.';

    public function handle(): int
    {
        $email = (string) $this->argument('email');
        $password = $this->resolvePassword();
        $statusInput = (string) $this->option('status');

        if ($password === null) {
            return self::FAILURE;
        }

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

    private function resolvePassword(): ?string
    {
        $password = $this->option('password');
        $passwordStdin = (bool) $this->option('password-stdin');

        if ($password !== null && $passwordStdin) {
            $this->error('Cannot use --password and --password-stdin together.');
            return null;
        }

        if ($password === null) {
            $password = getenv('CANDLY_ADMIN_PASSWORD') ?: null;
        }

        if ($password === null) {
            if ($passwordStdin) {
                $password = $this->readPasswordFromStdin();
            } elseif ($this->input->isInteractive()) {
                $password = $this->secret('Admin password');
            }
        }

        $password = trim((string) $password);

        if ($password === '') {
            $this->error('Admin password is required.');
            return null;
        }

        return $password;
    }

    private function readPasswordFromStdin(): string
    {
        $stdin = fopen('php://stdin', 'r');

        if ($stdin === false) {
            return '';
        }

        $password = '';

        while (! feof($stdin)) {
            $line = fgets($stdin);
            if ($line === false) {
                break;
            }

            $password .= $line;
            break;
        }

        fclose($stdin);

        return trim($password);
    }
}

