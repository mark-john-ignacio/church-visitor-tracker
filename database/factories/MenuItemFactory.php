<?php

namespace Database\Factories;

use App\Models\MenuItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MenuItem>
 */
class MenuItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = [MenuItem::TYPE_MAIN, MenuItem::TYPE_FOOTER, MenuItem::TYPE_USER];
        $icons = array_keys(MenuItem::getAvailableIcons());

        return [
            'name' => fake()->words(2, true),
            'route' => fake()->optional(0.8)->slug(),
            'icon' => fake()->optional(0.7)->randomElement($icons),
            'permission_name' => fake()->optional(0.6)->randomElement([
                'view_dashboard', 'manage_users', 'manage_settings', 'view_reports'
            ]),
            'parent_id' => null, // Will be set in states if needed
            'order' => fake()->numberBetween(1, 10),
            'type' => fake()->randomElement($types),
        ];
    }

    /**
     * Create a main navigation item.
     */
    public function main(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => MenuItem::TYPE_MAIN,
        ]);
    }

    /**
     * Create a footer navigation item.
     */
    public function footer(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => MenuItem::TYPE_FOOTER,
        ]);
    }

    /**
     * Create a user menu navigation item.
     */
    public function user(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => MenuItem::TYPE_USER,
        ]);
    }

    /**
     * Create a child navigation item with a specific parent.
     */
    public function child(?int $parentId = null): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => $parentId ?: MenuItem::factory()->create()->id,
        ]);
    }

    /**
     * Create a top-level item (no parent).
     */
    public function topLevel(): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => null,
        ]);
    }
}