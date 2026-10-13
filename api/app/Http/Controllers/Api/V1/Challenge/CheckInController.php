<?php

namespace App\Http\Controllers\Api\V1\Challenge;

use App\Enums\Task;
use App\Http\Controllers\Controller;
use App\Http\Requests\Challenge\UpdateCheckInRequest;
use App\Http\Resources\ChallengeResource;

class CheckInController extends Controller
{
    /**
     * Check off a task for a day of the current challenge, or uncheck it.
     */
    public function update(UpdateCheckInRequest $request): ChallengeResource
    {
        $challenge = $request->user()->currentChallenge;

        abort_if(! $challenge, 404, 'Start a challenge first.');

        $date = $request->validated('date');
        $task = Task::from($request->validated('task'));

        $request->boolean('done')
            ? $challenge->markDone($date, $task)
            : $challenge->markUndone($date, $task);

        return ChallengeResource::make($challenge->loadDetails());
    }
}
