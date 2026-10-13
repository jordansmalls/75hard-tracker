<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\UpdateUsernameRequest;
use App\Http\Resources\UserResource;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Validation\ValidationException;

class UsernameController extends Controller
{
    /**
     * Set or change the signed-in user's username. Setting it the first time completes onboarding.
     */
    public function update(UpdateUsernameRequest $request): UserResource
    {
        $user = $request->user();

        try {
            $user->update(['username' => $request->validated('username')]);
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages([
                'username' => __('This username has already been taken.'),
            ]);
        }

        return UserResource::make($user);
    }
}
