<?php

namespace Database\Factories;

use App\Enums\ChallengeStatus;
use App\Models\Challenge;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Challenge>
 */
class ChallengeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'started_on' => now('UTC')->toDateString(),
            'timezone' => 'UTC',
            'status' => ChallengeStatus::Active,
        ];
    }

    /**
     * Indicate that the challenge started a number of days ago.
     */
    public function startedDaysAgo(int $days): static
    {
        return $this->state(fn (array $attributes) => [
            'started_on' => now($attributes['timezone'] ?? 'UTC')->subDays($days)->toDateString(),
        ]);
    }

    /**
     * Indicate that the challenge was given up or restarted.
     */
    public function abandoned(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ChallengeStatus::Abandoned,
            'ended_at' => now(),
        ]);
    }
}
