<!-- docs/architecture.md -->

# System Architecture

## Overview

MyXFin follows a **modular monolithic architecture** with clear separation of concerns and multi-tenant capabilities.

## Multi-Tenancy Architecture

### Session-Based Tenant Identification

```php
// Middleware automatically identifies tenant from session
class InitializeTenancyBySession
{
    public function handle(Request $request, Closure $next)
    {
        $companyId = session('active_company_id');

        if ($companyId) {
            $tenant = Company::find($companyId);
            tenancy()->initialize($tenant);
        }

        return $next($request);
    }
}
```
