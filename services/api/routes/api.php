<?php

use App\Http\Controllers\Api\V1\LaptopController;
use App\Http\Controllers\Api\V1\UpgradeCostController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/upgrade-or-replace', UpgradeCostController::class);
    Route::get('/laptops', [LaptopController::class, 'index']);
    Route::get('/laptops/{sku}', [LaptopController::class, 'show']);
    Route::get('/laptops/{sku}/upgrades', [LaptopController::class, 'upgrades']);
});
