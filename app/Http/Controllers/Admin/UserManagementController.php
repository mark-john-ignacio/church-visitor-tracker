<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request): Response
    {
        $query = User::with('roles');

        // Handle search
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%");
            });
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
            $allowedColumns = ['name', 'email', 'created_at', 'updated_at', 'email_verified_at'];
            
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
        
        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only(['search', 'sort', 'order']),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        $roles = Role::pluck('name', 'name')->toArray();
        $superAdminExists = User::role('super_admin')->exists();

        return Inertia::render('admin/users/create', [
            'roles' => $roles,
            'superAdminExists' => $superAdminExists,
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['required', 'string', 'exists:roles,name'],
        ]);

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $user->assignRole($validated['roles']);

            return redirect()
                ->route('admin.users.index')
                ->with('success', 'User created successfully');

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to create user. Please try again.');
        }
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        $roles = Role::pluck('name', 'name')->toArray();
        $isSuperAdmin = $user->hasRole('super_admin');
        $canEdit = !$isSuperAdmin || $user->id === auth()->id();
        $superAdminExists = User::role('super_admin')->exists();

        $user->load('roles');

        return Inertia::render('admin/users/edit', [
            'user' => $user,
            'roles' => $roles,
            'isSuperAdmin' => $isSuperAdmin,
            'canEdit' => $canEdit,
            'superAdminExists' => $superAdminExists,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $isSuperAdmin = $user->hasRole('super_admin');
        
        // Only allow editing if user is not super admin or is editing themselves
        if ($isSuperAdmin && $user->id !== auth()->id()) {
            abort(403, 'Cannot edit super admin users.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['required', 'string', 'exists:roles,name'],
        ]);

        try {
            $updateData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
            ];

            if (!empty($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }

            $user->update($updateData);
            $user->syncRoles($validated['roles']);

            return redirect()
                ->route('admin.users.index')
                ->with('success', 'User updated successfully');

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to update user. Please try again.');
        }
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        // Prevent deletion of super admin users
        if ($user->hasRole('super_admin')) {
            return back()->with('error', 'Cannot delete super admin users.');
        }

        // Prevent users from deleting themselves
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        try {
            $user->delete();

            return redirect()
                ->route('admin.users.index')
                ->with('success', 'User deleted successfully');

        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete user. Please try again.');
        }
    }
}