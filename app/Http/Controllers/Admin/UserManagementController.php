<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        // Add authorization check
        $this->authorize('manage_users', User::class);

        $users = User::with('roles') // Eager load roles
                     ->latest()
                     ->paginate(15) // Paginate results
                     ->withQueryString(); // Append query string parameters to pagination links

        return Inertia::render('admin/users/index', [
            'users' => $users,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('manage_users', User::class);

        $roles = Role::pluck('name', 'id');

        return Inertia::render('admin/users/create', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request): RedirectResponse // Return a RedirectResponse
    {
        // Authorize creation
        $this->authorize('manage_users', User::class);

        // Validate the incoming request data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:'.User::class, // Ensure email is unique in users table
            'password' => ['required', 'confirmed', Rules\Password::defaults()], // Use default password rules
            'roles' => 'required|array|min:1', // Ensure roles is an array and at least one is selected
            'roles.*' => 'required|string|exists:roles,name', // Ensure each role exists in the roles table by name
        ]);

        // Create the user
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']), // Hash the password
        ]);

        // Assign the selected roles (using the names validated)
        $user->assignRole($validated['roles']);

        // Redirect back to the user index page with a success message (optional)
        // You can also flash session messages if preferred
        return redirect()->route('admin.users.index')->with('success', 'User created successfully.');
    }
}
