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
            'user_id' => $this->resource->user_id,
            'job_id' => $this->resource->job_id,
            'status' => $this->resource->status,
            'moderated_by' => $this->resource->moderated_by,
            'applied_at' => $this->resource->applied_at?->format('Y-m-d H:i'),
            'deleted_at' => $this->resource->deleted_at?->format('Y-m-d H:i'),
            'created_at' => $this->resource->created_at?->format('Y-m-d H:i'),
            'updated_at' => $this->resource->updated_at?->format('Y-m-d H:i'),
        ];
    }
}

