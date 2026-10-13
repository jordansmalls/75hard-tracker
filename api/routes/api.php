<?php

use App\Http\Controllers\Api\V1\Account\PasswordController;
use App\Http\Controllers\Api\V1\Account\ProfileController;
use App\Http\Controllers\Api\V1\Account\UsernameController;
use App\Http\Controllers\Api\V1\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Api\V1\Auth\NewPasswordController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetLinkController;
use App\Http\Controllers\Api\V1\Auth\RegisterController;
use App\Http\Controllers\Api\V1\Auth\SessionController;
use App\Http\Controllers\Api\V1\Auth\VerifyEmailController;
use App\Http\Controllers\Api\V1\AvailabilityController;
use App\Http\Controllers\Api\V1\Challenge\ChallengeController;
use App\Http\Controllers\Api\V1\Challenge\CheckInController;
use App\Http\Controllers\Api\V1\Challenge\DayLogController;
use App\Http\Controllers\Api\V1\Challenge\ProgressPhotoController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('v1.')->group(function () {
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::middleware('throttle:auth')->group(function () {
            Route::post('register', RegisterController::class)->name('register');
            Route::post('login', [SessionController::class, 'store'])->name('login');
            Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');
            Route::post('reset-password', [NewPasswordController::class, 'store'])->name('password.store');
        });

        Route::post('logout', [SessionController::class, 'destroy'])->name('logout');

        Route::post('email/verify/{id}/{hash}', VerifyEmailController::class)
            ->middleware(['signed:relative', 'throttle:verification'])
            ->name('verification.verify');

        Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
            ->middleware(['auth:sanctum', 'throttle:verification'])
            ->name('verification.send');
    });

    Route::prefix('availability')->name('availability.')->middleware('throttle:availability')->group(function () {
        Route::get('email', [AvailabilityController::class, 'email'])->name('email');
        Route::get('username', [AvailabilityController::class, 'username'])->name('username');
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [ProfileController::class, 'show'])->name('me.show');
        Route::patch('me', [ProfileController::class, 'update'])->name('me.update');
        Route::delete('me', [ProfileController::class, 'destroy'])->name('me.destroy');
        Route::put('me/username', [UsernameController::class, 'update'])->name('me.username.update');
        Route::put('me/password', [PasswordController::class, 'update'])->name('me.password.update');

        Route::middleware('onboarded')->group(function () {
            Route::get('challenge', [ChallengeController::class, 'show'])->name('challenge.show');
            Route::post('challenges', [ChallengeController::class, 'store'])->name('challenges.store');
            Route::put('challenge/check-ins', [CheckInController::class, 'update'])->name('challenge.check-ins.update');
            Route::patch('challenge/days/{date}', [DayLogController::class, 'update'])->name('challenge.days.update');
            Route::post('challenge/photos', [ProgressPhotoController::class, 'store'])->name('challenge.photos.store');
            Route::get('challenge/photos/{photo}', [ProgressPhotoController::class, 'show'])->name('challenge.photos.show');
            Route::delete('challenge/photos/{photo}', [ProgressPhotoController::class, 'destroy'])->name('challenge.photos.destroy');
        });
    });
});
