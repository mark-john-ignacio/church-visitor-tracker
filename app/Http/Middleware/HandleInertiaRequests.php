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
            $this->getNavItems($user, 'main');
        }

        $footerNavItems = $this->getNavItems($user, 'footer');

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'permissions' => $user ? $user->getAllPermissions()->pluck('name') : [],
                'roles' => $user ? $user->roles->pluck('name') : [],
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

        ];
    }

    /**
     * Get navigation items for a specific type filtered by user permissions
     *
     * @param \App\Models\User|null $user
     * @param string $type
     * @return array
     */
    protected function getNavItems($user, string $type):array
    {
        if (!$user) {
            return [];
        }

        $items = MenuItem::where('type', $type)
            ->whereNull('parent_id')
            ->orderBy('order')
            ->get();

        $navItems = [];

        foreach ($items as $item){
            if($item->permission_name && !$user->can($item->permission_name)){
                continue;
            }

            $navItem = [
                'title' => $item->name,
                'href' => $item->route,
            ];

            // Add the icon if it exist
            if($item->icon){
                $navItem['icon'] = $item->icon;
            }

            //Process children if any
            $children = $item->children()
                ->orderBy('order')
                ->get()
                ->filter(function ($child) use ($user){
                    return !$child->permission_name || $user->can($child->permission_name);
                });
            if ($children->count() > 0){
                $navItem['children'] = $children->map(function ($child){
                    $childItem = [
                        'title' => $child->name,
                        'href' => $child->route,
                    ];

                    if($child->icon){
                        $childItem['icon'] = $child->icon;
                    }

                    return $childItem;
                })->values()->toArray();
            }
            $navItems[] = $navItem;
        }

        return $navItems;
    }
}
