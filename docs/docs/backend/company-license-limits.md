---
title: Company User License Limits
---

# Company User License Limits

Each MyXFin company subscription has a configurable user license limit that restricts the total number of active users.

Key points:

- **Configuring limits:** Define the license limit in the `license_limit` column on the `companies` table or via your subscription management service.
- **Enforcing limits:** Before inviting or creating a new user, the system checks the current user count against the company’s `license_limit`.
- **Error handling:** If the limit is reached, user creation is blocked and a friendly error is shown:

    > "User limit reached for your plan. Please upgrade your subscription."

Refer to:

- `app/Models/Company.php` for the `license_limit` attribute.
- Invitation logic in `app/Http/Controllers/UserInvitationController.php` (or equivalent) for enforcement code.
