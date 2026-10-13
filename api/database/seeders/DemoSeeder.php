<?php

namespace Database\Seeders;

use App\Enums\Task;
use App\Models\Challenge;
use App\Models\ProgressPhoto;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * A demo account partway through a challenge, with water and reading logs and
 * placeholder progress photos: `demo@example.com` / `password`.
 *
 *     php artisan db:seed --class=DemoSeeder
 */
class DemoSeeder extends Seeder
{
    /**
     * Rough time of day (in hours) each task tends to get checked off.
     *
     * @var array<string, float>
     */
    private const TYPICAL_HOUR = [
        'reading' => 6.75,
        'photo' => 6.25,
        'water' => 19.5,
        'workout_one' => 7.5,
        'workout_two' => 17.75,
        'diet' => 21.0,
        'no_alcohol' => 21.25,
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $timezone = 'America/New_York';
        $today = CarbonImmutable::now($timezone)->startOfDay();

        // Deleting through the model also removes old photo files.
        User::query()->where('email', 'demo@example.com')->get()->each->delete();

        $user = User::factory()->create([
            'name' => 'Demo',
            'username' => 'demo',
            'email' => 'demo@example.com',
        ]);

        // One earlier attempt that ended in a restart.
        Challenge::factory()->for($user)->abandoned()->create([
            'started_on' => $today->subDays(30)->toDateString(),
            'timezone' => $timezone,
        ]);

        $challenge = Challenge::factory()->for($user)->create([
            'started_on' => $today->subDays(17)->toDateString(),
            'timezone' => $timezone,
        ]);

        $rows = [];

        for ($date = $challenge->started_on->shiftTimezone($timezone); $date->lte($today); $date = $date->addDay()) {
            $tasks = $date->isSameDay($today)
                ? [Task::Photo, Task::Reading, Task::WorkoutOne]
                : Task::cases();

            foreach ($tasks as $task) {
                $minutes = (int) round(self::TYPICAL_HOUR[$task->value] * 60) + random_int(-50, 50);
                $checkedAt = $date->addMinutes($minutes);

                $rows[] = [
                    'challenge_id' => $challenge->id,
                    'date' => $date->toDateString(),
                    'task' => $task->value,
                    'checked_at' => $checkedAt->isFuture() ? now() : $checkedAt->utc(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        $challenge->checkIns()->insert($rows);

        $this->seedDetails($challenge, $today);
    }

    /**
     * Water and reading logs for every day, and a progress photo for each.
     */
    private function seedDetails(Challenge $challenge, CarbonImmutable $today): void
    {
        $directory = ProgressPhoto::directoryFor($challenge->user);
        $day = 0;

        for ($date = $challenge->started_on->shiftTimezone($today->timezone); $date->lte($today); $date = $date->addDay()) {
            $isToday = $date->isSameDay($today);

            $challenge->dayLogs()->create([
                'date' => $date->toDateString(),
                'water_oz' => $isToday ? 64 : random_int(128, 168),
                'pages' => $isToday ? 12 : random_int(10, 32),
                'book_title' => $day < 9 ? 'Atomic Habits' : 'Can’t Hurt Me',
            ]);

            $paths = $this->placeholderPhoto($directory, $day);
            $challenge->photos()->create(['date' => $date->toDateString(), ...$paths]);
            $day++;
        }
    }

    /**
     * A simple silhouette that slims down a little each day.
     *
     * @return array{path: string, thumbnail_path: string}
     */
    private function placeholderPhoto(string $directory, int $day): array
    {
        $width = 600;
        $height = 800;
        $image = imagecreatetruecolor($width, $height);

        for ($y = 0; $y < $height; $y++) {
            $shade = (int) (225 - $y / $height * 40);
            imageline($image, 0, $y, $width, $y, imagecolorallocate($image, $shade, $shade + 5, $shade + 15));
        }

        $figure = imagecolorallocate($image, 70, 80, 100);
        $slim = 1 - min($day, 30) * 0.008;
        imagefilledellipse($image, 300, 210, 130, 150, $figure);
        imagefilledellipse($image, 300, 520, (int) (300 * $slim), 470, $figure);

        $thumbnail = imagecreatetruecolor(240, 320);
        imagecopyresampled($thumbnail, $image, 0, 0, 0, 0, 240, 320, $width, $height);

        $paths = [];
        foreach (['path' => $image, 'thumbnail_path' => $thumbnail] as $key => $gd) {
            ob_start();
            imagejpeg($gd, null, 80);
            $paths[$key] = $directory.'/'.Str::uuid().'.jpg';
            Storage::put($paths[$key], (string) ob_get_clean());
        }

        return $paths;
    }
}
