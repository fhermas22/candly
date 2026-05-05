<?php

declare(strict_types=1);

namespace App\Exceptions;

use RuntimeException;

class DuplicateApplicationException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('An active application already exists for this job.', 0);
    }
}

