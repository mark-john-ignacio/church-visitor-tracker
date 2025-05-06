<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::with('roles');
        
        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%");
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
            $allowedColumns = ['name', 'email', 'created_at', 'updated_at'];
            
            if (in_array($sortColumn, $allowedColumns)) {
                $query->orderBy($sortColumn, $sortDirection);
            } else {
                // Default sort if invalid column provided
                $query->latest();
            }
        } else {
            // Default sort by created_at desc
            $query->latest();
        }
        
        $users = $query->paginate(15)->withQueryString();
        
        return Inertia::render('admin/users/index', compact('users'));
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        $roles = Role::pluck('name', 'id');
        $superAdminExists = User::role('super_admin')->exists();
        return Inertia::render('admin/users/create', [
            'roles' => $roles,
            'superAdminExists' => $superAdminExists
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        if (in_array('super_admin', $request->roles)) {
            if (User::role('super_admin')->exists()) {
                return back()->with('error', 'There can only be one Super Admin user');
            }
        }
        
        $user = User::create($request->validatedWithHash());
        $user->syncRoles($request->roles);
        
        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User created successfully');
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        $isSuperAdmin = $user->hasRole('super_admin');
        $canEdit = !$isSuperAdmin || $user->id === auth()->id();
        
        $roles = Role::pluck('name', 'id');
        $superAdminExists = User::role('super_admin')
            ->where('id', '!=', $user->id)
            ->exists();
        
        return Inertia::render('admin/users/edit', [
            'user' => $user->load('roles'),
            'roles' => $roles,
            'isSuperAdmin' => $isSuperAdmin,
            'canEdit' => $canEdit,
            'superAdminExists' => $superAdminExists
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        // Check if user has super_admin role and not current user
        if ($user->hasRole('super_admin') && $user->id !== auth()->id()) {
            return back()->with('error', 'Super Admin users can only be edited by themselves');
        }
        
        // Prevent removing super_admin role from super_admin
        if ($user->hasRole('super_admin') && !in_array('super_admin', $request->roles)) {
            return back()->with('error', 'Cannot remove Super Admin role from this user');
        }
        
        // Prevent assigning super_admin if it already exists
        if (!$user->hasRole('super_admin') && in_array('super_admin', $request->roles)) {
            if (User::role('super_admin')->exists()) {
                return back()->with('error', 'There can only be one Super Admin user');
            }
        }
        
        $user->update($request->validatedWithHash());
        $user->syncRoles($request->roles);
        
        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User updated successfully');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->hasRole('super_admin')) {
            return back()->with('error', 'Super Admin users cannot be deleted');
        }
        
        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User deleted successfully');
    }
}
