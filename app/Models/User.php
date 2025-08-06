<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'pays',
        'validated',
        'is_admin',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'validated' => 'boolean',
        'is_admin' => 'boolean',
        'password' => 'hashed',
    ];

    public function participations()
    {
        return $this->hasMany(Participation::class);
    }

    public function isAdmin(): bool
    {
        return $this->is_admin;
    }

    public function isValidated(): bool
    {
        return $this->validated;
    }
}