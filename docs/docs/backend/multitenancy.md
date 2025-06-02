---
title: Multitenancy
---

# Multitenancy

MyXFin uses the `stancl/tenancy` package in single-database mode to support multiple companies under one application.

Key points:

- **Tenancy by session**: Current company is stored in session via `InitializeTenancyBySession` middleware.
- **Model scoping**: Use `BelongsToCompany` trait for models to automatically scope records to the active company.
- **Isolated data**: Each company’s data (transactions, accounts, users) remains logically separated.

Refer to:

- `app/Http/Middleware/InitializeTenancyBySession.php`
- `app/Traits/BelongsToCompany.php`
