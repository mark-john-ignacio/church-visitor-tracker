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
        
        // Pagination
        $accounts = $query->paginate(15)->withQueryString();
        
        return Inertia::render('masterfiles/chart-of-accounts/index', [
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
        return Inertia::render('masterfiles/chart-of-accounts/create');
    }
    
    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        
        $validated = $request->validate([
            'account_code' => [
                'required',
                'string',
                'max:50',
                // Ensure account code is unique within this company
                function ($attribute, $value, $fail) {
                    $exists = ChartOfAccount::where('account_code', $value)
                        ->exists();
                    
                    if ($exists) {
                        $fail('The account code has already been taken within this company.');
                    }
                }
            ],
            'account_name' => 'required|string|max:255',
            'account_type' => 'required|string|max:50',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
        
        ChartOfAccount::create($validated);
        
        return redirect()->route('masterfiles.chart-of-accounts.index')
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
        // Ensure the account belongs to the current tenant/company
        $companyId = tenant()->id;
        
        if ($chartOfAccount->company_id !== $companyId) {
            abort(403, 'Unauthorized action');
        }
        
        return Inertia::render('masterfiles/chart-of-accounts/edit', [
            'account' => $chartOfAccount
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
                // Ensure account code is unique within this company, excluding this record
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
            'account_type' => 'required|string|max:50',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
        
        $chartOfAccount->update($validated);
        
        return redirect()->route('masterfiles.chart-of-accounts.index')
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
        
        return redirect()->route('masterfiles.chart-of-accounts.index');
    }
}