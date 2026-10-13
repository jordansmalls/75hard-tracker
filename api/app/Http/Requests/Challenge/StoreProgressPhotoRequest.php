<?php

namespace App\Http\Requests\Challenge;

use App\Rules\LoggableDate;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class StoreProgressPhotoRequest extends FormRequest
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
     * The app resizes photos before uploading, so these limits are generous.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'date' => ['required', 'date_format:Y-m-d', new LoggableDate($this->user()->currentChallenge)],
            'photo' => ['required', File::image()->types(['jpeg', 'png', 'webp'])->max(5 * 1024)],
            'thumbnail' => ['required', File::image()->types(['jpeg', 'png', 'webp'])->max(1024)],
        ];
    }
}
