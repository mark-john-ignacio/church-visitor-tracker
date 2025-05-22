<?php

namespace App\Http\Middleware;

use App\Models\MenuItem;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        //Get main navigation items
        $mainNavItems = [];
        if($user){
            $mainNavItems = $this->getNavItems($user, 'main');
        }

        $footerNavItems = $this->getNavItems($user, 'footer');

        // Get active company from session for authenticated users
        $activeCompanyId = null;
        $activeCompany = null;
        if ($user) {
            $activeCompanyId = session('active_company_id');
            
            // If no active company is set in the session, try to determine it
            if (!$activeCompanyId) {
                // Try to get the user's primary company
                $primaryCompany = $user->companies()
                    ->wherePivot('is_primary', true)
                    ->first();
                
                // If no primary company, get the first company
                if (!$primaryCompany) {
                    $primaryCompany = $user->companies()->first();
                }
                
                if ($primaryCompany) {
                    $activeCompanyId = $primaryCompany->id;
                    session(['active_company_id' => $activeCompanyId]);
                    $activeCompany = [
                        'id' => $primaryCompany->id,
                        'name' => $primaryCompany->name,
                        'display_name' => $primaryCompany->display_name,
                    ];
                }
            } else if ($activeCompanyId) {
                // Get the active company details
                $company = $user->companies()->where('companies.id', $activeCompanyId)->first();
                if ($company) {
                    $activeCompany = [
                        'id' => $company->id,
                        'name' => $company->name,
                        'display_name' => $company->display_name,
                    ];
                }
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'permissions' => $user ? $user->getAllPermissions()->pluck('name') : [],
                'roles' => $user ? $user->roles->pluck('name') : [],
            'active_company_id' => $activeCompanyId,
            'active_company' => $activeCompany,
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'navigation' => [
              'mainNavItems' => $mainNavItems,
              'footerNavItems' => $footerNavItems,
            ],
            'sidebarOpen' => $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],

        ];
    }

    /**
     * Get navigation items for a specific type filtered by user permissions
     *
     * @param \App\Models\User|null $user
     * @param string $type
     * @return array
     */
    protected function getNavItems($user, string $type): array
    {
        if (!$user) {
            return [];
        }

        $items = MenuItem::where('type', $type)
            ->whereNull('parent_id')
            ->orderBy('order')
            ->get();

        $navItems = [];

        foreach ($items as $item) {
            if ($item->permission_name && !$user->can($item->permission_name)) {
                continue;
            }

            $navItem = [
                'title' => $item->name,
                'href' => $item->route,
            ];

            // Add the icon if it exists
            if ($item->icon) {
                $navItem['icon'] = $item->icon;
            }

            // Process children if any - First level children
            $children = $item->children()
                ->orderBy('order')
                ->get()
                ->filter(function ($child) use ($user) {
                    return !$child->permission_name || $user->can($child->permission_name);
                });

            if ($children->count() > 0) {
                $navItem['children'] = $children->map(function ($child) use ($user) {
                    $childItem = [
                        'title' => $child->name,
                        'href' => $child->route,
                    ];

                    if ($child->icon) {
                        $childItem['icon'] = $child->icon;
                    }

                    // Process grandchildren if any - Second level children
                    $grandchildren = $child->children()
                        ->orderBy('order')
                        ->get()
                        ->filter(function ($grandchild) use ($user) {
                            return !$grandchild->permission_name || $user->can($grandchild->permission_name);
                        });

                    if ($grandchildren->count() > 0) {
                        $childItem['children'] = $grandchildren->map(function ($grandchild) {
                            $grandchildItem = [
                                'title' => $grandchild->name,
                                'href' => $grandchild->route,
                            ];

                            if ($grandchild->icon) {
                                $grandchildItem['icon'] = $grandchild->icon;
                            }

                            return $grandchildItem;
                        })->values()->toArray();
                    }

                    return $childItem;
                })->values()->toArray();
            }

            $navItems[] = $navItem;
        }

        return $navItems;
    }
}
