<?php

declare(strict_types=1);

namespace App\Exceptions;

use RuntimeException;

class JobClosedException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('This job is closed and cannot receive applications.', 0);
    }
}

