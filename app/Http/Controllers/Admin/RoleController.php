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
    public function index(Request $request): Response
    {
        $query = Role::with('permissions');
        
        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where('name', 'like', "%{$searchTerm}%");
        }
        
        // Handle sorting
        if ($request->has('sort') && !empty($request->sort)) {
            $sortColumn = $request->sort;
            $sortDirection = $request->order ?? 'asc';
            $query->orderBy($sortColumn, $sortDirection);
        } else {
            $query->orderBy('name', 'asc');
        }
        
        $roles = $query->paginate(10)->withQueryString();
        
        return Inertia::render('admin/roles/index', [
            'roles' => $roles
        ]);
    }

    public function create(): Response
    {
        $permissions = Permission::all()->pluck('name', 'id');
        
        return Inertia::render('admin/roles/create', [
            'permissions' => $permissions
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $role = Role::create(['name' => $request->name]);
        $role->syncPermissions($request->permissions);
        
        return redirect()->route('admin.roles.index')
            ->with('success', 'Role created successfully');
    }

    public function edit(Role $role): Response
    {
        $permissions = Permission::all()->pluck('name', 'id');
        
        return Inertia::render('admin/roles/edit', [
            'role' => $role->load('permissions'),
            'permissions' => $permissions
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        if ($role->name === 'super_admin' && $request->name !== 'super_admin') {
            return back()->with('error', 'Super Admin role name cannot be changed');
        }
        
        $role->update(['name' => $request->name]);
        $role->syncPermissions($request->permissions);
        
        return redirect()->route('admin.roles.index')
            ->with('success', 'Role updated successfully');
    }

    public function destroy(Role $role): RedirectResponse
    {
        if ($role->name === 'super_admin') {
            return back()->with('error', 'Super Admin role cannot be deleted');
        }
        
        $role->delete();
        
        return back()->with('success', 'Role deleted successfully');
    }
}