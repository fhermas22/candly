<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class JobAdvertisement extends Model
{
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'admin_id',
        'title',
        'location',
        'description',
        'salary_range',
        'status',
    ];

    /**
     * Admin who created the job advertisement.
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Applications submitted for this job.
     */
    public function applications(): HasMany
    {
        return $this->hasMany(Application::class, 'job_id');
    }
}

