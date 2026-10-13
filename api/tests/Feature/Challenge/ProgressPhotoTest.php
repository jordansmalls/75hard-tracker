<?php

use App\Models\Challenge;
use App\Models\ProgressPhoto;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake();
});

function uploadPhoto(Challenge $challenge, ?string $date = null)
{
    return test()->actingAs($challenge->user)->post('/api/v1/challenge/photos', [
        'date' => $date ?? now('UTC')->toDateString(),
        'photo' => UploadedFile::fake()->image('photo.jpg', 1200, 1600),
        'thumbnail' => UploadedFile::fake()->image('thumb.jpg', 300, 400),
    ], ['Accept' => 'application/json']);
}

test('a progress photo can be uploaded and checks off the photo task', function () {
    $challenge = Challenge::factory()->create();

    $response = uploadPhoto($challenge)
        ->assertCreated()
        ->assertJsonPath('data.photos.0.date', now('UTC')->toDateString())
        ->assertJsonPath('data.check_ins.0.task', 'photo');

    $photo = ProgressPhoto::sole();
    expect($response->json('data.photos.0.url'))->toBe("/api/v1/challenge/photos/{$photo->id}");
    Storage::assertExists([$photo->path, $photo->thumbnail_path]);
});

test('uploading again for the same day replaces the photo', function () {
    $challenge = Challenge::factory()->create();

    uploadPhoto($challenge);
    $first = ProgressPhoto::sole();
    uploadPhoto($challenge)->assertCreated()->assertJsonCount(1, 'data.photos');

    Storage::assertMissing($first->path);
    expect(ProgressPhoto::sole()->id)->not->toBe($first->id);
});

test('the owner can view a photo and its thumbnail', function () {
    $challenge = Challenge::factory()->create();
    uploadPhoto($challenge);
    $photo = ProgressPhoto::sole();

    $this->actingAs($challenge->user)->get("/api/v1/challenge/photos/{$photo->id}")->assertOk();
    $this->actingAs($challenge->user)->get("/api/v1/challenge/photos/{$photo->id}?size=thumb")->assertOk();
});

test('other users cannot view or delete a photo', function () {
    $challenge = Challenge::factory()->create();
    uploadPhoto($challenge);
    $photo = ProgressPhoto::sole();
    $other = User::factory()->create();

    $this->actingAs($other)->getJson("/api/v1/challenge/photos/{$photo->id}")->assertNotFound();
    $this->actingAs($other)->deleteJson("/api/v1/challenge/photos/{$photo->id}")->assertNotFound();
});

test('a photo can be deleted along with its files', function () {
    $challenge = Challenge::factory()->create();
    uploadPhoto($challenge);
    $photo = ProgressPhoto::sole();

    $this->actingAs($challenge->user)
        ->deleteJson("/api/v1/challenge/photos/{$photo->id}")
        ->assertOk()
        ->assertJsonPath('data.photos', [])
        ->assertJsonPath('data.check_ins.0.task', 'photo');

    Storage::assertMissing([$photo->path, $photo->thumbnail_path]);
});

test('only images are accepted', function () {
    $challenge = Challenge::factory()->create();

    $this->actingAs($challenge->user)->post('/api/v1/challenge/photos', [
        'date' => now('UTC')->toDateString(),
        'photo' => UploadedFile::fake()->create('notes.pdf', 100, 'application/pdf'),
        'thumbnail' => UploadedFile::fake()->image('thumb.jpg'),
    ], ['Accept' => 'application/json'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('photo');
});

test('deleting an account removes its photo files', function () {
    $challenge = Challenge::factory()->create();
    uploadPhoto($challenge);
    $photo = ProgressPhoto::sole();

    $challenge->user->delete();

    Storage::assertMissing($photo->path);
});
