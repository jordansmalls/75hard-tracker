<?php

namespace App\Http\Controllers\Api\V1\Challenge;

use App\Enums\Task;
use App\Http\Controllers\Controller;
use App\Http\Requests\Challenge\StoreProgressPhotoRequest;
use App\Http\Resources\ChallengeResource;
use App\Models\ProgressPhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProgressPhotoController extends Controller
{
    /**
     * Save the progress photo for a day, replacing any earlier one, and check off the photo task.
     */
    public function store(StoreProgressPhotoRequest $request): JsonResponse
    {
        $user = $request->user();
        $challenge = $user->currentChallenge;

        abort_if(! $challenge, 404, 'Start a challenge first.');

        $date = $request->validated('date');
        $directory = ProgressPhoto::directoryFor($user);
        $path = $request->file('photo')->store($directory);
        $thumbnailPath = $request->file('thumbnail')->store($directory);

        DB::transaction(function () use ($challenge, $date, $path, $thumbnailPath) {
            // Deleting through the model removes the old files too.
            $challenge->photos()->where('date', $date)->get()->each->delete();
            $challenge->photos()->create(['date' => $date, 'path' => $path, 'thumbnail_path' => $thumbnailPath]);
            $challenge->markDone($date, Task::Photo);
        });

        return ChallengeResource::make($challenge->loadDetails())->response()->setStatusCode(201);
    }

    /**
     * Stream a photo (or its thumbnail with `?size=thumb`) to its owner.
     */
    public function show(Request $request, ProgressPhoto $photo): StreamedResponse
    {
        $this->ensureOwner($request, $photo);

        $path = $request->query('size') === 'thumb' ? $photo->thumbnail_path : $photo->path;

        abort_unless(Storage::exists($path), 404);

        return Storage::response($path, headers: ['Cache-Control' => 'private, max-age=31536000, immutable']);
    }

    /**
     * Delete a photo. The photo task stays checked off.
     */
    public function destroy(Request $request, ProgressPhoto $photo): ChallengeResource
    {
        $this->ensureOwner($request, $photo);

        $challenge = $photo->challenge;
        $photo->delete();

        return ChallengeResource::make($challenge->loadDetails());
    }

    private function ensureOwner(Request $request, ProgressPhoto $photo): void
    {
        abort_unless($photo->challenge->user_id === $request->user()->id, 404);
    }
}
