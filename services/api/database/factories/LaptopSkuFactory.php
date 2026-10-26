<?php

namespace Database\Factories;

use App\Models\Cpu;
use App\Models\Display;
use App\Models\Gpu;
use App\Models\LaptopSku;
use App\Models\LaptopVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LaptopSku>
 */
class LaptopSkuFactory extends Factory
{
    protected $model = LaptopSku::class;

    public function definition(): array
    {
        $variant = LaptopVariant::factory()->create();

        return [
            'variant_id' => $variant->id,
            'manufacturer_part_number' => 'SKU-' . $this->faker->unique()->numerify('########'),
            'display_name' => $this->faker->catchPhrase(),
            'cpu_id' => Cpu::factory()->create()->id,
            'gpu_id' => Gpu::factory()->create()->id,
            'display_id' => Display::factory()->create()->id,
            'base_ram_gb' => $this->faker->randomElement([8, 12, 16, 32]),
            'base_storage_gb' => $this->faker->randomElement([256, 512, 1024]),
            'mass_g' => $this->faker->randomElement([1200, 1400, 1600, 1800]),
            // Publication contract (PRD §8): draft | review | published | retired.
            // Default is published so fixture SKUs appear on the public API;
            // non-public states are opt-in via the named states below.
            'status' => 'published',
            'use_case' => $this->faker->randomElement(['gaming', 'programming', 'study', 'content_creation', 'business']),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn () => ['status' => 'draft']);
    }

    public function published(): static
    {
        return $this->state(fn () => ['status' => 'published']);
    }

    public function review(): static
    {
        return $this->state(fn () => ['status' => 'review']);
    }

    public function retired(): static
    {
        return $this->state(fn () => ['status' => 'retired']);
    }
}