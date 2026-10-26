<?php

namespace Database\Factories;

use App\Models\LaptopVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

class LaptopVariantFactory extends Factory
{
    protected $model = LaptopVariant::class;

    public function definition(): array
    {
        return [
            'family_id' => \App\Models\LaptopFamily::factory(),
            'manufacturer_model_code' => $this->faker->word() . '-' . $this->faker->numerify('##'),
            'region_code' => $this->faker->optional()->randomElement(['US', 'EU', 'JP', 'APAC']),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}