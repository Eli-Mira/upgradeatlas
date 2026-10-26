<?php

namespace Database\Factories;

use App\Models\Gpu;
use Illuminate\Database\Eloquent\Factories\Factory;

class GpuFactory extends Factory
{
    protected $model = Gpu::class;

    public function definition(): array
    {
        return [
            'maker' => $this->faker->randomElement(['Intel', 'AMD', 'NVIDIA']),
            'model' => $this->faker->word() . '-' . $this->faker->numerify('###'),
            'vram_gb' => $this->faker->randomElement([4, 8, 12, 16]),
            'tgp_w' => $this->faker->randomElement([30, 45, 60, 80]),
        ];
    }
}