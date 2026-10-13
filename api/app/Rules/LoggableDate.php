<?php

namespace App\Rules;

use App\Models\Challenge;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

/**
 * A `Y-m-d` date within the challenge: no earlier than Day 1, no later than today (or Day 75).
 */
class LoggableDate implements ValidationRule
{
    public function __construct(private readonly ?Challenge $challenge) {}

    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Without a challenge the controller responds 404, so there's nothing to compare against.
        if (! $this->challenge || ! is_string($value)) {
            return;
        }

        if ($value < $this->challenge->started_on->toDateString()) {
            $fail('That day is before your challenge started.');
        } elseif ($value > $this->challenge->lastLoggableDay()->toDateString()) {
            $fail('You can’t log a day that hasn’t happened yet.');
        }
    }
}
