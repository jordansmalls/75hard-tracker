<?php

namespace App\Models;

use App\Enums\ChallengeStatus;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'username', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Bootstrap the model and its traits.
     */
    protected static function booted(): void
    {
        // Photo rows go with the challenges (cascade); the files need removing too.
        static::deleted(function (User $user) {
            Storage::deleteDirectory(ProgressPhoto::directoryFor($user));
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Emails are stored lowercase so lookups and the unique index are case-insensitive.
     *
     * @return Attribute<string, string>
     */
    protected function email(): Attribute
    {
        return Attribute::make(
            set: fn (string $value): string => Str::lower(trim($value)),
        );
    }

    /**
     * Usernames are stored lowercase so lookups and the unique index are case-insensitive.
     *
     * @return Attribute<?string, ?string>
     */
    protected function username(): Attribute
    {
        return Attribute::make(
            set: fn (?string $value): ?string => $value === null ? null : Str::lower(trim($value)),
        );
    }

    /**
     * Determine if the user has finished onboarding by choosing a username.
     */
    public function hasUsername(): bool
    {
        return $this->username !== null;
    }

    /**
     * Every challenge the user has started, including restarted ones.
     *
     * @return HasMany<Challenge, $this>
     */
    public function challenges(): HasMany
    {
        return $this->hasMany(Challenge::class);
    }

    /**
     * The challenge the user is working on now, if any.
     *
     * @return HasOne<Challenge, $this>
     */
    public function currentChallenge(): HasOne
    {
        return $this->hasOne(Challenge::class)
            ->where('status', ChallengeStatus::Active)
            ->latestOfMany();
    }
}
