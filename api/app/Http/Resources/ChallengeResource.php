<?php

namespace App\Http\Resources;

use App\Models\Challenge;
use App\Models\CheckIn;
use App\Models\DayLog;
use App\Models\ProgressPhoto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Challenge
 */
class ChallengeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'started_on' => $this->started_on->toDateString(),
            'ends_on' => $this->lastDay()->toDateString(),
            'length' => Challenge::LENGTH,
            'timezone' => $this->timezone,
            'status' => $this->status,
            // 1 for a first try, 2 after one restart, and so on.
            'attempt' => $this->user->challenges()->where('id', '<=', $this->id)->count(),
            'check_ins' => $this->checkIns
                ->sortBy(['date', 'task'])
                ->map(fn (CheckIn $checkIn) => [
                    'date' => $checkIn->date->toDateString(),
                    'task' => $checkIn->task,
                    'checked_at' => $checkIn->checked_at,
                    'minute_of_day' => $this->minuteOfDay($checkIn),
                ])
                ->values(),
            'day_logs' => $this->dayLogs
                ->sortBy('date')
                ->map(fn (DayLog $log) => [
                    'date' => $log->date->toDateString(),
                    'water_oz' => $log->water_oz,
                    'pages' => $log->pages,
                    'book_title' => $log->book_title,
                ])
                ->values(),
            'photos' => $this->photos
                ->sortBy('date')
                ->map(fn (ProgressPhoto $photo) => [
                    'id' => $photo->id,
                    'date' => $photo->date->toDateString(),
                    'url' => route('v1.challenge.photos.show', $photo, absolute: false),
                    'thumbnail_url' => route('v1.challenge.photos.show', [$photo, 'size' => 'thumb'], absolute: false),
                ])
                ->values(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * Minutes after local midnight when the task was checked off, for time-of-day stats.
     */
    private function minuteOfDay(CheckIn $checkIn): ?int
    {
        $local = $checkIn->checked_at?->setTimezone($this->timezone);

        return $local ? $local->hour * 60 + $local->minute : null;
    }
}
