<?php

use App\Http\Controllers\Api\V1\AdminAuthController;
use App\Http\Controllers\Api\V1\AdminEvidenceController;
use App\Http\Controllers\Api\V1\AdminSkuController;
use App\Http\Controllers\Api\V1\AdminSourceController;
use App\Http\Controllers\Api\V1\LaptopController;
use App\Http\Controllers\Api\V1\UpgradeCostController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/upgrade-or-replace', UpgradeCostController::class);
    Route::get('/laptops', [LaptopController::class, 'index']);
    Route::get('/laptops/{sku}', [LaptopController::class, 'show']);
    Route::get('/laptops/{sku}/upgrades', [LaptopController::class, 'upgrades']);

    Route::prefix('admin')->group(function () {
        // Token issuance is the only unauthenticated admin route; every
        // other admin route requires a Sanctum token AND the staff role
        // gate (server-enforced, not hidden buttons).
        Route::post('/token', [AdminAuthController::class, 'store']);
        Route::post('/token/logout', [AdminAuthController::class, 'destroy'])
            ->middleware('auth:sanctum');

        Route::middleware(['auth:sanctum', 'staff'])->group(function () {
            Route::get('/skus', [AdminSkuController::class, 'index']);
            Route::post('/skus', [AdminSkuController::class, 'store']);
            Route::patch('/skus/{sku}', [AdminSkuController::class, 'update']);
            Route::post('/skus/{sku}/publish', [AdminSkuController::class, 'publish']);
            Route::post('/skus/{sku}/retire', [AdminSkuController::class, 'retire']);
            Route::put('/skus/{sku}/ram-configuration', [AdminSkuController::class, 'upsertRamConfiguration']);
            Route::post('/skus/{sku}/storage-slots', [AdminSkuController::class, 'storeStorageSlot']);

            Route::get('/sources', [AdminSourceController::class, 'index']);
            Route::post('/sources', [AdminSourceController::class, 'store']);

            Route::get('/evidence', [AdminEvidenceController::class, 'index']);
            Route::post('/evidence', [AdminEvidenceController::class, 'store']);
        });
    });
});
