<?php

use App\Models\Challenge;
use App\Models\User;
use Illuminate\Support\Carbon;

test('a task can be checked off and unchecked for today', function () {
    $challenge = Challenge::factory()->create();
    $today = now('UTC')->toDateString();

    $this->actingAs($challenge->user)
        ->putJson('/api/v1/challenge/check-ins', ['date' => $today, 'task' => 'reading', 'done' => true])
        ->assertOk()
        ->assertJsonCount(1, 'data.check_ins')
        ->assertJsonPath('data.check_ins.0.date', $today)
        ->assertJsonPath('data.check_ins.0.task', 'reading');

    $this->actingAs($challenge->user)
        ->putJson('/api/v1/challenge/check-ins', ['date' => $today, 'task' => 'reading', 'done' => false])
        ->assertOk()
        ->assertJsonCount(0, 'data.check_ins');
});

test('checking off a task twice keeps one check-in', function () {
    $challenge = Challenge::factory()->create();
    $payload = ['date' => now('UTC')->toDateString(), 'task' => 'water', 'done' => true];

    $this->actingAs($challenge->user)->putJson('/api/v1/challenge/check-ins', $payload)->assertOk();
    $this->actingAs($challenge->user)->putJson('/api/v1/challenge/check-ins', $payload)->assertOk();

    expect($challenge->checkIns()->count())->toBe(1);
});

test('the time of day is recorded in the challenge’s timezone', function () {
    Carbon::setTestNow(Carbon::parse('2026-10-13 14:30:00', 'UTC'));
    $challenge = Challenge::factory()->create(['timezone' => 'America/Chicago', 'started_on' => '2026-10-13']);

    $this->actingAs($challenge->user)
        ->putJson('/api/v1/challenge/check-ins', ['date' => '2026-10-13', 'task' => 'reading', 'done' => true])
        ->assertJsonPath('data.check_ins.0.minute_of_day', 9 * 60 + 30);
});

test('a past day can be logged late without a time of day', function () {
    $challenge = Challenge::factory()->startedDaysAgo(2)->create();

    $this->actingAs($challenge->user)
        ->putJson('/api/v1/challenge/check-ins', [
            'date' => now('UTC')->subDay()->toDateString(),
            'task' => 'photo',
            'done' => true,
        ])
        ->assertOk()
        ->assertJsonPath('data.check_ins.0.checked_at', null)
        ->assertJsonPath('data.check_ins.0.minute_of_day', null);
});

test('days outside the challenge cannot be logged', function (int $daysFromToday) {
    $challenge = Challenge::factory()->startedDaysAgo(2)->create();

    $this->actingAs($challenge->user)
        ->putJson('/api/v1/challenge/check-ins', [
            'date' => now('UTC')->addDays($daysFromToday)->toDateString(),
            'task' => 'diet',
            'done' => true,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('date');
})->with(['before the start' => -3, 'in the future' => 1]);

test('unknown tasks are rejected', function () {
    $challenge = Challenge::factory()->create();

    $this->actingAs($challenge->user)
        ->putJson('/api/v1/challenge/check-ins', ['date' => now('UTC')->toDateString(), 'task' => 'nap', 'done' => true])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('task');
});

test('checking in without a challenge returns not found', function () {
    $this->actingAs(User::factory()->create())
        ->putJson('/api/v1/challenge/check-ins', ['date' => now('UTC')->toDateString(), 'task' => 'water', 'done' => true])
        ->assertNotFound();
});

test('an abandoned challenge cannot be logged', function () {
    $challenge = Challenge::factory()->abandoned()->create();

    $this->actingAs($challenge->user)
        ->putJson('/api/v1/challenge/check-ins', ['date' => now('UTC')->toDateString(), 'task' => 'water', 'done' => true])
        ->assertNotFound();
});
