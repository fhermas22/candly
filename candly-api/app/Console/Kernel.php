<?php

declare(strict_types=1);

namespace App\Console;

use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command list.
     *
     * @var array<int, class-string>
     */
    protected $commands = [
        Commands\CreateAdminUser::class,
    ];
}

