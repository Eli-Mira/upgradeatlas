<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Evidence;
use App\Services\Audit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminEvidenceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Evidence::query()->with('source');

        if ($request->filled('source_id')) {
            $query->where('source_id', (int) $request->input('source_id'));
        }
        if ($request->filled('verification_status')) {
            $query->where('verification_status', $request->string('verification_status'));
        }

        return response()->json($query->orderBy('id')->paginate(max(1, min((int) $request->input('per_page', 50), 100))));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'source_id' => ['required', 'integer', 'exists:sources,id'],
            'locator' => ['nullable', 'string', 'max:512'],
            'concise_paraphrase' => ['required', 'string'],
            'fact_scope' => ['required', 'string', 'max:256'],
            'observed_at' => ['required', 'date'],
            // Only independently reviewed evidence may be marked verified;
            // a source's own claim about itself never certifies a fact.
            'verification_status' => ['required', 'string', Rule::in(['verified', 'unverified'])],
        ]);

        $evidence = DB::transaction(function () use ($data, $request) {
            $evidence = Evidence::create($data + [
                'reviewer_id' => $request->user()->id,
            ]);
            Audit::record(
                $request->user()->id,
                'evidence',
                $evidence->id,
                'create',
                null,
                $evidence->only(['source_id', 'fact_scope', 'verification_status', 'reviewer_id'])
            );

            return $evidence;
        });

        return response()->json($evidence, 201);
    }
}
