<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Source;
use App\Services\Audit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminSourceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Source::query()->withCount('evidence');

        if ($request->filled('usage_permission_status')) {
            $query->where('usage_permission_status', $request->string('usage_permission_status'));
        }

        return response()->json($query->orderBy('id')->paginate(max(1, min((int) $request->input('per_page', 50), 100))));
    }

    public function store(Request $request): JsonResponse
    {
        // The URL is only shape-validated here; nothing ever fetches it
        // from the API process, so there is no SSRF surface. Usage
        // permission is recorded explicitly — supplied descriptions are
        // never treated as proof of a license.
        $data = $request->validate([
            'url' => ['required', 'url', 'max:2048', Rule::unique('sources', 'url')],
            'source_type' => ['required', 'string', 'max:64'],
            'publisher' => ['nullable', 'string', 'max:256'],
            'usage_permission_status' => ['required', 'string', Rule::in(['permitted', 'unclear', 'not_permitted'])],
            'last_accessed_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $source = DB::transaction(function () use ($data, $request) {
            $source = Source::create($data);
            Audit::record(
                $request->user()->id,
                'sources',
                $source->id,
                'create',
                null,
                $source->only(['url', 'source_type', 'usage_permission_status'])
            );

            return $source;
        });

        return response()->json($source, 201);
    }
}
