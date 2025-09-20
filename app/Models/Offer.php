<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Offer extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'deeplink',
        'status',
        'commission',
        'currency_code',
        'country',
        'program_id',
        'program_name',
        'image_url',
        'last_updated_daisycon',
        'raw_data',
    ];

    protected $casts = [
        'commission' => 'decimal:2',
        'last_updated_daisycon' => 'datetime',
        'raw_data' => 'array',
    ];

    public function participations()
    {
        return $this->hasMany(Participation::class);
    }

    public function hasUserParticipated(int $userId): bool
    {
        return $this->participations()->where('user_id', $userId)->exists();
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isDisapproved(): bool
    {
        return $this->status === 'disapproved';
    }
}
