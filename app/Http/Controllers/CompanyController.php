<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CompanyController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Switch to a specific company context.
     */
    public function switch(Request $request, Company $company)
    {
        $user = Auth::user();

        // Check if user has access to this company
        if (!$user->hasAccessToCompany($company->id)) {
            abort(403, 'You do not have access to this company.');
        }

        // Switch to the company
        $user->switchToCompany($company->id);

        return redirect()->back()->with('success', "Switched to {$company->name}");
    }

    /**
     * Get user's companies for dropdown.
     */
    public function getUserCompanies()
    {
        $user = Auth::user();
        $companies = $user->companies()
            ->where('is_active', true)
            ->get(['id', 'name', 'slug']);

        $currentCompanyId = session('company_id');

        return response()->json([
            'companies' => $companies,
            'current_company_id' => $currentCompanyId,
            'current_company' => $companies->firstWhere('id', $currentCompanyId),
        ]);
    }
}
