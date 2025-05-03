<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    public function index(): Response
    {
        $users = User::with('roles')
                     ->latest()
                     ->paginate(15)
                     ->withQueryString();

        return Inertia::render('admin/users/index', compact('users'));
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        $roles = Role::pluck('name', 'id');
        return Inertia::render('admin/users/create', compact('roles'));
    }

    /**
     * Store a newly created user.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $user = User::create($request->validatedWithHash());
        $user->assignRole($request->roles);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User created.');
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        $roles = Role::pluck('name', 'id');

        return Inertia::render('admin/users/edit', [
            'user'  => $user->load('roles'),
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $user->update($request->validatedWithHash());
        $user->syncRoles($request->roles);
        return redirect()->route('admin.users.index')
            ->with('success','User updated.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User deleted.');
    }
}
