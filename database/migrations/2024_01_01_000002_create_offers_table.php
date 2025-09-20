<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->text('deeplink'); // URL d'affiliation Daisycon
            $table->string('status')->default('pending'); // pending, approved, disapproved
            $table->decimal('commission', 8, 2);
            $table->string('currency_code', 3)->default('EUR');
            $table->string('country', 2); // Code pays ISO
            $table->integer('program_id')->nullable(); // ID programme Daisycon
            $table->string('program_name')->nullable(); // Nom programme Daisycon
            $table->string('image_url')->nullable();
            $table->timestamp('last_updated_daisycon')->nullable();
            $table->json('raw_data')->nullable(); // Données brutes Daisycon
            $table->timestamps();

            $table->index(['program_id']);
            $table->index(['status']);
            $table->index(['country']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offers');
    }
};
