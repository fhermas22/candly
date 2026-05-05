<?php

declare(strict_types=1);

namespace App\Exceptions;

use RuntimeException;

class InvalidStatusException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('Invalid status. Allowed values: accepted, rejected.', 0);
    }
}

