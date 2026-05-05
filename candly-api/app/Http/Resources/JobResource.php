<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read \App\Models\JobAdvertisement $resource
 */
class JobResource extends JsonResource
{
    /**
     * Map the JobAdvertisement model to a stable API shape.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'admin_id' => $this->resource->admin_id,
            'title' => $this->resource->title,
            'location' => $this->resource->location,
            'description' => $this->resource->description,
            'salary_range' => $this->resource->salary_range,
            'status' => $this->resource->status,
            'created_at' => $this->resource->created_at?->format('Y-m-d H:i'),
            'updated_at' => $this->resource->updated_at?->format('Y-m-d H:i'),
        ];
    }
}

