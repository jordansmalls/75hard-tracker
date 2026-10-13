<?php

namespace App\Models;

use App\Enums\ChallengeStatus;
use App\Enums\Task;
use Carbon\CarbonImmutable;
use Database\Factories\ChallengeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['started_on', 'timezone', 'status', 'ended_at'])]
class Challenge extends Model
{
    /** @use HasFactory<ChallengeFactory> */
    use HasFactory;

    /**
     * How many days a challenge lasts.
     */
    public const int LENGTH = 75;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'started_on' => 'immutable_date',
            'status' => ChallengeStatus::class,
            'ended_at' => 'immutable_datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<CheckIn, $this>
     */
    public function checkIns(): HasMany
    {
        return $this->hasMany(CheckIn::class);
    }

    /**
     * @return HasMany<DayLog, $this>
     */
    public function dayLogs(): HasMany
    {
        return $this->hasMany(DayLog::class);
    }

    /**
     * @return HasMany<ProgressPhoto, $this>
     */
    public function photos(): HasMany
    {
        return $this->hasMany(ProgressPhoto::class);
    }

    /**
     * Load everything the challenge resource shows.
     */
    public function loadDetails(): static
    {
        return $this->load(['checkIns', 'dayLogs', 'photos']);
    }

    /**
     * Whether a date falls between the first day and the last day that can be logged.
     */
    public function isLoggable(string $date): bool
    {
        return $date >= $this->started_on->toDateString() && $date <= $this->lastLoggableDay()->toDateString();
    }

    /**
     * Check a task off for a day. Tasks logged on a later day keep no time,
     * so they don't skew time-of-day stats.
     */
    public function markDone(string $date, Task $task): void
    {
        $this->checkIns()->createOrFirst(
            ['date' => $date, 'task' => $task],
            ['checked_at' => $date === $this->today()->toDateString() ? now() : null],
        );
    }

    /**
     * Uncheck a task for a day.
     */
    public function markUndone(string $date, Task $task): void
    {
        $this->checkIns()->where(['date' => $date, 'task' => $task])->delete();
    }

    /**
     * The current date where the challenger lives.
     */
    public function today(): CarbonImmutable
    {
        return CarbonImmutable::now($this->timezone)->startOfDay();
    }

    /**
     * The date of day 75.
     */
    public function lastDay(): CarbonImmutable
    {
        return $this->started_on->addDays(self::LENGTH - 1);
    }

    /**
     * The latest date that can be logged: today, or day 75 once the challenge is over.
     */
    public function lastLoggableDay(): CarbonImmutable
    {
        return $this->today()->min($this->lastDay());
    }
}
