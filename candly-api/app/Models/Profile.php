<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Profile extends Model
{
    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'bio',
        'photo_path',
        'cv_path',
    ];

    /**
     * The owning user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

