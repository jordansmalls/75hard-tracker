<?php

namespace App\Http\Requests\Challenge;

use App\Rules\LoggableDate;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDayLogRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge(['date' => $this->route('date')]);

        if ($this->has('book_title')) {
            $title = trim((string) $this->input('book_title'));
            $this->merge(['book_title' => $title === '' ? null : $title]);
        }
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
            'water_oz' => ['sometimes', 'integer', 'min:0', 'max:1000'],
            'pages' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:2000'],
            'book_title' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
