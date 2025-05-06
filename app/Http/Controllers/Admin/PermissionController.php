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
    public function index(Request $request): Response
    {
        $query = Permission::query();
        
        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where('name', 'like', "%{$searchTerm}%");
        }
        
        // Handle sorting
        if ($request->has('sort') && !empty($request->sort)) {
            $sortColumn = $request->sort;
            $sortDirection = $request->order ?? 'asc';
            
            // List of allowed sortable columns for security
            $allowedColumns = ['name', 'created_at', 'updated_at'];
            
            if (in_array($sortColumn, $allowedColumns)) {
                $query->orderBy($sortColumn, $sortDirection);
            } else {
                $query->orderBy('name', 'asc');
            }
        } else {
            $query->orderBy('name', 'asc');
        }
        
        $permissions = $query->paginate(15)->withQueryString();
        
        return Inertia::render('admin/permissions/index', [
            'permissions' => $permissions
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/permissions/create');
    }

    public function store(StorePermissionRequest $request): RedirectResponse
    {
        Permission::create(['name' => $request->name]);
        
        return redirect()->route('admin.permissions.index')
            ->with('success', 'Permission created successfully');
    }

    public function edit(Permission $permission): Response
    {
        return Inertia::render('admin/permissions/edit', [
            'permission' => $permission
        ]);
    }

    public function update(UpdatePermissionRequest $request, Permission $permission): RedirectResponse
    {
        // Prevent updating system permissions
        if ($this->isSystemPermission($permission->name)) {
            return back()->with('error', 'System permissions cannot be modified');
        }
        
        $permission->update(['name' => $request->name]);
        
        return redirect()->route('admin.permissions.index')
            ->with('success', 'Permission updated successfully');
    }

    public function destroy(Permission $permission): RedirectResponse
    {
        // Prevent deleting system permissions
        if ($this->isSystemPermission($permission->name)) {
            return back()->with('error', 'System permissions cannot be deleted');
        }
        
        $permission->delete();
        
        return back()->with('success', 'Permission deleted successfully');
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
            'manage_navigation'
        ];
        
        return in_array($name, $systemPermissions);
    }
}