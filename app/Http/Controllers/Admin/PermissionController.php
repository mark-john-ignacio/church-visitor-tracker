<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePermissionRequest;
use App\Http\Requests\Admin\UpdatePermissionRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    /**
     * Display a listing of the permissions.
     */
    public function index(Request $request): Response
    {
        $query = Permission::query();
        
        // Handle search
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where('name', 'like', "%{$searchTerm}%");
        }
        
        // Handle sorting
        if ($request->filled('sort')) {
            $sortColumn = $request->sort;
            $sortDirection = $request->order ?? 'asc';
            
            // Validate sort direction
            if (!in_array($sortDirection, ['asc', 'desc'])) {
                $sortDirection = 'asc';
            }
            
            // List of allowed sortable columns for security
            $allowedColumns = ['name', 'guard_name', 'created_at', 'updated_at'];
            
            if (in_array($sortColumn, $allowedColumns)) {
                $query->orderBy($sortColumn, $sortDirection);
            } else {
                // Default sort if invalid column provided
                $query->orderBy('name', 'asc');
            }
        } else {
            // Default sort by name asc
            $query->orderBy('name', 'asc');
        }
        
        $permissions = $query->paginate(15)->withQueryString();
        
        return Inertia::render('admin/permissions/index', [
            'permissions' => $permissions,
            'filters' => $request->only(['search', 'sort', 'order']),
        ]);
    }

    /**
     * Show the form for creating a new permission.
     */
    public function create(): Response
    {
        return Inertia::render('admin/permissions/create');
    }

    /**
     * Store a newly created permission in storage.
     */
    public function store(StorePermissionRequest $request): RedirectResponse
    {
        try {
            Permission::create(['name' => $request->name]);
            
            return redirect()
                ->route('admin.permissions.index')
                ->with('success', 'Permission created successfully');

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to create permission. Please try again.');
        }
    }

    /**
     * Show the form for editing the specified permission.
     */
    public function edit(Permission $permission): Response
    {
        return Inertia::render('admin/permissions/edit', [
            'permission' => $permission
        ]);
    }

    /**
     * Update the specified permission in storage.
     */
    public function update(UpdatePermissionRequest $request, Permission $permission): RedirectResponse
    {
        // Prevent updating system permissions
        if ($this->isSystemPermission($permission->name)) {
            return back()->with('error', 'System permissions cannot be modified');
        }
        
        try {
            $permission->update(['name' => $request->name]);
            
            return redirect()
                ->route('admin.permissions.index')
                ->with('success', 'Permission updated successfully');

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to update permission. Please try again.');
        }
    }

    /**
     * Remove the specified permission from storage.
     */
    public function destroy(Permission $permission): RedirectResponse
    {
        // Prevent deleting system permissions
        if ($this->isSystemPermission($permission->name)) {
            return back()->with('error', 'System permissions cannot be deleted');
        }
        
        try {
            $permission->delete();
            
            return redirect()
                ->route('admin.permissions.index')
                ->with('success', 'Permission deleted successfully');

        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete permission. Please try again.');
        }
    }

    /**
     * Check if the permission is a system permission that shouldn't be modified
     */
    private function isSystemPermission(string $name): bool
    {
        $systemPermissions = [
            'view_dashboard',
            'view_admin',
            'manage_users',
            'manage_roles',
            'manage_permissions',
            'manage_navigation',
            'view_masterfiles',
            'view_accounting_setup',
            'manage_chart_of_accounts',
            'manage_banks'
        ];
        
        return in_array($name, $systemPermissions);
    }
}