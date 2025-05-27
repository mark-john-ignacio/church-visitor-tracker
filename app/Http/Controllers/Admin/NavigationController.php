<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreNavigationRequest;
use App\Http\Requests\Admin\UpdateNavigationRequest;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Permission;

class NavigationController extends Controller
{
    private const ITEMS_PER_PAGE = 15;

    public function index(Request $request): Response
    {
        $navItems = MenuItem::with('parent')
            ->search($request->search)
            ->when($request->sort && in_array($request->sort, MenuItem::SORTABLE_COLUMNS), function ($query) use ($request) {
                $direction = in_array($request->order, ['asc', 'desc']) ? $request->order : 'asc';
                return $query->orderBy($request->sort, $direction);
            }, function ($query) {
                return $query->defaultOrder();
            })
            ->paginate(self::ITEMS_PER_PAGE)
            ->withQueryString();
        
        return Inertia::render('admin/navigation/index', [
            'navItems' => $navItems,
            'filters' => $request->only(['search', 'sort', 'order']),
        ]);
    }

    public function create(): Response
    {
        $permissions = Permission::pluck('name', 'name')->toArray();
        $parentItems = MenuItem::getEligibleParents();

        return Inertia::render('admin/navigation/create', [
            'permissions' => $permissions,
            'parentItems' => $parentItems->pluck('name', 'id')->toArray(),
            'iconList' => MenuItem::getAvailableIcons(),
            'types' => MenuItem::getAvailableTypes(),
        ]);
    }

    public function store(StoreNavigationRequest $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                MenuItem::create($request->validated());
            });

            return redirect()
                ->route('admin.navigation.index')
                ->with('success', 'Navigation item created successfully');

        } catch (\Exception $e) {
            Log::error('Failed to create navigation item', [
                'error' => $e->getMessage(),
                'data' => $request->validated()
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to create navigation item. Please try again.');
        }
    }

    public function edit(MenuItem $navigation): Response
    {
        $permissions = Permission::pluck('name', 'name')->toArray();
        $parentItems = MenuItem::getEligibleParents($navigation->id);

        return Inertia::render('admin/navigation/edit', [
            'navigationItem' => $navigation,
            'permissions' => $permissions,
            'parentItems' => $parentItems->pluck('name', 'id')->toArray(),
            'iconList' => MenuItem::getAvailableIcons(),
            'types' => MenuItem::getAvailableTypes(),
        ]);
    }

    public function update(UpdateNavigationRequest $request, MenuItem $navigation): RedirectResponse
    {
        try {
            DB::transaction(function () use ($navigation, $request) {
                $navigation->fill($request->validated());

                if (!$navigation->isDirty()) {
                    return redirect()
                        ->route('admin.navigation.index')
                        ->with('info', 'No changes were made to the navigation item.');
                }

                $navigation->save();
            });

            return redirect()
                ->route('admin.navigation.index')
                ->with('success', 'Navigation item updated successfully');

        } catch (\Exception $e) {
            Log::error('Failed to update navigation item', [
                'id' => $navigation->id,
                'error' => $e->getMessage(),
                'data' => $request->validated()
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to update navigation item. Please try again.');
        }
    }

    public function destroy(MenuItem $navigation): RedirectResponse
    {
        if (!$navigation->canBeDeleted()) {
            return back()->with('error', 'This item has child menu items. Please remove them first.');
        }

        try {
            DB::transaction(function () use ($navigation) {
                $navigation->delete();
            });

            return redirect()
                ->route('admin.navigation.index')
                ->with('success', 'Navigation item deleted successfully');

        } catch (\Exception $e) {
            Log::error('Failed to delete navigation item', [
                'id' => $navigation->id,
                'error' => $e->getMessage()
            ]);

            return back()->with('error', 'Failed to delete navigation item. Please try again.');
        }
    }
}