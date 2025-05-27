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
            'account_category' => $this->faker->randomElement(ChartOfAccount::getAvailableCategories()),
            'account_type' => $this->faker->randomElement(ChartOfAccount::getAvailableTypes()),
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
            'account_type' => ChartOfAccount::TYPE_GENERAL,
        ]);
    }

    public function subAccount(?int $headerAccountId = null): static
    {
        return $this->state([
            'level' => $this->faker->numberBetween(2, ChartOfAccount::MAX_LEVEL),
            'account_type' => ChartOfAccount::TYPE_DETAIL,
            'header_account_id' => $headerAccountId,
        ]);
    }

    public function general(): static
    {
        return $this->state(['account_type' => ChartOfAccount::TYPE_GENERAL]);
    }

    public function detail(): static
    {
        return $this->state(['account_type' => ChartOfAccount::TYPE_DETAIL]);
    }

    public function asset(): static
    {
        return $this->state(['account_category' => ChartOfAccount::CATEGORY_ASSET]);
    }

    public function liability(): static
    {
        return $this->state(['account_category' => ChartOfAccount::CATEGORY_LIABILITY]);
    }

    public function equity(): static
    {
        return $this->state(['account_category' => ChartOfAccount::CATEGORY_EQUITY]);
    }

    public function revenue(): static
    {
        return $this->state(['account_category' => ChartOfAccount::CATEGORY_REVENUE]);
    }

    public function costOfSales(): static
    {
        return $this->state(['account_category' => ChartOfAccount::CATEGORY_COST_OF_SALES]);
    }

    public function expenses(): static
    {
        return $this->state(['account_category' => ChartOfAccount::CATEGORY_EXPENSES]);
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