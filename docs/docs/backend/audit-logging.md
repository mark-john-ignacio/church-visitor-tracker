---
title: Audit Logging
---

# Audit Logging

MyXFin leverages `owen-it/laravel-auditing` to maintain a complete audit trail for critical operations.

Key points:

- Automatically captures create, update, and delete events on models implementing the `Auditable` trait.
- Logs user actions such as login, logout, and company switches using custom events in the `User` model.
- Configurable storage: by default, logs are stored in the `audits` database table.
- Customize auditing behavior via the `audit.php` config file.

Refer to:

- `app/Models/User.php` (implements auditing hooks)
- config/audit.php
- Database table: `audits`
