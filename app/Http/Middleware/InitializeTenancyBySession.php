<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Company;
use Illuminate\Support\Facades\Log;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

class InitializeTenancyBySession
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Get the active company ID from session
        $companyId = session('active_company_id');

        if (!$companyId) {
            // If no active company in session, try to get user's default company
            $user = $request->user();
            if ($user) {
                $primaryCompany = $user->companies()
                    ->wherePivot('is_primary', true)
                    ->first();

                if (!$primaryCompany) {
                    $primaryCompany = $user->companies()->first();
                }

                if ($primaryCompany) {
                    $companyId = $primaryCompany->id;
                    session(['active_company_id' => $companyId]);
                }
            }
        }

        if ($companyId) {
            try {
                // Find the tenant/company
                $tenant = Company::find($companyId);
                
                if ($tenant) {
                    tenancy()->initialize($tenant);
                    // Debug information
                    Log::debug('Tenant initialized from session', [
                        'company_id' => $companyId,
                        'path' => $request->path()
                    ]);
                } else {
                    Log::warning('Company not found', ['company_id' => $companyId]);
                }
            } catch (\Exception $e) {
                Log::error('Error initializing tenant', [
                    'company_id' => $companyId,
                    'exception' => $e->getMessage()
                ]);
            }
        } else {
            Log::debug('No company ID in session', ['path' => $request->path()]);
        }

        return $next($request);
    }
}