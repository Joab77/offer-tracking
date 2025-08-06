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
        'image_url',
        'commission',
        'country',
        'daisycon_url',
        'api_key',
    ];

    protected $casts = [
        'commission' => 'decimal:2',
    ];

    public function participations()
    {
        return $this->hasMany(Participation::class);
    }

    public function getAffiliateUrl(int $userId): string
    {
        $separator = str_contains($this->daisycon_url, '?') ? '&' : '?';
        return $this->daisycon_url . $separator . 'subid=user_' . $userId;
    }
}