# Troubleshooting Guide

This guide helps you resolve common issues when developing modules in MyXFin.

## 🔧 Common Issues and Solutions

### Backend Issues

#### 1. **Module Not Found Error**

```
Target class [Modules\ModuleName\Providers\ModuleNameServiceProvider] does not exist.
```

**Solution:**

```bash
# Clear all caches
php artisan optimize:clear

# Ensure module is enabled in modules_statuses.json
# Check that the ServiceProvider exists and is properly registered
```

#### 2. **Tenancy Not Initialized**

```
Call to a member function id on null (tenant())
```

**Solution:**

- Ensure `InitializeTenancyBySession::class` middleware is applied to your routes
- Check that user has switched to a company
- Verify tenancy is properly configured in `config/tenancy.php`

#### 3. **Permission Denied Errors**

```
This action is unauthorized.
```

**Solution:**

```bash
# Check if permissions exist
php artisan permission:show

# Seed permissions if missing
php artisan db:seed --class=PermissionSeeder

# Assign permissions to roles
```

#### 4. **Migration Issues**

```
SQLSTATE[42S01]: Base table or view already exists
```

**Solution:**

```bash
# Check migration status
php artisan migrate:status

# Rollback if needed
php artisan migrate:rollback

# Run specific module migration
php artisan module:migrate ModuleName
```

#### 5. **Audit Logging Not Working**

```
No audit records being created
```

**Solution:**

- Ensure model implements `Auditable` interface
- Check `$auditInclude` property is defined
- Verify audit package is configured in `config/audit.php`
- Ensure audit migration has been run

### Frontend Issues

#### 1. **React Infinite Loop**

```
Too many re-renders. React limits the number of renders
```

**Solution:**

- Check `useEffect` dependencies
- Avoid using `JSON.stringify` in dependency arrays
- Use proper memoization with `useMemo` and `useCallback`
- Ensure `useStandardForm` hook is used correctly

#### 2. **TypeScript Errors**

```
Property 'fieldName' does not exist on type
```

**Solution:**

- Update `resources/js/types/index.ts` with proper interfaces
- Ensure form schemas match TypeScript types
- Add proper type annotations to all components

#### 3. **Form Validation Issues**

```
Validation errors not displaying
```

**Solution:**

- Check Zod schema definitions
- Ensure form fields are properly connected to schema
- Verify error handling in form components
- Check `useStandardForm` implementation

#### 4. **Build Errors**

```
Module not found: Error: Can't resolve 'component'
```

**Solution:**

```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
npm run build
```

#### 5. **Route Not Found (404)**

```
404 | NOT FOUND (Inertia page)
```

**Solution:**

- Ensure React page component exists in correct location
- Check route definitions in module's `web.php`
- Verify component is properly exported
- Check breadcrumb routes are defined

### Multi-tenancy Issues

#### 1. **Data Leaking Between Companies**

```
Seeing data from other companies
```

**Solution:**

- Ensure all models use `BelongsToCompany` trait
- Add company scoping to all queries
- Check unique constraints include `company_id`
- Verify middleware is applied correctly

#### 2. **Company Switching Not Working**

```
Still seeing old company data after switching
```

**Solution:**

- Clear session data
- Check `InitializeTenancyBySession` middleware
- Verify company switching logic
- Clear application caches

### Permission Issues

#### 1. **Permission Checks Failing**

```
User should have permission but access denied
```

**Solution:**

```bash
# Check user roles and permissions
php artisan tinker
>>> $user = User::find(1);
>>> $user->getAllPermissions();
>>> $user->hasPermissionTo('permission_name');

# Refresh permissions cache
php artisan permission:cache-reset
```

#### 2. **Navigation Menu Not Showing**

```
Menu items missing for users with permissions
```

**Solution:**

- Check permission names match exactly
- Verify menu items are properly seeded
- Check `HandleInertiaRequests` middleware
- Ensure permissions are assigned to user roles

## 🔍 Debugging Tools

### Laravel Debugging

```bash
# Enable debug mode
# Set APP_DEBUG=true in .env

# View logs
tail -f storage/logs/laravel.log

# Database queries
# Add to AppServiceProvider::boot()
DB::listen(function ($query) {
    Log::info($query->sql, $query->bindings);
});
```

### Frontend Debugging

```javascript
// React DevTools
// Install React Developer Tools browser extension

// Console debugging
console.log('Debug data:', data);

// Form debugging
const form = useStandardForm({...});
console.log('Form values:', form.getValues());
console.log('Form errors:', form.formState.errors);
```

### Multi-tenancy Debugging

```bash
# Check current tenant
php artisan tinker
>>> tenancy()->tenant;
>>> tenant()->id;

# Check company data
>>> App\Models\Company::all();
```

## 🧪 Testing Strategies

### Manual Testing Checklist

- [ ] Test with multiple companies
- [ ] Test different user roles and permissions
- [ ] Test form validation (valid and invalid data)
- [ ] Test responsive design on different screen sizes
- [ ] Test error scenarios (network errors, validation errors)
- [ ] Test audit logging functionality

### Automated Testing

```bash
# Run tests
php artisan test

# Run specific test
php artisan test --filter=TestName

# Generate test coverage
php artisan test --coverage
```

## 📊 Performance Issues

### Slow Queries

```bash
# Enable query log
DB::enableQueryLog();
// ... your code
dd(DB::getQueryLog());
```

### Large Bundle Size

```bash
# Analyze bundle
npm run build -- --analyze

# Optimize imports
# Use dynamic imports for large components
const LazyComponent = lazy(() => import('./LazyComponent'));
```

## 🔄 Cache Issues

### Clear All Caches

```bash
# Clear application caches
php artisan optimize:clear

# Clear specific caches
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Clear compiled views
php artisan view:clear

# Clear node modules cache
rm -rf node_modules/.cache
```

## 📞 Getting Help

If you're still having issues:

1. **Check the logs** - Always start with `storage/logs/laravel.log`
2. **Review similar implementations** - Look at existing modules like ChartOfAccount
3. **Test in isolation** - Create minimal test cases to isolate the issue
4. **Check dependencies** - Ensure all required packages are installed
5. **Review documentation** - Consult the comprehensive guides in this documentation

## 🚨 Emergency Fixes

### Application Won't Start

```bash
# Reset everything
composer install
npm install
php artisan key:generate
php artisan migrate
php artisan db:seed
npm run build
```

### Database Issues

```bash
# Reset database (WARNING: Destroys all data)
php artisan migrate:fresh --seed
```

### Permission Reset

```bash
# Reset all permissions
php artisan db:seed --class=PermissionSeeder
php artisan permission:cache-reset
```

Remember: When in doubt, start with the basics and work your way up. Most issues are caused by missing configurations or incorrect implementations of established patterns.
