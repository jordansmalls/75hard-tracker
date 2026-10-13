<?php

namespace App\Http\Controllers\Api\V1\Challenge;

use App\Enums\ChallengeStatus;
use App\Enums\Task;
use App\Http\Controllers\Controller;
use App\Http\Requests\Challenge\StoreChallengeRequest;
use App\Http\Resources\ChallengeResource;
use App\Models\Challenge;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChallengeController extends Controller
{
    /**
     * Get the signed-in user's current challenge, or `null` if they haven't started one.
     */
    public function show(Request $request): ChallengeResource|JsonResponse
    {
        $challenge = $request->user()->currentChallenge;

        if (! $challenge) {
            return response()->json(['data' => null]);
        }

        return ChallengeResource::make($challenge->loadDetails());
    }

    /**
     * Start a new challenge. Any challenge in progress counts as abandoned (a restart).
     *
     * With `backfill`, every day before today is marked complete, for people who
     * started 75 Hard before they started using the app.
     */
    public function store(StoreChallengeRequest $request): JsonResponse
    {
        $user = $request->user();

        $challenge = DB::transaction(function () use ($request, $user) {
            $user->challenges()
                ->where('status', ChallengeStatus::Active)
                ->update(['status' => ChallengeStatus::Abandoned, 'ended_at' => now()]);

            $challenge = $user->challenges()->create([
                'started_on' => $request->validated('started_on'),
                'timezone' => $request->validated('timezone'),
                'status' => ChallengeStatus::Active,
            ]);

            if ($request->boolean('backfill')) {
                $this->backfill($challenge);
            }

            return $challenge;
        });

        return ChallengeResource::make($challenge->loadDetails())
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Mark every task complete for each day between the start date and yesterday.
     */
    private function backfill(Challenge $challenge): void
    {
        $yesterday = $challenge->today()->subDay();

        if ($yesterday->lt($challenge->started_on)) {
            return;
        }

        $now = now();
        $rows = [];

        foreach (CarbonPeriod::create($challenge->started_on, $yesterday) as $date) {
            foreach (Task::cases() as $task) {
                $rows[] = [
                    'challenge_id' => $challenge->id,
                    'date' => $date->toDateString(),
                    'task' => $task->value,
                    'checked_at' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        $challenge->checkIns()->insert($rows);
    }
}
