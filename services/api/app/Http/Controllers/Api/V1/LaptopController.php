<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LaptopSku;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class LaptopController extends Controller
{
    public function index(Request $request)
    {
        $query = LaptopSku::with(['variant.family.brand', 'cpu', 'gpu', 'display', 'ramConfiguration']);

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where('display_name', 'ilike', "%{$q}%")
                ->orWhere('manufacturer_part_number', 'ilike', "%{$q}%");
        }

        if ($request->filled('max_price')) {
            // Price filtering deferred until offer joins are implemented.
        }

        $perPage = min((int) $request->input('per_page', 20), 100);
        $skus = $query->orderBy('id')->paginate($perPage);

        return response()->json($skus);
    }

    public function show(string $sku)
    {
        $model = LaptopSku::with(['variant.family.brand', 'cpu', 'gpu', 'display', 'ramConfiguration', 'storageSlots'])
            ->where('manufacturer_part_number', $sku)
            ->first();

        if (! $model) {
            throw (new ModelNotFoundException())->setModel(LaptopSku::class);
        }

        return response()->json($model);
    }
}
