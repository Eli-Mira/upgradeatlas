<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LaptopSku;
use App\Models\RamConfiguration;
use App\Models\StorageSlot;
use App\Services\Audit;
use App\Services\PublicationGate;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminSkuController extends Controller
{
    public function __construct(private PublicationGate $gate)
    {
    }

    /**
     * Admin listing: all statuses, unlike the public gate. Status is
     * never changed here — only via publish/retire.
     */
    public function index(Request $request): JsonResponse
    {
        $query = LaptopSku::with(['variant.family.brand', 'cpu', 'gpu', 'display']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('q')) {
            $escaped = addcslashes((string) $request->string('q'), '%_\\');
            $query->where(function ($inner) use ($escaped) {
                $inner->where('display_name', 'ilike', "%{$escaped}%")
                    ->orWhere('manufacturer_part_number', 'ilike', "%{$escaped}%");
            });
        }

        $perPage = min((int) $request->input('per_page', 50), 100);

        return response()->json($query->orderBy('id')->paginate($perPage));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateSku($request);

        $sku = DB::transaction(function () use ($data, $request) {
            // Status is server-owned: drafts are the only entry state.
            $sku = LaptopSku::create($data + ['status' => 'draft']);
            Audit::record(
                $request->user()->id,
                'laptop_skus',
                $sku->id,
                'create',
                null,
                $sku->only(['variant_id', 'manufacturer_part_number', 'display_name', 'status', 'use_case'])
            );

            return $sku;
        });

        return response()->json($sku, 201);
    }

    public function update(Request $request, LaptopSku $sku): JsonResponse
    {
        if ($request->filled('status')) {
            return response()->json([
                'message' => 'Status changes go through /publish and /retire, not direct edits.',
            ], 422);
        }

        $data = $this->validateSku($request, ignorePartNumberId: $sku->id, partial: true);

        $sku = DB::transaction(function () use ($sku, $data, $request) {
            $old = $sku->only(array_keys($data));
            $sku->fill($data)->save();
            Audit::record($request->user()->id, 'laptop_skus', $sku->id, 'update', $old, $sku->only(array_keys($data)));

            return $sku;
        });

        return response()->json($sku);
    }

    public function publish(Request $request, LaptopSku $sku): JsonResponse
    {
        // Publication is a state transition, not an idempotent set: a
        // second publish on a published SKU is refused so repeated or
        // racing requests cannot fabricate new audit "publish" events.
        if ($sku->status === 'published') {
            return response()->json(['message' => 'SKU is already published.'], 409);
        }

        $reasons = $this->gate->blocks($sku);
        if ($reasons !== []) {
            return response()->json(['message' => 'Publication blocked.', 'blocked_by' => $reasons], 409);
        }

        $sku = DB::transaction(function () use ($sku, $request) {
            $old = $sku->only(['status']);
            $sku->status = 'published';
            $sku->save();
            Audit::record($request->user()->id, 'laptop_skus', $sku->id, 'publish', $old, ['status' => 'published']);

            return $sku;
        });

        return response()->json($sku);
    }

    public function retire(Request $request, LaptopSku $sku): JsonResponse
    {
        if ($sku->status === 'retired') {
            return response()->json(['message' => 'SKU is already retired.'], 409);
        }

        $sku = DB::transaction(function () use ($sku, $request) {
            $old = $sku->only(['status']);
            $sku->status = 'retired';
            $sku->save();
            Audit::record($request->user()->id, 'laptop_skus', $sku->id, 'retire', $old, ['status' => 'retired']);

            return $sku;
        });

        return response()->json($sku);
    }

    public function upsertRamConfiguration(Request $request, LaptopSku $sku): JsonResponse
    {
        $data = $request->validate([
            'soldered_gb' => ['nullable', 'integer', 'min:0'],
            'slot_count' => ['nullable', 'integer', 'min:0', 'max:16'],
            'occupied_slot_count' => ['nullable', 'integer', 'min:0', 'max:16'],
            'standard' => ['nullable', 'string', 'max:64'],
            'documented_max_gb' => ['nullable', 'integer', 'min:0'],
            // PRD §7: keep the documented/tested limit distinct from a hard
            // limit. Unknown stays a valid, preferred-when-unproven value.
            'max_meaning' => ['required', 'string', Rule::in(['manufacturer_tested', 'hard_limit', 'unknown'])],
            'disassembly_risk_notes' => ['nullable', 'string'],
            'warranty_notes' => ['nullable', 'string'],
            'evidence_id' => ['nullable', 'exists:evidence,id'],
        ]);

        if (($data['occupied_slot_count'] ?? null) !== null && ($data['slot_count'] ?? null) !== null
            && $data['occupied_slot_count'] > $data['slot_count']) {
            return response()->json(['message' => 'occupied_slot_count cannot exceed slot_count.'], 422);
        }

        [$ram, $existed] = DB::transaction(function () use ($sku, $data, $request) {
            $existing = RamConfiguration::where('sku_id', $sku->id)->first();
            $old = $existing?->only(array_keys($data));
            $ram = RamConfiguration::updateOrCreate(['sku_id' => $sku->id], $data);
            Audit::record(
                $request->user()->id,
                'ram_configurations',
                $ram->id,
                $existing ? 'update' : 'create',
                $old,
                $ram->only(array_keys($data))
            );

            return [$ram, $existing !== null];
        });

        return response()->json($ram, $existed ? 200 : 201);
    }

    public function storeStorageSlot(Request $request, LaptopSku $sku): JsonResponse
    {
        $data = $request->validate([
            'slot_index' => ['required', 'integer', 'min:1'],
            'form_factor' => ['nullable', 'string', 'max:32'],
            'protocol' => ['required', 'string', Rule::in(['NVMe', 'SATA', 'both', 'unknown'])],
            'pcie_generation' => ['nullable', 'string', 'max:16'],
            'occupied_status' => ['required', 'string', Rule::in(['occupied', 'free', 'unknown'])],
            'constraints_text' => ['nullable', 'string'],
            'evidence_id' => ['nullable', 'exists:evidence,id'],
        ]);

        try {
            $slot = DB::transaction(function () use ($sku, $data, $request) {
                $slot = StorageSlot::create($data + ['sku_id' => $sku->id]);
                Audit::record(
                    $request->user()->id,
                    'storage_slots',
                    $slot->id,
                    'create',
                    null,
                    $slot->only(['sku_id', 'slot_index', 'protocol', 'occupied_status'])
                );

                return $slot;
            });
        } catch (UniqueConstraintViolationException) {
            return response()->json(['message' => 'A storage slot with this index already exists for the SKU.'], 409);
        }

        return response()->json($slot, 201);
    }

    /**
     * @return array<string, mixed> validated editable fields only
     */
    private function validateSku(Request $request, ?int $ignorePartNumberId = null, bool $partial = false): array
    {
        $uniquePartNumber = Rule::unique('laptop_skus', 'manufacturer_part_number');
        if ($ignorePartNumberId !== null) {
            $uniquePartNumber->ignore($ignorePartNumberId);
        }

        // PATCH updates are partial: fields absent from the payload keep
        // their stored values instead of failing "required".
        $present = fn (array $rules) => $partial ? ['sometimes', ...$rules] : $rules;

        return $request->validate([
            'variant_id' => $present(['required', 'integer', 'exists:laptop_variants,id']),
            'manufacturer_part_number' => $present(['required', 'string', 'max:128', $uniquePartNumber]),
            'display_name' => $present(['required', 'string', 'max:256']),
            'cpu_id' => $present(['nullable', 'integer', 'exists:cpus,id']),
            'gpu_id' => $present(['nullable', 'integer', 'exists:gpus,id']),
            'display_id' => $present(['nullable', 'integer', 'exists:displays,id']),
            'base_ram_gb' => $present(['nullable', 'integer', 'min:0']),
            'base_storage_gb' => $present(['nullable', 'integer', 'min:0']),
            'mass_g' => $present(['nullable', 'integer', 'min:0']),
            'use_case' => $present(['nullable', 'string', Rule::in(['gaming', 'programming', 'study', 'content_creation', 'business'])]),
        ]);
    }
}
