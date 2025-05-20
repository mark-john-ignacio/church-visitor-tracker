<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Stancl\Tenancy\Tenant;
use Stancl\Tenancy\Resolvers\TenantResolver;
use Stancl\Tenancy\Exceptions\TenantCouldNotBeIdentifiedException;
use Symfony\Component\HttpFoundation\Response;

class InitializeTenancyBySession extends \Stancl\Tenancy\Middleware\IdentificationMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get the current user
        $user = $request->user();

        // If no user is logged in, skip tenant initialization
        if (!$user) {
            return $next($request);
        }

        // Check if a company_id exists in session
        $companyId = session('active_company_id');

        // If not in session but user has submitted one from the switcher
        if (!$companyId && $request->has('switch_company')) {
            $companyId = $request->input('switch_company');
            
            // Store in session for future requests
            if ($companyId) {
                session(['active_company_id' => $companyId]);
            }
        }

        // If still no company_id, try to get the user's primary or first company
        if (!$companyId) {
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

        // If we have a company ID and the user has access to it, initialize tenancy
        if ($companyId) {
            // Check if the user has access to this company
            $hasAccess = $user->companies()->where('id', $companyId)->exists();
            
            if ($hasAccess) {
                try {
                    $tenant = $this->tenancy->find($companyId);
                    $this->tenancy->initialize($tenant);
                } catch (TenantCouldNotBeIdentifiedException $e) {
                    // If the tenant cannot be found, clear the session
                    session()->forget('active_company_id');
                }
            } else {
                // User doesn't have access to this company, clear the session
                session()->forget('active_company_id');
            }
        }

        return $next($request);
    }
}
