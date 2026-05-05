<?php

declare(strict_types=1);

namespace App\Exceptions;

use RuntimeException;

class ApplicationAlreadyModeratedEx extends RuntimeException
{
    public function __construct(string $message = 'This application has already been moderated and can no longer be withdrawn.')
    {
        parent::__construct($message, 0);
    }
}

