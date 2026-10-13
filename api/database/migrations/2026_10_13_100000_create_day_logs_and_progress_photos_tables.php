<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Details logged for a day beyond the checklist itself.
        Schema::create('day_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->unsignedSmallInteger('water_oz')->default(0);
            $table->unsignedSmallInteger('pages')->nullable();
            $table->string('book_title')->nullable();
            $table->timestamps();

            $table->unique(['challenge_id', 'date']);
        });

        Schema::create('progress_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->string('path');
            $table->string('thumbnail_path');
            $table->timestamps();

            $table->unique(['challenge_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('progress_photos');
        Schema::dropIfExists('day_logs');
    }
};
