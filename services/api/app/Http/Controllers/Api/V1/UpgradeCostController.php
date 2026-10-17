<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpgradeCostRequest;
use Illuminate\Http\JsonResponse;

class UpgradeCostController extends Controller
{
    public function __invoke(UpgradeCostRequest $request): JsonResponse
    {
        $costs = array_map($this->piasters(...), $request->validated());
        $upgrade = $costs['ram_cost_egp'] + $costs['ssd_cost_egp'] + $costs['installation_cost_egp'];
        $replacement = $costs['replacement_cost_egp'];
        $difference = $replacement - $upgrade;

        return response()->json([
            'currency' => 'EGP',
            'input_source' => 'user_entered',
            'upgrade_total_egp' => $this->decimal($upgrade),
            'replacement_total_egp' => $this->decimal($replacement),
            'cost_difference_egp' => $this->decimal($difference),
            'lower_cost_option' => $difference > 0 ? 'upgrade' : ($difference < 0 ? 'replacement' : 'equal'),
            'compatibility_assessed' => false,
            'performance_equivalence_assessed' => false,
        ]);
    }

    private function piasters(string $amount): int
    {
        [$pounds, $fraction] = array_pad(explode('.', $amount, 2), 2, '');

        return ((int) $pounds * 100) + (int) str_pad($fraction, 2, '0');
    }

    private function decimal(int $piasters): string
    {
        $absolute = abs($piasters);

        return ($piasters < 0 ? '-' : '').intdiv($absolute, 100).'.'.str_pad((string) ($absolute % 100), 2, '0', STR_PAD_LEFT);
    }
}
