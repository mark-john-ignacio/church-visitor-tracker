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
     * @return \Illuminate\Http\RedirectResponse
     */
    public function switch(Request $request)
    {
        try {
            $request->validate([
                'company_id' => 'required|string|exists:companies,id',
            ]);
            
            $user = Auth::user();
            $companyId = $request->input('company_id');
            
            // Verify the user has access to this company
            if (!$user->companies()->where('companies.id', $companyId)->exists()) {
                return back()->withErrors(['company_id' => 'You do not have access to this company.']);
            }
            
            // Store the active company in the session
            session(['active_company_id' => $companyId]);
            
            return back();
        } catch (\Exception $e) {
            Log::error('Error switching company: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while switching companies.']);
        }
    }
    
    /**
     * Get user's companies for the switcher.
     * 
     * @param Request $request
     * @return array
     */
    public function getCompanies(Request $request)
    {
        try {
            $user = Auth::user();
            $activeCompanyId = session('active_company_id');
            
            $companies = $user->companies()
            ->select('companies.id', 'display_name', 'name')
            ->get()->map(function ($company) use ($activeCompanyId) {
                return [
                    'id' => $company->id,
                    'display_name' => $company->display_name ?: $company->name,
                    'is_active' => $company->id === $activeCompanyId,
                ];
            });
            
            return [
                'companies' => $companies,
                'active_company_id' => $activeCompanyId,
            ];
        } catch (\Exception $e) {
            Log::error('Error fetching companies: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            
            return response()->json(['error' => 'An error occurred while fetching companies.'], 500);
        }
    }
}