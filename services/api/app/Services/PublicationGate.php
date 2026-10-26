<?php

namespace App\Services;

use App\Models\CompatibilityAssertion;
use App\Models\ConflictFlag;
use App\Models\LaptopSku;
use App\Models\RamConfiguration;
use App\Models\StorageSlot;

/**
 * Fail-closed publication gate (DECISIONS D17, PRD §7/§15): a SKU may
 * only become `published` when verified evidence is attached to it, its
 * compatibility assertions are reviewed, and no conflict is open.
 */
class PublicationGate
{
    /** @return string[] reasons the SKU is not publishable; empty means publishable */
    public function blocks(LaptopSku $sku): array
    {
        $reasons = [];

        $verifiedEvidence = static fn ($query) => $query
            ->whereHas('evidence', fn ($e) => $e->where('verification_status', 'verified'));

        $hasVerifiedEvidence =
            RamConfiguration::where('sku_id', $sku->id)->where($verifiedEvidence)->exists()
            || StorageSlot::where('sku_id', $sku->id)->where($verifiedEvidence)->exists()
            || CompatibilityAssertion::where('sku_id', $sku->id)->where($verifiedEvidence)->exists();

        if (! $hasVerifiedEvidence) {
            $reasons[] = 'No verified evidence is attached to this SKU (RAM configuration, storage slot or compatibility assertion).';
        }

        $unreviewed = CompatibilityAssertion::where('sku_id', $sku->id)
            ->where(fn ($q) => $q->whereNull('reviewed_at')->orWhereNull('reviewed_by'))
            ->count();
        if ($unreviewed > 0) {
            $reasons[] = $unreviewed.' compatibility assertion(s) lack review (reviewed_by/reviewed_at).';
        }

        $openConflicts = ConflictFlag::open()
            ->where('entity_type', 'laptop_skus')
            ->where('entity_id', $sku->id)
            ->count();
        if ($openConflicts > 0) {
            $reasons[] = $openConflicts.' open conflict flag(s) must be resolved first.';
        }

        return $reasons;
    }
}
