<?php

namespace Database\Factories;

use App\Models\Cpu;
use Illuminate\Database\Eloquent\Factories\Factory;

class CpuFactory extends Factory
{
    protected $model = Cpu::class;

    public function definition(): array
    {
        return [
            'maker' => $this->faker->randomElement(['Intel', 'AMD', 'Apple']),
            'model' => $this->faker->word() . '-' . $this->faker->numerify('###'),
            'architecture' => $this->faker->randomElement(['x86-64', 'ARM64']),
            'cores' => $this->faker->randomElement([4, 6, 8, 10, 12]),
            'threads' => $this->faker->randomElement([4, 8, 12, 16, 20, 24]),
            'tdp_w' => $this->faker->randomElement([15, 28, 35, 45, 65]),
        ];
    }
}