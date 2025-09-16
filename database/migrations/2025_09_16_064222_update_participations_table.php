<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('participations', function (Blueprint $table) {
            $table->string('affiliatemarketing_id')->nullable()->unique()->after('id');
            $table->integer('program_id')->nullable()->after('offer_id');
            $table->string('program_name')->nullable()->after('program_id');
            $table->decimal('commission_earned', 8, 2)->nullable()->after('status');
            $table->string('currency_code', 3)->default('EUR')->after('commission_earned');
            $table->timestamp('approval_date')->nullable()->after('currency_code');
            $table->string('disapproved_reason')->nullable()->after('approval_date');
            $table->timestamp('last_modified_daisycon')->nullable()->after('disapproved_reason');
            $table->json('raw_data')->nullable()->after('last_modified_daisycon');
        });
    }

    public function down(): void
    {
        Schema::table('participations', function (Blueprint $table) {
            $table->dropColumn([
                'affiliatemarketing_id',
                'program_id',
                'program_name',
                'commission_earned',
                'currency_code',
                'approval_date',
                'disapproved_reason',
                'last_modified_daisycon',
                'raw_data'
            ]);
        });
    }
};
