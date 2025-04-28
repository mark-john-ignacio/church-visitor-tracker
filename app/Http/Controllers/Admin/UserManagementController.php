<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
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
}
