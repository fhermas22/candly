<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

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

    /**
     * Public photo URL (safe to expose).
     */
    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path ? Storage::url($this->photo_path) : null;
    }

    /**
     * CV URL is time-limited to prevent direct enumeration and uncontrolled sharing.
     *
     * Unlike photos (public), CVs are private by nature and must only be served via signed temporary URLs.
     */
    public function getCvUrlAttribute(): ?string
    {
        if (! $this->cv_path) {
            return null;
        }

        // CVs are private: we expose them via a short-lived signed URL to prevent direct access and sharing.
        return URL::temporarySignedRoute(
            name: 'profiles.cv',
            expiration: now()->addMinutes(15),
            parameters: ['profile' => $this->id],
        );
    }
}

