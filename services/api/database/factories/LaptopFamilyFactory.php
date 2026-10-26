<?php

namespace Database\Factories;

use App\Models\LaptopFamily;
use Illuminate\Database\Eloquent\Factories\Factory;

class LaptopFamilyFactory extends Factory
{
    protected $model = LaptopFamily::class;

    public function definition(): array
    {
        return [
            'brand_id' => \App\Models\Brand::factory(),
            'family_name' => $this->faker->catchPhrase(),
            'slug' => $this->faker->unique()->slug(4),
            'launch_year' => $this->faker->year(),
        ];
    }
}