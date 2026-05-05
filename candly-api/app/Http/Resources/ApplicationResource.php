<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read \App\Models\Application $resource
 */
class ApplicationResource extends JsonResource
{
    /**
     * Map the Application model to a stable API shape.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'job_title' => $this->resource->jobAdvertisement?->title,
            'status' => $this->resource->status,
            'applied_at' => $this->resource->applied_at?->format('Y-m-d H:i'),
            'moderator_name' => $this->resource->moderatedBy?->profile
                ? trim($this->resource->moderatedBy->profile->first_name.' '.$this->resource->moderatedBy->profile->last_name)
                : null,
        ];
    }
}

