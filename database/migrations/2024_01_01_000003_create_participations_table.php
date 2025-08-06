<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('participations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('offer_id')->constrained()->onDelete('cascade');
            $table->timestamp('clicked_at');
            $table->enum('status', ['en_attente', 'validee', 'refusee'])->default('en_attente');
            $table->timestamps();
            
            $table->unique(['user_id', 'offer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participations');
    }
};