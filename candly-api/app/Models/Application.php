<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Application extends Model
{
    use SoftDeletes;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'job_id',
        'status',
        'moderated_by',
        'applied_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'applied_at' => 'datetime',
    ];

    /**
     * Candidate who submitted the application.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Job advertisement this application targets.
     */
    public function job(): BelongsTo
    {
        return $this->belongsTo(JobAdvertisement::class, 'job_id');
    }

    /**
     * Alias for job() to keep API/repository naming explicit.
     */
    public function jobAdvertisement(): BelongsTo
    {
        return $this->job();
    }

    /**
     * Admin who moderated the application decision.
     */
    public function moderatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }
}

