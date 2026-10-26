<?php

namespace Database\Factories;

use App\Models\Display;
use Illuminate\Database\Eloquent\Factories\Factory;

class DisplayFactory extends Factory
{
    protected $model = Display::class;

    public function definition(): array
    {
        return [
            'diagonal_inches' => $this->faker->randomFloat(1, 13, 17),
            'resolution_width' => $this->faker->randomElement([1920, 2560, 2880, 3456]),
            'resolution_height' => $this->faker->randomElement([1080, 1440, 1660, 1920]),
            'refresh_hz' => $this->faker->randomElement([60, 90, 120, 165]),
            'panel_type' => $this->faker->randomElement(['IPS', 'OLED', 'Mini-LED']),
            'color_gamut' => $this->faker->randomElement(['sRGB', 'DCI-P3']),
            'brightness_nits' => $this->faker->randomElement([300, 400, 500, 600, 1000]),
        ];
    }
}