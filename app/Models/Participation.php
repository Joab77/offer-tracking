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
        'clicked_at',
        'status',
    ];

    protected $casts = [
        'clicked_at' => 'datetime',
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