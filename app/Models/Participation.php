<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Participation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'offer_id',
        'affiliatemarketing_id',
        'program_id',
        'program_name',
        'clicked_at',
        'status',
        'commission_earned',
        'currency_code',
        'approval_date',
        'disapproved_reason',
        'last_modified_daisycon',
        'raw_data',
    ];

    protected $casts = [
        'clicked_at' => 'datetime',
        'approval_date' => 'datetime',
        'last_modified_daisycon' => 'datetime',
        'raw_data' => 'array',
        'commission_earned' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function offer()
    {
        return $this->belongsTo(Offer::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'en_attente';
    }

    public function isApproved(): bool
    {
        return $this->status === 'validee';
    }

    public function isRejected(): bool
    {
        return $this->status === 'refusee';
    }
}
