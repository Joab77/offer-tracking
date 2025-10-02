<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('participations', function (Blueprint $table) {

            $table->string('transaction_id')->unique()->nullable()->after('offer_id');
            $table->string('status')->nullable()->after('transaction_id');
            $table->decimal('commission', 8, 2)->nullable()->after('status');
            $table->string('currency_code', 3)->nullable()->after('commission');
            $table->json('raw_data')->nullable()->after('currency_code');

            $table->index(['transaction_id']);
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::table('participations', function (Blueprint $table) {
            $table->dropIndex(['transaction_id']);
            $table->dropIndex(['status']);

            $table->dropColumn([
                'transaction_id',
                'status',
                'commission',
                'currency_code',
                'raw_data'
            ]);
        });
    }
};
