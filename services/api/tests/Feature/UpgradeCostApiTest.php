<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class UpgradeCostApiTest extends TestCase
{
    private function costs(): array
    {
        return [
            'ram_cost_egp' => '2000',
            'ssd_cost_egp' => '0',
            'installation_cost_egp' => '400',
            'replacement_cost_egp' => '45000',
        ];
    }

    public function test_documented_example_is_cost_only_and_does_not_query_database(): void
    {
        $queries = [];
        DB::listen(function ($query) use (&$queries) { $queries[] = $query->sql; });
        $this->postJson('/api/v1/upgrade-or-replace', $this->costs())
            ->assertOk()->assertExactJson([
                'currency' => 'EGP',
                'input_source' => 'user_entered',
                'upgrade_total_egp' => '2400.00',
                'replacement_total_egp' => '45000.00',
                'cost_difference_egp' => '42600.00',
                'lower_cost_option' => 'upgrade',
                'compatibility_assessed' => false,
                'performance_equivalence_assessed' => false,
            ]);
        $this->assertSame([], $queries);
    }

    public function test_decimal_arithmetic_is_exact(): void
    {
        $this->postJson('/api/v1/upgrade-or-replace', [
            'ram_cost_egp' => '0.10', 'ssd_cost_egp' => '0.2',
            'installation_cost_egp' => '0', 'replacement_cost_egp' => '0.30',
        ])->assertOk()->assertJsonPath('upgrade_total_egp', '0.30')
            ->assertJsonPath('cost_difference_egp', '0.00')
            ->assertJsonPath('lower_cost_option', 'equal');
    }

    public function test_replacement_can_cost_less_without_being_a_performance_recommendation(): void
    {
        $costs = $this->costs();
        $costs['replacement_cost_egp'] = '100';
        $this->postJson('/api/v1/upgrade-or-replace', $costs)
            ->assertOk()->assertJsonPath('cost_difference_egp', '-2300.00')
            ->assertJsonPath('lower_cost_option', 'replacement')
            ->assertJsonPath('performance_equivalence_assessed', false);
    }

    public function test_all_zero_costs_are_explicitly_valid(): void
    {
        $this->postJson('/api/v1/upgrade-or-replace', array_fill_keys(array_keys($this->costs()), '0'))
            ->assertOk()->assertJsonPath('upgrade_total_egp', '0.00')
            ->assertJsonPath('lower_cost_option', 'equal');
    }

    public function test_maximum_values_do_not_overflow(): void
    {
        $this->postJson('/api/v1/upgrade-or-replace', array_fill_keys(array_keys($this->costs()), '9999999.99'))
            ->assertOk()->assertJsonPath('upgrade_total_egp', '29999999.97')
            ->assertJsonPath('cost_difference_egp', '-19999999.98');
    }

    public function test_one_piaster_negative_difference_keeps_its_sign(): void
    {
        $this->postJson('/api/v1/upgrade-or-replace', [
            'ram_cost_egp' => '0.01', 'ssd_cost_egp' => '0',
            'installation_cost_egp' => '0', 'replacement_cost_egp' => '0',
        ])->assertOk()->assertJsonPath('cost_difference_egp', '-0.01');
    }

    public function test_all_costs_are_required(): void
    {
        $this->postJson('/api/v1/upgrade-or-replace', [])
            ->assertUnprocessable()->assertJsonValidationErrors(array_keys($this->costs()));
    }

    #[DataProvider('invalidAmounts')]
    public function test_each_cost_rejects_invalid_or_ambiguous_input(mixed $amount): void
    {
        foreach (array_keys($this->costs()) as $field) {
            $costs = $this->costs();
            $costs[$field] = $amount;
            $this->postJson('/api/v1/upgrade-or-replace', $costs)
                ->assertUnprocessable()->assertJsonValidationErrors($field);
        }
    }

    public static function invalidAmounts(): array
    {
        return [
            'negative' => ['-1'], 'precision' => ['0.001'], 'exponent' => ['1e3'],
            'comma' => ['1,000'], 'non-number' => ['abc'], 'missing' => [null],
            'blank' => [''], 'array' => [[]], 'numeric JSON' => [1.2], 'boolean' => [true],
            'infinity' => ['INF'], 'leading zero' => ['01'], 'too large' => ['10000000'],
            'decimal point' => ['.5'], 'plus sign' => ['+1'], 'nan' => ['NaN'],
        ];
    }
}
