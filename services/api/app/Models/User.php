<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Aligned to the baseline `users` table: email, hashed_password,
 * external_auth_id, display_name, locale, role, deleted_at. The Laravel
 * default column set (name/password/remember_token) does not exist here.
 */
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'users';

    protected $fillable = [
        'email', 'hashed_password', 'external_auth_id', 'display_name', 'locale', 'role', 'deleted_at',
    ];

    protected $hidden = [
        'hashed_password', 'external_auth_id',
    ];

    protected function casts(): array
    {
        return [
            'deleted_at' => 'datetime',
            'hashed_password' => 'hashed',
        ];
    }

    /**
     * Auth identifier for the guard: the baseline stores the credential
     * in hashed_password, not password.
     */
    public function getAuthPassword()
    {
        return $this->hashed_password;
    }

    public function hasStaffRole(): bool
    {
        return in_array($this->role, ['admin', 'editor'], true);
    }
}
