<?php

namespace Modules\AccountingSetup\Database\Factories;

use App\Models\ChartOfAccount;
use Illuminate\Database\Eloquent\Factories\Factory;

class ChartOfAccountFactory extends Factory
{
    protected $model = ChartOfAccount::class;

    public function definition(): array
    {
        return [
            'company_id' => 1,
            'account_code' => $this->faker->unique()->numerify('####'),
            'account_name' => $this->faker->words(3, true),
            'account_type' => $this->faker->randomElement(['Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses']),
            'account_nature' => $this->faker->randomElement([ChartOfAccount::NATURE_GENERAL, ChartOfAccount::NATURE_DETAIL]),
            'is_contra_account' => $this->faker->boolean(20),
            'level' => $this->faker->numberBetween(ChartOfAccount::MIN_LEVEL, ChartOfAccount::MAX_LEVEL),
            'header_account_id' => null,
            'description' => $this->faker->optional()->sentence(),
            'is_active' => $this->faker->boolean(90),
        ];
    }

    public function topLevel(): static
    {
        return $this->state([
            'level' => ChartOfAccount::MIN_LEVEL,
            'header_account_id' => null,
            'account_nature' => ChartOfAccount::NATURE_GENERAL,
        ]);
    }

    public function subAccount(?int $headerAccountId = null): static
    {
        return $this->state([
            'level' => $this->faker->numberBetween(2, ChartOfAccount::MAX_LEVEL),
            'account_nature' => ChartOfAccount::NATURE_DETAIL,
            'header_account_id' => $headerAccountId,
        ]);
    }

    public function active(): static
    {
        return $this->state(['is_active' => true]);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }

    public function contra(): static
    {
        return $this->state(['is_contra_account' => true]);
    }
}