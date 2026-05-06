<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @property-read \App\Models\User $resource
 */
class UserResource extends JsonResource
{
    /**
     * Map the User model to a stable API shape.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $profile = $this->resource->profile;

        $photoUrl = null;
        if ($profile?->photo_path) {
            $path = $profile->photo_path;
            $photoUrl = str_starts_with($path, 'http://') || str_starts_with($path, 'https://')
                ? $path
                : rtrim((string) config('app.url'), '/').Storage::url($path);
        }

        return [
            'id' => $this->resource->id,
            'email' => $this->resource->email,
            'role' => $this->resource->role,
            'status' => (bool) $this->resource->status,
            'profile' => $profile ? [
                'id' => $profile->id,
                'first_name' => $profile->first_name,
                'last_name' => $profile->last_name,
                'bio' => $profile->bio,
                'photo_path' => $profile->photo_path,
                'photo_url' => $photoUrl,
                'cv_path' => $profile->cv_path,
                'created_at' => $profile->created_at?->format('Y-m-d H:i'),
                'updated_at' => $profile->updated_at?->format('Y-m-d H:i'),
            ] : null,
            'created_at' => $this->resource->created_at?->format('Y-m-d H:i'),
            'updated_at' => $this->resource->updated_at?->format('Y-m-d H:i'),
        ];
    }
}

