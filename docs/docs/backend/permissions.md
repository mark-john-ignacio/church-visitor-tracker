---
title: Permissions & Roles
---

# Permissions & Roles

MyXFin uses the `spatie/laravel-permission` package for role-based access control.

Key points:

- Define roles and permissions via migrations and seeders.
- Use middleware (`role` and `permission`) to guard routes and controllers.
- Assign fine-grained permissions (e.g., `can_export_reports`).
- Manage roles and permissions in `RoleController` and middleware configured in `HandleInertiaRequests`.

Refer to:

- config/permission.php
- app/Http/Controllers/RoleController.php
- app/Http/Controllers/PermissionController.php (if implemented)
