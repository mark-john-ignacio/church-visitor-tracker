<?php

namespace Modules\AccountingSetup\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ChartOfAccountController extends Controller
{
    private const ALLOWED_SORT_COLUMNS = ['account_code', 'account_name', 'account_type', 'created_at', 'is_active'];
    private const ITEMS_PER_PAGE = 15;
    private const MAX_ACCOUNT_LEVEL = 5;

    public function index(Request $request)
    {
        $query = ChartOfAccount::query()->with('headerAccount');
        
        $this->applySearch($query, $request->search);
        $this->applySorting($query, $request->sort, $request->order);
        
        $accounts = $query->paginate(self::ITEMS_PER_PAGE)->withQueryString();
        
        return Inertia::render('accounting-setup/chart-of-accounts/index', [
            'accounts' => $accounts,
        ]);
    }
    
    public function create()
    {
        $companyId = tenant()->id;
        $headerAccounts = $this->getEligibleHeaderAccounts($companyId);
        
        return Inertia::render('accounting-setup/chart-of-accounts/create', [
            'headerAccounts' => $headerAccounts,
        ]);
    }
    
    public function store(Request $request)
    {
        $companyId = tenant()->id;
        $validated = $this->validateAccountData($request, $companyId);
        
        $this->validateHeaderAccountLogic($validated);
        
        ChartOfAccount::create(array_merge($validated, ['company_id' => $companyId]));

        return redirect()->route('accounting-setup.chart-of-accounts.index')
            ->with('success', 'Account created successfully');
    }
    
    public function edit(ChartOfAccount $chartOfAccount) 
    {
        $this->ensureAccountBelongsToCompany($chartOfAccount);
        
        $companyId = tenant()->id;
        $headerAccounts = $this->getEligibleHeaderAccounts($companyId, $chartOfAccount->id);

        return Inertia::render('accounting-setup/chart-of-accounts/edit', [
            'account' => $chartOfAccount->load('headerAccount'), 
            'headerAccounts' => $headerAccounts,
        ]);
    }
    
    public function update(Request $request, ChartOfAccount $chartOfAccount)
    {
        $this->ensureAccountBelongsToCompany($chartOfAccount);
        
        $companyId = tenant()->id;
        $validated = $this->validateAccountData($request, $companyId, $chartOfAccount);
        
        $this->validateHeaderAccountLogic($validated);
        Log::info('Updating ChartOfAccount', [
            'id' => $chartOfAccount->id,
            'company_id' => $companyId,
            'validated_data' => $validated
        ]);
        
        return $this->performUpdate($chartOfAccount, $validated);
    }
    
    public function destroy(ChartOfAccount $chartOfAccount)
    {
        $this->ensureAccountBelongsToCompany($chartOfAccount);
        
        $chartOfAccount->delete();
        
        return redirect()->route('accounting-setup.chart-of-accounts.index')
            ->with('success', 'Account deleted successfully');
    }

    private function applySearch($query, $search)
    {
        if (empty($search)) {
            return;
        }

        $query->where(function ($q) use ($search) {
            $q->where('account_code', 'like', "%{$search}%")
              ->orWhere('account_name', 'like', "%{$search}%")
              ->orWhere('account_type', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    private function applySorting($query, $sort, $order)
    {
        if (empty($sort)) {
            $query->latest();
            return;
        }

        $sortDirection = in_array($order, ['asc', 'desc']) ? $order : 'asc';
        
        if (in_array($sort, self::ALLOWED_SORT_COLUMNS)) {
            $query->orderBy($sort, $sortDirection);
        } else {
            $query->latest();
        }
    }

    private function validateAccountData(Request $request, $companyId, $chartOfAccount = null)
    {
        return $request->validate([
            'account_code' => [
                'required',
                'string',
                'max:50',
                function ($attribute, $value, $fail) use ($companyId, $chartOfAccount) {
                    $query = ChartOfAccount::where('company_id', $companyId)
                        ->where('account_code', $value);
                    
                    if ($chartOfAccount) {
                        $query->where('id', '!=', $chartOfAccount->id);
                    }
                    
                    if ($query->exists()) {
                        $fail('The account code has already been taken for this company.');
                    }
                }
            ],
            'account_name' => 'required|string|max:255',
            'account_type' => 'required|string|max:50',
            'account_nature' => 'required|in:General,Detail',
            'is_contra_account' => 'required|boolean',
            'level' => 'required|integer|min:1|max:' . self::MAX_ACCOUNT_LEVEL,
            'header_account_id' => 'nullable|exists:chart_of_accounts,id,company_id,' . $companyId,
            'description' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);
    }

    private function validateHeaderAccountLogic(array &$validated)
    {
        if ($validated['level'] == 1) {
            $validated['header_account_id'] = null;
        } elseif (empty($validated['header_account_id']) && $validated['level'] > 1) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['header_account_id' => 'Header account is required for sub-accounts.']);
        }
    }

    private function ensureAccountBelongsToCompany(ChartOfAccount $chartOfAccount)
    {
        if ($chartOfAccount->company_id !== tenant()->id) {
            abort(403, 'Unauthorized action');
        }
    }

    private function performUpdate(ChartOfAccount $chartOfAccount, array $validated)
    {
        Log::info('Attempting to update ChartOfAccount', [
            'id' => $chartOfAccount->id,
            'company_id' => tenant()->id
        ]);

        $chartOfAccount->fill($validated);
        $dirtyAttributes = $chartOfAccount->getDirty();

        if (empty($dirtyAttributes)) {
            Log::info('No changes detected for ChartOfAccount', ['id' => $chartOfAccount->id]);
            return redirect()->route('accounting-setup.chart-of-accounts.index')
                ->with('success', 'Account details are already up to date.');
        }

        Log::debug('Updating ChartOfAccount', [
            'id' => $chartOfAccount->id,
            'dirty_attributes' => $dirtyAttributes
        ]);

        try {
            if (!$chartOfAccount->save()) {
                Log::error('ChartOfAccount save() returned false', ['id' => $chartOfAccount->id]);
                return redirect()->back()
                    ->withInput()
                    ->with('error', 'Failed to update account. Please check logs.');
            }

            Log::info('ChartOfAccount updated successfully', ['id' => $chartOfAccount->id]);
            return redirect()->route('accounting-setup.chart-of-accounts.index')
                ->with('success', 'Account updated successfully');

        } catch (\Exception $e) {
            Log::error('Exception during ChartOfAccount update', [
                'id' => $chartOfAccount->id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()
                ->withInput()
                ->with('error', 'An unexpected error occurred while updating the account.');
        }
    }

    protected function getEligibleHeaderAccounts($companyId, $currentAccountId = null)
    {
        $query = ChartOfAccount::where('company_id', $companyId)
            ->where('account_nature', 'General')
            ->orderBy('account_code');
                       
        if ($currentAccountId) {
            $query->where('id', '!=', $currentAccountId);
        }
        
        return $query->get();
    }
}