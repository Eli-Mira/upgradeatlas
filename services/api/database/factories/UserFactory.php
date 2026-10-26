<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    protected $model = User::class;

    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),
            'hashed_password' => static::$password ??= Hash::make('password'),
            'external_auth_id' => null,
            'display_name' => fake()->name(),
            'locale' => fake()->randomElement(['ar', 'en']),
            'role' => 'editor',
        ];
    }

    public function admin(): static
    {
        return $this->state(fn () => ['role' => 'admin']);
    }

    public function editor(): static
    {
        return $this->state(fn () => ['role' => 'editor']);
    }
}
