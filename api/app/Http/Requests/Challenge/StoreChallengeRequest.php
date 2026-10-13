<?php

namespace App\Http\Requests\Challenge;

use App\Models\Challenge;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreChallengeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $today = $this->today();

        return [
            'timezone' => ['required', 'string', 'timezone:all'],
            'started_on' => [
                'required',
                'date_format:Y-m-d',
                'after_or_equal:'.$today->subDays(Challenge::LENGTH - 1)->toDateString(),
                'before_or_equal:'.$today->toDateString(),
            ],
            'backfill' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'started_on.after_or_equal' => 'A challenge that started that long ago would already be over.',
            'started_on.before_or_equal' => 'Your challenge can’t start in the future.',
        ];
    }

    /**
     * Today in the user's timezone, falling back to UTC until the timezone is validated.
     */
    private function today(): CarbonImmutable
    {
        $timezone = $this->string('timezone')->toString();

        return CarbonImmutable::now(in_array($timezone, timezone_identifiers_list(), true) ? $timezone : 'UTC')
            ->startOfDay();
    }
}
