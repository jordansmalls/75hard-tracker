<?php

namespace App\Http\Controllers\Api\V1\Challenge;

use App\Enums\Task;
use App\Http\Controllers\Controller;
use App\Http\Requests\Challenge\UpdateDayLogRequest;
use App\Http\Resources\ChallengeResource;
use App\Models\DayLog;
use Illuminate\Support\Facades\DB;

class DayLogController extends Controller
{
    /**
     * Log water and reading details for a day.
     *
     * Reaching a gallon checks off the water task (and dropping back under unchecks it);
     * logging pages checks off reading.
     */
    public function update(UpdateDayLogRequest $request, string $date): ChallengeResource
    {
        $challenge = $request->user()->currentChallenge;

        abort_if(! $challenge, 404, 'Start a challenge first.');

        DB::transaction(function () use ($request, $challenge, $date) {
            $log = $challenge->dayLogs()->firstOrNew(['date' => $date]);
            $wasFull = ($log->water_oz ?? 0) >= DayLog::GALLON_OZ;

            $log->fill($request->safe()->except('date'))->save();

            if ($request->has('water_oz')) {
                $isFull = $log->water_oz >= DayLog::GALLON_OZ;

                if ($isFull && ! $wasFull) {
                    $challenge->markDone($date, Task::Water);
                } elseif ($wasFull && ! $isFull) {
                    $challenge->markUndone($date, Task::Water);
                }
            }

            if ($request->filled('pages')) {
                $challenge->markDone($date, Task::Reading);
            }
        });

        return ChallengeResource::make($challenge->loadDetails());
    }
}
