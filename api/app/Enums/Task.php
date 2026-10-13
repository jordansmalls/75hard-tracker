<?php

namespace App\Enums;

/**
 * The seven things a 75 Hard day requires.
 */
enum Task: string
{
    case Reading = 'reading';
    case Photo = 'photo';
    case Water = 'water';
    case WorkoutOne = 'workout_one';
    case WorkoutTwo = 'workout_two';
    case Diet = 'diet';
    case NoAlcohol = 'no_alcohol';
}
