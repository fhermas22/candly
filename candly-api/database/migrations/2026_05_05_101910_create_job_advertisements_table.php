<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_advertisements', function (Blueprint $table) {
            $table->id();

            $table->foreignId('admin_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('title');
            $table->string('location');
            $table->text('description');
            $table->string('salary_range')->nullable();
            $table->enum('status', ['open', 'closed'])->default('open');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_advertisements');
    }
};

