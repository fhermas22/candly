<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('job_id')
                ->constrained('job_advertisements')
                ->cascadeOnDelete();

            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');

            $table->foreignId('moderated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('applied_at');

            $table->softDeletes();
            $table->timestamps();
        });

        // Production hardening: prevent race-condition duplicates at the database level.
        // MySQL doesn't support partial unique indexes (WHERE deleted_at IS NULL), so we use a generated column.
        if (DB::getDriverName() === 'mysql') {
            Schema::table('applications', function (Blueprint $table) {
                $table->string('active_unique_key')
                    ->nullable()
                    ->storedAs("IF(`deleted_at` IS NULL, CONCAT(`user_id`, '-', `job_id`), NULL)");

                $table->unique('active_unique_key', 'applications_unique_active_user_job');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};

