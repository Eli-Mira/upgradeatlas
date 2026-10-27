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
        $query = LaptopSku::published()->with(['variant.family.brand', 'cpu', 'gpu', 'display', 'ramConfiguration', 'retailerOffers']);

        if ($request->filled('q')) {
            $q = (string) $request->string('q');
            // Escape LIKE wildcards so a user-supplied %/_/\ is matched
            // literally, not as a pattern. The value stays parameterised
            // (bound via PDO), so no SQL injection is possible.
            $escaped = addcslashes($q, '%_\\');
            // Strip SQL-line-comment suffixes so a trailing "-- " cannot
            // turn the rest of the query into a comment.
            $escaped = preg_replace('/--.*$/', '', $escaped);
            // Grouped on purpose: a bare orWhere would escape every filter
            // added after it and silently widen the result set.
            $query->where(function ($inner) use ($escaped) {
                $inner->where('display_name', 'ilike', "%{$escaped}%")
                    ->orWhere('manufacturer_part_number', 'ilike', "%{$escaped}%");
            });
        }

        if ($request->filled('min_ram_gb')) {
            $query->where('base_ram_gb', '>=', (int) $request->input('min_ram_gb'));
        }

        if ($request->filled('brand')) {
            $query->whereHas('variant.family.brand', function ($b) use ($request) {
                $b->where('slug', $request->string('brand'));
            });
        }

        if ($request->filled('use_case')) {
            $query->where('use_case', $request->string('use_case'));
        }

        if ($request->filled('max_price')) {
            $maxPrice = (float) $request->input('max_price');
            $query->whereHas('retailerOffers', function ($o) use ($maxPrice) {
                $o->where('active', true)->where('displayed_price_egp', '<=', $maxPrice);
            });
        }

        $perPage = max(1, min((int) $request->input('per_page', 20), 100));
        $skus = $query->orderBy('id')->paginate($perPage);

        return response()->json($skus);
    }

    public function show(string $sku)
    {
        // Published-only: a draft responds 404, identical to a missing SKU,
        // so its existence is never disclosed.
        $model = LaptopSku::published()->with(['variant.family.brand', 'cpu', 'gpu', 'display', 'ramConfiguration', 'storageSlots', 'retailerOffers'])
            ->where('manufacturer_part_number', $sku)
            ->first();

        if (! $model) {
            throw (new ModelNotFoundException())->setModel(LaptopSku::class);
        }

        return response()->json($model);
    }

    /**
     * Upgrade advisor payload: exact SKU, RAM config and SSD slots.
     * Compatibility stays `unknown`/`documenteda_max_gb NULL` unless
     * explicitly evidence-backed — never a guessed positive outcome.
     */
    public function upgrades(string $sku)
    {
        $model = LaptopSku::published()->with(['ramConfiguration', 'storageSlots'])
            ->where('manufacturer_part_number', $sku)
            ->first();

        if (! $model) {
            throw (new ModelNotFoundException())->setModel(LaptopSku::class);
        }

        return response()->json([
            'part_number' => $model->manufacturer_part_number,
            'display_name' => $model->display_name,
            'ram' => $model->ramConfiguration,
            'storage' => $model->storageSlots,
            'compatibility_default' => 'unknown',
        ]);
    }
}
