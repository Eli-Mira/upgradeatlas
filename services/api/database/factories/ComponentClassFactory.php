<?php

namespace Database\Factories;

use App\Models\ComponentClass;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ComponentClass>
 */
class ComponentClassFactory extends Factory
{
    protected $model = ComponentClass::class;

    public function definition(): array
    {
        return [
            'component_type' => $this->faker->randomElement(['ram', 'ssd']),
            'standard' => $this->faker->randomElement(['DDR4 SO-DIMM', 'DDR5 SO-DIMM', 'M.2 NVMe']),
            'form_factor' => $this->faker->randomElement(['SO-DIMM', 'M.2 2280']),
            'protocol' => $this->faker->optional()->randomElement(['NVMe', 'SATA']),
            'capacity_gb' => $this->faker->optional()->randomElement([8, 16, 32, 512, 1024]),
            'attributes' => null,
        ];
    }
}
