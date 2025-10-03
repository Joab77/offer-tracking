<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('offers', function (Blueprint $table) {

            $columnsToRemove = [
                'status',
                'commission',
                'currency_code',
                'program_id',
                'program_name',
                'last_updated_daisycon',
                'raw_data'
            ];

            foreach ($columnsToRemove as $column) {
                if (Schema::hasColumn('offers', $column)) {
                    $table->dropColumn($column);
                }
            }

        });
    }

    public function down(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->string('status')->default('pending');
            $table->decimal('commission', 8, 2)->nullable();
            $table->string('currency_code', 3)->default('EUR');
            $table->integer('program_id')->nullable();
            $table->string('program_name')->nullable();
            $table->string('image_url')->nullable();
            $table->timestamp('last_updated_daisycon')->nullable();
            $table->json('raw_data')->nullable();
        });
    }
};
