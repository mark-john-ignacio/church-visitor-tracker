<?php

namespace Modules\AccountingSetup\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ChartOfAccountController extends Controller
{
    private const ITEMS_PER_PAGE = 15;

    public function index(Request $request): Response
    {
        $accounts = ChartOfAccount::query()
            ->search($request->search)
            ->when($request->sort && in_array($request->sort, ChartOfAccount::SORTABLE_COLUMNS), function ($query) use ($request) {
                $direction = in_array($request->order, ['asc', 'desc']) ? $request->order : 'asc';
                return $query->orderBy($request->sort, $direction);
            }, function ($query) {
                return $query->orderByCode();
            })
            ->paginate(self::ITEMS_PER_PAGE)
            ->withQueryString();

        return Inertia::render('accounting-setup/chart-of-accounts/index', [
            'accounts' => $accounts,
            'filters' => $request->only(['search', 'sort', 'order']),
        ]);
    }

    public function create(): Response
    {
        $headerAccounts = ChartOfAccount::getEligibleHeaderAccounts(tenant()->id);

        return Inertia::render('accounting-setup/chart-of-accounts/create', [
            'headerAccounts' => $headerAccounts,
            'accountCategories' => ChartOfAccount::getAvailableCategories(),
            'accountTypes' => ChartOfAccount::getAvailableTypes(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateAccountData($request);
        $this->processHeaderAccountLogic($validated);

        try {
            DB::transaction(function () use ($validated) {
                ChartOfAccount::create(array_merge($validated, [
                    'company_id' => tenant()->id
                ]));
            });

            return redirect()
                ->route('accounting-setup.chart-of-accounts.index')
                ->with('success', 'Account created successfully');

        } catch (\Exception $e) {
            Log::error('Failed to create chart of account', [
                'error' => $e->getMessage(),
                'data' => $validated
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to create account. Please try again.');
        }
    }

    public function edit(ChartOfAccount $chartOfAccount): Response
    {
        $this->authorizeAccountAccess($chartOfAccount);

        $headerAccounts = ChartOfAccount::getEligibleHeaderAccounts(
            tenant()->id, 
            $chartOfAccount->id
        );

        return Inertia::render('accounting-setup/chart-of-accounts/edit', [
            'account' => $chartOfAccount,
            'headerAccounts' => $headerAccounts,
            'accountCategories' => ChartOfAccount::getAvailableCategories(),
            'accountTypes' => ChartOfAccount::getAvailableTypes(),
        ]);
    }

    public function update(Request $request, ChartOfAccount $chartOfAccount): RedirectResponse
    {
        $this->authorizeAccountAccess($chartOfAccount);

        $validated = $this->validateAccountData($request, $chartOfAccount);
        $this->processHeaderAccountLogic($validated);

        try {
            DB::transaction(function () use ($chartOfAccount, $validated) {
                $chartOfAccount->fill($validated);

                if (!$chartOfAccount->isDirty()) {
                    return redirect()
                        ->route('accounting-setup.chart-of-accounts.index')
                        ->with('info', 'No changes were made to the account.');
                }

                $chartOfAccount->save();
            });

            return redirect()
                ->route('accounting-setup.chart-of-accounts.index')
                ->with('success', 'Account updated successfully');

        } catch (\Exception $e) {
            Log::error('Failed to update chart of account', [
                'id' => $chartOfAccount->id,
                'error' => $e->getMessage(),
                'data' => $validated
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to update account. Please try again.');
        }
    }

    public function destroy(ChartOfAccount $chartOfAccount): RedirectResponse
    {
        $this->authorizeAccountAccess($chartOfAccount);

        if (!$chartOfAccount->canBeDeleted()) {
            return back()->with('error', 'Cannot delete account with sub-accounts or transactions.');
        }

        try {
            DB::transaction(function () use ($chartOfAccount) {
                $chartOfAccount->delete();
            });

            return redirect()
                ->route('accounting-setup.chart-of-accounts.index')
                ->with('success', 'Account deleted successfully');

        } catch (\Exception $e) {
            Log::error('Failed to delete chart of account', [
                'id' => $chartOfAccount->id,
                'error' => $e->getMessage()
            ]);

            return back()->with('error', 'Failed to delete account. Please try again.');
        }
    }

    private function validateAccountData(Request $request, ?ChartOfAccount $account = null): array
    {
        $companyId = tenant()->id;

        return $request->validate([
            'account_code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('chart_of_accounts')
                    ->where('company_id', $companyId)
                    ->ignore($account?->id)
            ],
            'account_name' => 'required|string|max:255',
            'account_category' => ['required', Rule::in(ChartOfAccount::getAvailableCategories())],
            'account_type' => ['required', Rule::in(ChartOfAccount::getAvailableTypes())],
            'is_contra_account' => 'required|boolean',
            'level' => 'required|integer|min:' . ChartOfAccount::MIN_LEVEL . '|max:' . ChartOfAccount::MAX_LEVEL,
            'header_account_id' => [
                'nullable',
                Rule::exists('chart_of_accounts', 'id')->where('company_id', $companyId)
            ],
            'description' => 'nullable|string|max:1000',
            'is_active' => 'required|boolean',
        ]);
    }

    private function processHeaderAccountLogic(array &$validated): void
    {
        if ($validated['level'] == ChartOfAccount::MIN_LEVEL) {
            $validated['header_account_id'] = null;
        } elseif (empty($validated['header_account_id']) && $validated['level'] > ChartOfAccount::MIN_LEVEL) {
            throw new \InvalidArgumentException('Header account is required for sub-accounts.');
        }
    }

    private function authorizeAccountAccess(ChartOfAccount $chartOfAccount): void
    {
        if ($chartOfAccount->company_id !== tenant()->id) {
            abort(403, 'Unauthorized access to this account.');
        }
    }
}