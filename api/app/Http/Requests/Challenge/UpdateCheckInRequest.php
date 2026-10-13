<?php

namespace App\Http\Requests\Challenge;

use App\Enums\Task;
use App\Rules\LoggableDate;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCheckInRequest extends FormRequest
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
        return [
            'date' => ['required', 'date_format:Y-m-d', new LoggableDate($this->user()->currentChallenge)],
            'task' => ['required', Rule::enum(Task::class)],
            'done' => ['required', 'boolean'],
        ];
    }
}
