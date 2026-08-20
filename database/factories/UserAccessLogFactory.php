<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserAccessLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserAccessLog>
 */
class UserAccessLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'event' => 'http.visit',
            'method' => 'GET',
            'url' => fake()->url(),
            'route_name' => 'dashboard',
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'payload' => null,
            'created_at' => now(),
        ];
    }
}
