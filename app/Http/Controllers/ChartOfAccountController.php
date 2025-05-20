<?php

namespace App\Http\Controllers;

use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChartOfAccountController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        // This will automatically be tenant-scoped due to our BelongsToCompany trait
        $accounts = ChartOfAccount::orderBy('account_code')->get();
        
        return Inertia::render('ChartOfAccounts', [
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
        return Inertia::render('ChartOfAccountForm', [
            'account' => null,
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
        $validated = $request->validate([
            'account_code' => 'required|string|max:50|unique:chart_of_accounts,account_code,NULL,id,company_id,' . tenant()->id,
            'account_name' => 'required|string|max:255',
            'account_type' => 'required|string|max:50',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
        
        ChartOfAccount::create($validated);
        
        return redirect()->route('chart-of-accounts.index')
            ->with('success', 'Account created successfully.');
    }
    
    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\ChartOfAccount  $chartOfAccount
     * @return \Inertia\Response
     */
    public function edit(ChartOfAccount $chartOfAccount)
    {
        // The model will be automatically tenant-scoped
        return Inertia::render('ChartOfAccountForm', [
            'account' => $chartOfAccount,
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
        $validated = $request->validate([
            'account_code' => 'required|string|max:50|unique:chart_of_accounts,account_code,' . $chartOfAccount->id . ',id,company_id,' . tenant()->id,
            'account_name' => 'required|string|max:255',
            'account_type' => 'required|string|max:50',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
        
        $chartOfAccount->update($validated);
        
        return redirect()->route('chart-of-accounts.index')
            ->with('success', 'Account updated successfully.');
    }
    
    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\ChartOfAccount  $chartOfAccount
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(ChartOfAccount $chartOfAccount)
    {
        $chartOfAccount->delete();
        
        return redirect()->route('chart-of-accounts.index')
            ->with('success', 'Account deleted successfully.');
    }
}
