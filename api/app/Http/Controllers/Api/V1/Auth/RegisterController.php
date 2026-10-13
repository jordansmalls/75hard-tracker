<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class RegisterController extends Controller
{
    /**
     * Create an account and sign the new user in. The user picks a username in a separate step.
     */
    public function __invoke(RegisterRequest $request): JsonResponse
    {
        try {
            $user = User::create($request->validated());
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages([
                'email' => __('validation.unique', ['attribute' => 'email']),
            ]);
        }

        $user->refresh();

        event(new Registered($user));

        Auth::guard('web')->login($user);

        $request->session()->regenerate();

        return UserResource::make($user)->response()->setStatusCode(201);
    }
}
