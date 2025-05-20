<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CompanySwitcherController extends Controller
{
    /**
     * Switch to a different company.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function switch(Request $request)
    {
        try {
            $request->validate([
                'company_id' => 'required|exists:companies,id',
            ]);
            
            $user = Auth::user();
            $companyId = $request->input('company_id');
            
            // Verify the user has access to this company
            if (!$user->companies()->where('companies.id', $companyId)->exists()) {
                if ($request->wantsJson()) {
                    return response()->json(['error' => 'You do not have access to this company.'], 403);
                }
                return back()->withErrors(['company_id' => 'You do not have access to this company.']);
            }
            
            // Store the active company in the session
            session(['active_company_id' => $companyId]);
            
            // Get company details
            $company = $user->companies()->where('companies.id', $companyId)->first();
            
            // Return appropriate response based on request type
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true, 
                    'active_company' => [
                        'id' => $company->id,
                        'name' => $company->name,
                        'display_name' => $company->display_name ?: $company->name,
                    ]
                ]);
            }
            
            return back();
        } catch (\Exception $e) {
            Log::error('Error switching company: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);
            
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json(['error' => 'An error occurred while switching companies.'], 500);
            }
            
            return back()->withErrors(['error' => 'An error occurred while switching companies.']);
        }
    }
    
    /**
     * Get user's companies for the switcher.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCompanies(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }
            
            $activeCompanyId = session('active_company_id');
            
            // If no active company id, find one
            if (!$activeCompanyId) {
                $primaryCompany = $user->companies()->wherePivot('is_primary', true)->first();
                if (!$primaryCompany) {
                    $primaryCompany = $user->companies()->first();
                }
                
                if ($primaryCompany) {
                    $activeCompanyId = $primaryCompany->id;
                    session(['active_company_id' => $activeCompanyId]);
                }
            }
            
            $companies = $user->companies()
                ->select('companies.id', 'companies.display_name', 'companies.name')
                ->get()->map(function ($company) use ($activeCompanyId) {
                    return [
                        'id' => $company->id,
                        'display_name' => $company->display_name ?: $company->name,
                        'is_active' => $company->id === $activeCompanyId,
                    ];
                });
            
            return response()->json([
                'companies' => $companies,
                'active_company_id' => $activeCompanyId,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching companies: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            
            return response()->json(['error' => 'An error occurred while fetching companies.'], 500);
        }
    }
}