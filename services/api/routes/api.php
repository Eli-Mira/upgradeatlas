<?php

use App\Http\Controllers\Api\V1\LaptopController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/laptops', [LaptopController::class, 'index']);
    Route::get('/laptops/{sku}', [LaptopController::class, 'show']);
});
