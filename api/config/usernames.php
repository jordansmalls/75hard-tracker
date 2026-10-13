<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Username Format
    |--------------------------------------------------------------------------
    |
    | Usernames are stored lowercase. They must start with a letter and may
    | contain letters, numbers and single underscores in between.
    |
    */

    'min_length' => 3,

    'max_length' => 30,

    'pattern' => '/^[a-z](?:[a-z0-9]|_(?!_))*[a-z0-9]$/',

    /*
    |--------------------------------------------------------------------------
    | Reserved Usernames
    |--------------------------------------------------------------------------
    |
    | Names that can never be claimed, typically because they collide with
    | frontend routes or could be used to impersonate staff.
    |
    */

    'reserved' => [
        'about', 'account', 'accounts', 'admin', 'administrator', 'api', 'app',
        'auth', 'billing', 'challenge', 'challenges', 'blog', 'contact', 'dashboard', 'dev', 'docs', 'help',
        'home', 'info', 'insights', 'login', 'logout', 'mail', 'me', 'mod', 'moderator',
        'new', 'null', 'onboarding', 'owner', 'photos', 'privacy', 'register', 'root',
        'security', 'settings', 'signin', 'signout', 'signup', 'staff', 'status',
        'support', 'system', 'team', 'terms', 'test', 'today', 'undefined', 'user',
        'users', 'webmaster', 'www',
    ],

];
