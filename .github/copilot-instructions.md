Tech Stack:

Backend: Laravel 12

Frontend: React (with Inertia.js + ShadCN UI + Tailwind)

Authentication: Using the Starter Kit

Authorization: Laravel Permissions (spatie/laravel-permission package)

Audit Logging: owen-it/laravel-auditing (currently used by User Model)

Single Device Login: Use Laravel's built-in session management: #file:AuthenticatedSessionController.php

Multitenancy (Multi-Company): stancl/tenancy. The user can manage two or more companies and can switch between those. Each company has their own separate data. Using Single database mode and Tenancy Identity by Session #file:InitializeTenancyBySession.php
Also Models can automatically belong to company #file:BelongsToCompany.php #file:ChartOfAccount.php is using this currently

Modular Structure of Modules: Using nwidart/laravel-modules. Currently implemented for Accounting Setup and has Chart of Account for now

Admin Panel Features:

Dynamic Sidebar Menu:

Super admins can create, edit, delete sidebar items (menus, links to pages or modules). Navigation Management #file:NavigationController.php

Menus are permission-based (only show if the user has access). #file:HandleInertiaRequests.php

Role-Based Access Control:

Admin can create/edit roles (Ex: Admin, Manager, Accountant, Viewer). Role Management

Assign permissions per page, module, or custom actions (View, Edit, Delete, Export, etc). #file:RoleController.php
No custom actions permission yet

Permission Granting:

Fine-grained permission assignment (even action-level like "can_export_reports").

Audit Trail:

Logs who did what and when (create/update/delete/login/logout/company switch). only implemented on #file:User.php for now

Single Device Login:

Logging in from a second device will log out the first device.
C:\Users\Mark\Herd\myxfin_laravel_react\app\Http\Controllers\Auth\AuthenticatedSessionController.php:37

Multi-Company Management:

Users can manage multiple companies.

Can switch between companies (like Quickbooks or Xero).

Data is scoped by company.

Coding Style:

Modular, clean architecture.

Separation of concerns (services, repositories, actions, etc).

Code ready for scaling.

Additional Feature: Company User License Limits (Not implemented yet)

Each Company can have a license limit (e.g., allowed 5 users, 10 users, etc.).

When an admin tries to invite or create a new user:

The system checks if the current number of users is below the license limit.

If they reached the limit, prevent creation and show a friendly error like:
➔ "User limit reached for your plan. Please upgrade your subscription."
