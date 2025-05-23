<?php

namespace Modules\AccountingSetup\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChartOfAccountController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        
        $query = ChartOfAccount::query();
        
        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('account_code', 'like', "%{$search}%")
                  ->orWhere('account_name', 'like', "%{$search}%")
                  ->orWhere('account_type', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('sort') && !empty($request->sort)) {
            $sortColumn = $request->sort;
            $sortDirection = $request->order ?? 'asc';
            
            // Validate sort direction
            if (!in_array($sortDirection, ['asc', 'desc'])) {
                $sortDirection = 'asc';
            }
            
            // List of allowed sortable columns for security
            $allowedColumns = ['account_code', 'account_name', 'account_type', 'created_at', 'is_active'];
            
            if (in_array($sortColumn, $allowedColumns)) {
                $query->orderBy($sortColumn, $sortDirection);
            } else {
                // Default sort if invalid column provided
                $query->latest();
            }
        } else {
            // Default sort by created_at desc
            $query->latest();
        }

        $query->with('headerAccount'); 
        
        // Pagination
        $accounts = $query->paginate(15)->withQueryString();
        
        return Inertia::render('accounting-setup/chart-of-accounts/index', [
            'accounts' => $accounts,
        ]);
    }
    
    /**
     * Show the form for creating a new resource.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        $companyId = tenant()->id;
        $headerAccounts = $this->getEligibleHeaderAccounts($companyId);
        return Inertia::render('accounting-setup/chart-of-accounts/create', [
            'headerAccounts' => $headerAccounts,
        ]);
    }
    
    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $companyId = tenant()->id;
        $validated = $request->validate([
            'account_code' => [
                'required',
                'string',
                'max:50',
                function ($attribute, $value, $fail) use ($companyId) {
                    if (ChartOfAccount::where('company_id', $companyId)->where('account_code', $value)->exists()) {
                        $fail('The account code has already been taken for this company.');
                    }
                }
            ],
            'account_name' => 'required|string|max:255',
            'account_type' => 'required|string|max:50', 
            'account_nature' => 'required|in:General,Detail', 
            'is_contra_account' => 'required|boolean', 
            'level' => 'required|integer|min:1|max:5', 
            'header_account_id' => 'nullable|exists:chart_of_accounts,id,company_id,' . $companyId, 
            'description' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);

        if ($validated['level'] == 1) {
            $validated['header_account_id'] = null;
        } elseif (empty($validated['header_account_id']) && $validated['level'] > 1) {
            return redirect()->back()->withErrors(['header_account_id' => 'Header account is required for sub-accounts.']);
        }
        
        ChartOfAccount::create(array_merge($validated, ['company_id' => $companyId]));

        return redirect()->route('accounting-setup.chart-of-accounts.index')
            ->with('success', 'Account created successfully');
    }
    
    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\ChartOfAccount  $chartOfAccount
     * @return \Inertia\Response
     */
    public function edit(ChartOfAccount $chartOfAccount) 
    {
        $companyId = tenant()->id;
        if ($chartOfAccount->company_id !== $companyId) {
            abort(403, 'Unauthorized action.');
        }
        $headerAccounts = $this->getEligibleHeaderAccounts($companyId, $chartOfAccount->id);

        return Inertia::render('accounting-setup/chart-of-accounts/edit', [
            'account' => $chartOfAccount->load('headerAccount'), 
            'headerAccounts' => $headerAccounts,
        ]);
    }
    
    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\ChartOfAccount  $chartOfAccount
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, ChartOfAccount $chartOfAccount)
    {
        // Ensure the account belongs to the current tenant/company
        $companyId = tenant()->id;
        
        if ($chartOfAccount->company_id !== $companyId) {
            abort(403, 'Unauthorized action');
        }
        
        $validated = $request->validate([
            'account_code' => [
                'required',
                'string',
                'max:50',
                function ($attribute, $value, $fail) use ($companyId, $chartOfAccount) {
                    $exists = ChartOfAccount::where('account_code', $value)
                        ->where('id', '!=', $chartOfAccount->id)
                        ->exists();
                    
                    if ($exists) {
                        $fail('The account code has already been taken within this company.');
                    }
                }
            ],
            'account_name' => 'required|string|max:255',
            'account_type' => 'required|string|max:50', // e.g., Asset, Liability
            'account_nature' => 'required|in:General,Detail', // New
            'is_contra_account' => 'required|boolean', // New
            'level' => 'required|integer|min:1|max:5', // New
            'header_account_id' => 'nullable|exists:chart_of_accounts,id,company_id,' . $companyId, // New - ensure header exists for the same company
            'description' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);
        
        if ($validated['level'] == 1) {
            $validated['header_account_id'] = null;
        } elseif (empty($validated['header_account_id']) && $validated['level'] > 1) {
            return redirect()->back()->withErrors(['header_account_id' => 'Header account is required for sub-accounts.']);
        }

        $chartOfAccount->update($validated);

        return redirect()->route('accounting-setup.chart-of-accounts.index')
            ->with('success', 'Account updated successfully');
    }
    
    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\ChartOfAccount  $chartOfAccount
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(ChartOfAccount $chartOfAccount)
    {
        // Ensure the account belongs to the current tenant/company
        $companyId = tenant()->id;
        
        if ($chartOfAccount->company_id !== $companyId) {
            abort(403, 'Unauthorized action');
        }
        
        $chartOfAccount->delete();
        
        return redirect()->route('accounting-setup.chart-of-accounts.index');
    }

    protected function getEligibleHeaderAccounts($companyId, $currentAccountId = null)
    {
        $query = ChartOfAccount::where('company_id', $companyId)
                        ->where('account_nature', 'General')
                        ->orderBy('account_code');
                       
        if ($currentAccountId) {
            $query->where('id', '!=', $currentAccountId);
        }
        // dd($query->get(['id']), $currentAccountId); 
        
        return $query->get();
    }
}