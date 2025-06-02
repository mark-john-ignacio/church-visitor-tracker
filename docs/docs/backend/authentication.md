---
title: Authentication
---

# Authentication

MyXFin uses Laravel Starter Kit for authentication, including registration, login, password reset, and email verification.

Key points:

- Built on Laravel's authentication scaffolding.
- Single device login enforced via session management.
- Custom `AuthenticatedSessionController` handles login/logout logic.

Refer to `app/Http/Controllers/Auth/AuthenticatedSessionController.php` for implementation details.
