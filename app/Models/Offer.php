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
        'country',
        'image_url',
        'program_id'
    ];


    public function participations()
    {
        return $this->hasMany(Participation::class);
    }

    public function hasUserParticipated(int $userId): bool
    {
        return $this->participations()->where('user_id', $userId)->exists();
    }

}
