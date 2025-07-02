# 🧑‍💻 Copilot Instructions for Church Visitor Tracker

## 🧩 Project Overview

This is a full-stack **Church Visitor Tracking** system. It logs and manages visitor information, follow-ups, service attendance, and provides company-level multitenancy. It is designed for use in a church admin dashboard, with a clean, modular, scalable codebase.

---

## 🧱 Tech Stack

| Layer        | Stack                                      |
| ------------ | ------------------------------------------ |
| Backend      | Laravel 12 (Modular, NWIDART Modules)      |
| Frontend     | React + Inertia.js + ShadCN UI + Tailwind  |
| Database     | MySQL (with Stancl Tenancy - single DB)    |
| Auth         | Laravel Breeze Starter Kit (session-based) |
| Roles/Authz  | spatie/laravel-permission                  |
| Audit Logs   | owen-it/laravel-auditing                   |
| Multitenancy | stancl/tenancy (single DB, session-based)  |

---

## 🔑 Key Features and Architecture

### 🧍 Visitor Model

- `name`, `contact_info`, `visit_date`, `invited_by`, `tags`, `notes`
- Belongs to a `company_id` (multi-company support)
- HasMany `FollowUp`

### 📋 FollowUp Model

- `visitor_id`, `status`, `note`, `followed_up_by`, `created_at`
- BelongsTo `Visitor`

### 👤 User Model

- Uses Laravel Breeze
- Assigned roles/permissions (via Spatie)
- Can belong to multiple companies
- Audited (login/logout/create/update)

---

## 🧮 Multitenancy

### Tech

- `stancl/tenancy` in **single-database** mode
- Tenancy booted via session: `InitializeTenancyBySession.php`
- Shared users across companies; switch context via session

### Notes

- All data (Visitors, FollowUps) must auto-scope by current company
- Models use `BelongsToCompany.php` trait
- Example: `ChartOfAccount.php`, `Visitor.php`, etc.

---

## 🔐 Auth & Authorization

- Auth: Laravel Breeze (session-based)
- Single device login: Enforced in `AuthenticatedSessionController.php`
- Roles/Permissions:
    - Created and managed via `spatie/laravel-permission`
    - Permissions tied to routes and UI components
    - Example: `"view_visitors"`, `"export_dashboard"`

---

## 🧾 Audit Logging

- Uses `owen-it/laravel-auditing`
- Logs login, logout, create/update/delete actions
- Currently enabled for `User.php`; extend to `Visitor`, `FollowUp`, `Company` models

---

## 🧰 Admin Features

### ✅ Dynamic Sidebar Menu

- Navigation editable by Super Admin via `NavigationController.php`
- Items shown based on user permissions (`HandleInertiaRequests.php`)

### ✅ Role & Permission Management

- Use `RoleController.php` and permission-seeding
- Fine-grained control possible: `can_export_reports`, `can_edit_followups`

---

## 📦 Modular Codebase

- NWIDART Laravel Modules
- Each major feature (e.g., Accounting, Visitors) is a module
- Keep actions, services, policies, requests inside respective module

### ⚠️ IMPORTANT: Laravel Modules Namespace Quirk

**Files are stored in `Modules/ModuleName/app/` directory but namespace EXCLUDES "app"**

Examples:

- File location: `Modules/Visitors/app/Services/VisitorService.php`
- Correct namespace: `Modules\Visitors\Services\VisitorService`
- ❌ Wrong: `Modules\Visitors\app\Services\VisitorService`

- File location: `Modules/Visitors/app/Http/Controllers/VisitorController.php`
- Correct namespace: `Modules\Visitors\Http\Controllers\VisitorController`
- ❌ Wrong: `Modules\Visitors\app\Http\Controllers\VisitorController`

This applies to ALL module files:

- Controllers: `Modules\ModuleName\Http\Controllers\`
- Models: `Modules\ModuleName\Models\`
- Services: `Modules\ModuleName\Services\`
- Requests: `Modules\ModuleName\Http\Requests\`
- etc.

Always exclude "app" from the namespace even though files are physically in the `app/` subdirectory.

---

## 📋 MVP Pages (via Inertia.js)

| Path                | Page                            |
| ------------------- | ------------------------------- |
| `/login`            | Auth                            |
| `/dashboard`        | Visitor summary                 |
| `/visitors`         | Visitor list                    |
| `/visitors/:id`     | Visitor detail + follow-ups     |
| `/follow-ups`       | Global follow-up log (optional) |
| `/admin/navigation` | Sidebar management              |
| `/admin/roles`      | Role/permission editor          |

---

## 🎯 MVP Milestones

### Week 1

- [ ] Setup Laravel Modules + Inertia.js
- [ ] Create Visitor & FollowUp models with tenancy
- [ ] Setup audit trail + basic Inertia page layout

### Week 2

- [ ] Visitor CRUD (frontend + backend)
- [ ] Follow-up form with status
- [ ] Dashboard summary (Recharts)

### Week 3

- [ ] Permission-based sidebar rendering
- [ ] Company/Church switching logic
- [ ] UI polish with ShadCN UI components

---

## 💡 Copilot Notes

- Prefer service classes for business logic
- Keep controllers lean (delegate to Actions/Services)
- Use Eloquent scopes for multitenancy (`->companyScope()`)
- Use `Spatie\Permission\Traits\HasRoles` on User model
- Use `ShadCN UI` components (modals, tables, dropdowns)

---

## 🧪 Example Snippets to Guide Copilot

### BelongsToCompany Trait

```php
public static function booted() {
    static::addGlobalScope('company', function ($query) {
        if ($companyId = session('company_id')) {
            $query->where('company_id', $companyId);
        }
    });

    static::creating(function ($model) {
        $model->company_id = session('company_id');
    });
}



```

App is locally hosted on Herd and Mysql db is on xampp
Terminal is using powershell
