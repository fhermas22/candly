<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('swagger');
});

Route::get('/api/docs', function () {
    return view('swagger');
});
