<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRoleRequest;
use App\Http\Requests\Admin\UpdateRoleRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Display a listing of the roles.
     */
    public function index(Request $request): Response
    {
        $query = Role::with('permissions');
        
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
            $allowedColumns = ['name', 'created_at', 'updated_at'];
            
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
        
        $roles = $query->paginate(15)->withQueryString();
        
        return Inertia::render('admin/roles/index', [
            'roles' => $roles,
            'filters' => $request->only(['search', 'sort', 'order']),
        ]);
    }

    /**
     * Show the form for creating a new role.
     */
    public function create(): Response
    {
        $permissions = Permission::all()->pluck('name', 'id');
        
        return Inertia::render('admin/roles/create', [
            'permissions' => $permissions
        ]);
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(StoreRoleRequest $request): RedirectResponse
    {
        try {
            $role = Role::create(['name' => $request->name]);
            $role->syncPermissions($request->permissions);
            
            return redirect()
                ->route('admin.roles.index')
                ->with('success', 'Role created successfully');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to create role. Please try again.');
        }
    }

    /**
     * Show the form for editing the specified role.
     */
    public function edit(Role $role): Response
    {
        $permissions = Permission::all()->pluck('name', 'id');
        
        return Inertia::render('admin/roles/edit', [
            'role' => $role->load('permissions'),
            'permissions' => $permissions
        ]);
    }

    /**
     * Update the specified role in storage.
     */
    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        // Prevent changing super_admin role name
        if ($role->name === 'super_admin' && $request->name !== 'super_admin') {
            return back()->with('error', 'Super Admin role name cannot be changed');
        }
        
        try {
            $role->update(['name' => $request->name]);
            
            // Don't sync permissions for super_admin to prevent lockout
            if ($role->name !== 'super_admin') {
                $role->syncPermissions($request->permissions);
            }
            
            return redirect()
                ->route('admin.roles.index')
                ->with('success', 'Role updated successfully');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to update role. Please try again.');
        }
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy(Role $role): RedirectResponse
    {
        // Prevent deletion of super_admin role
        if ($role->name === 'super_admin') {
            return back()->with('error', 'Super Admin role cannot be deleted');
        }
        
        try {
            $role->delete();
            
            return redirect()
                ->route('admin.roles.index')
                ->with('success', 'Role deleted successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete role. Please try again.');
        }
    }
}