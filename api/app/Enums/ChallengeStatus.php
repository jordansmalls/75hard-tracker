<?php

namespace App\Enums;

enum ChallengeStatus: string
{
    case Active = 'active';
    case Abandoned = 'abandoned';
}
