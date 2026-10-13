<?php

use App\Models\Challenge;
use App\Models\User;

test('water can be logged for today', function () {
    $challenge = Challenge::factory()->create();
    $today = now('UTC')->toDateString();

    $this->actingAs($challenge->user)
        ->patchJson("/api/v1/challenge/days/{$today}", ['water_oz' => 48])
        ->assertOk()
        ->assertJsonPath('data.day_logs.0.date', $today)
        ->assertJsonPath('data.day_logs.0.water_oz', 48)
        ->assertJsonPath('data.check_ins', []);
});

test('reaching a gallon checks off water and dropping under unchecks it', function () {
    $challenge = Challenge::factory()->create();
    $today = now('UTC')->toDateString();

    $this->actingAs($challenge->user)
        ->patchJson("/api/v1/challenge/days/{$today}", ['water_oz' => 128])
        ->assertJsonPath('data.check_ins.0.task', 'water');

    $this->actingAs($challenge->user)
        ->patchJson("/api/v1/challenge/days/{$today}", ['water_oz' => 112])
        ->assertJsonPath('data.check_ins', []);
});

test('logging water under a gallon leaves a manual check alone', function () {
    $challenge = Challenge::factory()->create();
    $today = now('UTC')->toDateString();
    $challenge->checkIns()->create(['date' => $today, 'task' => 'water', 'checked_at' => now()]);

    $this->actingAs($challenge->user)
        ->patchJson("/api/v1/challenge/days/{$today}", ['water_oz' => 32])
        ->assertJsonCount(1, 'data.check_ins');
});

test('logging pages records the book and checks off reading', function () {
    $challenge = Challenge::factory()->create();
    $today = now('UTC')->toDateString();

    $this->actingAs($challenge->user)
        ->patchJson("/api/v1/challenge/days/{$today}", ['pages' => 24, 'book_title' => '  Atomic Habits '])
        ->assertOk()
        ->assertJsonPath('data.day_logs.0.pages', 24)
        ->assertJsonPath('data.day_logs.0.book_title', 'Atomic Habits')
        ->assertJsonPath('data.check_ins.0.task', 'reading');
});

test('updating one detail keeps the others', function () {
    $challenge = Challenge::factory()->create();
    $today = now('UTC')->toDateString();

    $this->actingAs($challenge->user)->patchJson("/api/v1/challenge/days/{$today}", ['pages' => 10, 'book_title' => 'Deep Work']);
    $this->actingAs($challenge->user)
        ->patchJson("/api/v1/challenge/days/{$today}", ['water_oz' => 16])
        ->assertJsonPath('data.day_logs.0.book_title', 'Deep Work')
        ->assertJsonPath('data.day_logs.0.water_oz', 16);
});

test('day details are validated', function (array $payload, string $field) {
    $challenge = Challenge::factory()->create();

    $this->actingAs($challenge->user)
        ->patchJson('/api/v1/challenge/days/'.now('UTC')->toDateString(), $payload)
        ->assertUnprocessable()
        ->assertJsonValidationErrors($field);
})->with([
    'negative water' => [['water_oz' => -8], 'water_oz'],
    'zero pages' => [['pages' => 0], 'pages'],
    'long title' => [['book_title' => str_repeat('a', 256)], 'book_title'],
]);

test('future days cannot be logged', function () {
    $challenge = Challenge::factory()->create();

    $this->actingAs($challenge->user)
        ->patchJson('/api/v1/challenge/days/'.now('UTC')->addDay()->toDateString(), ['water_oz' => 16])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('date');
});

test('logging a day without a challenge returns not found', function () {
    $this->actingAs(User::factory()->create())
        ->patchJson('/api/v1/challenge/days/'.now('UTC')->toDateString(), ['water_oz' => 16])
        ->assertNotFound();
});
