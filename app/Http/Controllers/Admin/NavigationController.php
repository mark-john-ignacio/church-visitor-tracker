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
use Spatie\Permission\Models\Permission;

class NavigationController extends Controller
{
    public function index(Request $request): Response
    {
        $query = MenuItem::with('parent');

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('route', 'like', "%{$searchTerm}%")
                  ->orWhere('icon', 'like', "%{$searchTerm}%");
            });
        }
        
        // Handle sorting
        if ($request->has('sort') && !empty($request->sort)) {
            $sortColumn = $request->sort;
            $sortDirection = $request->order ?? 'asc';
            
            // Validate sort direction
            if (!in_array($sortDirection, ['asc', 'desc'])) {
                $sortDirection = 'asc';
            }
            
            // List of allowed sortable columns for security
            $allowedColumns = ['name', 'route', 'icon', 'type', 'order', 'created_at'];
            
            if (in_array($sortColumn, $allowedColumns)) {
                $query->orderBy($sortColumn, $sortDirection);
            } else {
                $query->orderBy('order')->orderBy('type');
            }
        } else {
            $query->orderBy('type')->orderBy('order');
        }
        
        $navItems = $query->paginate(15)->withQueryString();
        
        return Inertia::render('admin/navigation/index', [
            'navItems' => $navItems,
        ]);
    }

    public function create(): Response
    {
        $permissions = Permission::pluck('name', 'id');
        $parentItems = MenuItem::whereNull('parent_id')
            ->orderBy('type')
            ->orderBy('order')
            ->pluck('name', 'id');
            
        return Inertia::render('admin/navigation/create', [
            'permissions' => $permissions,
            'parentItems' => $parentItems,
            'iconList' => $this->getIconList(),
            'types' => ['main' => 'Main Navigation', 'footer' => 'Footer', 'user' => 'User Menu'],
        ]);
    }

    public function store(StoreNavigationRequest $request): RedirectResponse
    {
        MenuItem::create($request->validated());

        return redirect()
            ->route('admin.navigation.index')
            ->with('success', 'Navigation item created.');
    }

    public function edit(MenuItem $navigation): Response
    {
        $permissions = Permission::pluck('name', 'id');
        $parentItems = MenuItem::where('id', '!=', $navigation->id)
            ->whereNull('parent_id')
            ->orderBy('type')
            ->orderBy('order')
            ->pluck('name', 'id');
            
        return Inertia::render('admin/navigation/edit', [
            'navigationItem' => $navigation,
            'permissions' => $permissions,
            'parentItems' => $parentItems,
            'iconList' => $this->getIconList(),
            'types' => ['main' => 'Main Navigation', 'footer' => 'Footer', 'user' => 'User Menu'],
        ]);
    }

    public function update(UpdateNavigationRequest $request, MenuItem $navigation): RedirectResponse
    {
        $navigation->update($request->validated());
        
        return redirect()
            ->route('admin.navigation.index')
            ->with('success', 'Navigation item updated.');
    }

    public function destroy(MenuItem $navigation): RedirectResponse
    {
        // Check if this item has children
        if ($navigation->children()->count() > 0) {
            return back()->with('error', 'This item has child menu items. Please remove them first.');
        }
        
        $navigation->delete();
        
        return redirect()
            ->route('admin.navigation.index')
            ->with('success', 'Navigation item deleted.');
    }
    
    /**
     * Get list of available icons
     */
    private function getIconList(): array
    {
        // Common Lucide icons used for navigation
        return [
            'LayoutGrid' => 'Layout Grid',
            'Users' => 'Users',
            'Settings' => 'Settings',
            'ChartBar' => 'Chart Bar',
            'FileText' => 'File Text',
            'Wallet' => 'Wallet',
            'CreditCard' => 'Credit Card',
            'Shield' => 'Shield',
            'Bell' => 'Bell',
            'BookOpen' => 'Book Open',
            'Folder' => 'Folder',
            'Menu' => 'Menu',
            'Key' => 'Key',
            'Landmark' => 'Landmark',
            'Banknote' => 'Banknote',
            'Clipboard' => 'Clipboard',
            'BarChart' => 'Bar Chart',
            'LineChart' => 'Line Chart',
            'PieChart' => 'Pie Chart',
            'Building' => 'Building',
            'CircleDollarSign' => 'Circle Dollar Sign',
        ];
    }
}