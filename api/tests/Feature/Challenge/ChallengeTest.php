<?php

use App\Enums\ChallengeStatus;
use App\Models\Challenge;
use App\Models\User;

test('a user without a challenge gets null', function () {
    $this->actingAs(User::factory()->create())
        ->getJson('/api/v1/challenge')
        ->assertOk()
        ->assertExactJson(['data' => null]);
});

test('a user can start a challenge today', function () {
    $user = User::factory()->create();
    $today = now('America/New_York')->toDateString();

    $this->actingAs($user)
        ->postJson('/api/v1/challenges', ['started_on' => $today, 'timezone' => 'America/New_York'])
        ->assertCreated()
        ->assertJsonPath('data.started_on', $today)
        ->assertJsonPath('data.ends_on', now('America/New_York')->addDays(74)->toDateString())
        ->assertJsonPath('data.length', 75)
        ->assertJsonPath('data.timezone', 'America/New_York')
        ->assertJsonPath('data.attempt', 1)
        ->assertJsonPath('data.check_ins', []);

    $this->actingAs($user)->getJson('/api/v1/challenge')->assertJsonPath('data.started_on', $today);
});

test('starting a challenge in the past can backfill the days before today', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/v1/challenges', [
            'started_on' => now('UTC')->subDays(3)->toDateString(),
            'timezone' => 'UTC',
            'backfill' => true,
        ])
        ->assertCreated()
        ->assertJsonCount(3 * 7, 'data.check_ins')
        ->assertJsonPath('data.check_ins.0.checked_at', null)
        ->assertJsonPath('data.check_ins.0.minute_of_day', null);
});

test('starting again abandons the current challenge', function () {
    $user = User::factory()->create();
    $first = Challenge::factory()->for($user)->startedDaysAgo(10)->create();

    $this->actingAs($user)
        ->postJson('/api/v1/challenges', ['started_on' => now('UTC')->toDateString(), 'timezone' => 'UTC'])
        ->assertCreated()
        ->assertJsonPath('data.attempt', 2);

    expect($first->refresh()->status)->toBe(ChallengeStatus::Abandoned)
        ->and($first->ended_at)->not->toBeNull()
        ->and($user->currentChallenge->id)->not->toBe($first->id);
});

test('a challenge cannot start in the future or more than 75 days ago', function (int $daysFromToday) {
    $this->actingAs(User::factory()->create())
        ->postJson('/api/v1/challenges', [
            'started_on' => now('UTC')->addDays($daysFromToday)->toDateString(),
            'timezone' => 'UTC',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('started_on');
})->with([1, -75]);

test('a challenge needs a valid timezone', function () {
    $this->actingAs(User::factory()->create())
        ->postJson('/api/v1/challenges', ['started_on' => now('UTC')->toDateString(), 'timezone' => 'Mars/Olympus'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('timezone');
});

test('another user’s challenge is never returned', function () {
    Challenge::factory()->create();

    $this->actingAs(User::factory()->create())
        ->getJson('/api/v1/challenge')
        ->assertExactJson(['data' => null]);
});

test('guests and users without a username cannot use challenges', function () {
    $this->getJson('/api/v1/challenge')->assertUnauthorized();

    $this->actingAs(User::factory()->withoutUsername()->create())
        ->getJson('/api/v1/challenge')
        ->assertForbidden();
});
