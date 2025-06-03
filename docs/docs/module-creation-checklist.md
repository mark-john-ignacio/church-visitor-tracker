# Module Creation Checklist

Use this checklist when creating a new resource module to ensure you follow all the established patterns.

## 📋 Pre-Development

- [ ] **Define Requirements**

    - [ ] Identify data fields and relationships
    - [ ] Define business rules and validation
    - [ ] Plan permission structure
    - [ ] Design data flow and user workflows

- [ ] **Module Planning**
    - [ ] Choose appropriate module name (PascalCase)
    - [ ] Plan database schema and relationships
    - [ ] Identify required constants and enums
    - [ ] Plan frontend component structure

## 🔧 Backend Development

### Laravel Module Setup

- [ ] **Generate Module**
    ```bash
    php artisan module:make ModuleName
    ```
- [ ] **Create Model** (`Modules/ModuleName/app/Models/ModelName.php`)

    - [ ] Add `BelongsToCompany` trait
    - [ ] Implement `Auditable` interface
    - [ ] Define constants for types/categories/statuses
    - [ ] Add `SORTABLE_COLUMNS` constant
    - [ ] Configure `$auditInclude` array
    - [ ] Implement `generateTags()` method
    - [ ] Define fillable fields and casts
    - [ ] Add relationships (belongsTo, hasMany, etc.)
    - [ ] Create query scopes (active, search, etc.)
    - [ ] Add helper methods (isActive, canBeDeleted, etc.)
    - [ ] Define static methods for constants (getAvailableTypes, etc.)
    - [ ] Link to factory with `newFactory()` method

- [ ] **Create Migration** (`php artisan module:make-migration create_table_name ModuleName`)

    - [ ] Add `company_id` foreign key with cascade delete
    - [ ] Define all required fields with proper types
    - [ ] Add enum constraints for categories/types/statuses
    - [ ] Create appropriate indexes
    - [ ] Add unique constraints where needed (company_id + code)

- [ ] **Create Controller** (`Modules/ModuleName/app/Http/Controllers/ModelController.php`)

    - [ ] Extend base `Controller` class
    - [ ] Define `ITEMS_PER_PAGE` constant
    - [ ] Implement `index()` method with search, sort, pagination
    - [ ] Implement `create()` method with required data
    - [ ] Implement `store()` method with validation
    - [ ] Implement `edit()` method with model and required data
    - [ ] Implement `update()` method with validation
    - [ ] Implement `destroy()` method with business logic checks
    - [ ] Add private validation method
    - [ ] Add authorization helper methods

- [ ] **Configure Routes** (`Modules/ModuleName/routes/web.php`)

    - [ ] Add middleware: `['web', 'auth', InitializeTenancyBySession::class]`
    - [ ] Add permission middleware
    - [ ] Use resource routes with appropriate prefix and name

- [ ] **Create Factory** (Optional)
    - [ ] Generate factory: `php artisan module:make-factory ModelNameFactory ModuleName`
    - [ ] Define default attributes
    - [ ] Add state methods for different types/categories

### Database & Configuration

- [ ] **Run Migration**

    ```bash
    php artisan module:migrate ModuleName
    ```

- [ ] **Update modules_statuses.json**
    ```json
    {
        "ModuleName": true
    }
    ```

## 🎨 Frontend Development

### React Components

- [ ] **Create Schema** (`resources/js/pages/module-name/model-name/components/schema.ts`)

    - [ ] Define Zod schema with proper validation
    - [ ] Export TypeScript type
    - [ ] Create normalization function
    - [ ] Add custom validation rules if needed

- [ ] **Create Form Component** (`resources/js/pages/module-name/model-name/components/Form.tsx`)

    - [ ] Use `useStandardForm` hook
    - [ ] Implement all form fields with proper types
    - [ ] Add conditional logic and field interactions
    - [ ] Handle form submission and success callbacks
    - [ ] Add proper loading and disabled states

- [ ] **Create Data Table Columns** (`resources/js/pages/module-name/model-name/components/columns.tsx`)
    - [ ] Define proper TypeScript interface
    - [ ] Add sortable columns with `ArrowUpDown` icon
    - [ ] Use appropriate badges for status/type fields
    - [ ] Implement actions dropdown with view/edit/delete
    - [ ] Add delete confirmation with proper messaging
    - [ ] Format data appropriately (dates, currency, etc.)

### Page Components

- [ ] **Create Index Page** (`resources/js/pages/module-name/model-name/index.tsx`)

    - [ ] Use `DataTable` component with proper props
    - [ ] Add breadcrumbs navigation
    - [ ] Include create button
    - [ ] Handle pagination and filters
    - [ ] Add proper page title and description

- [ ] **Create Create Page** (`resources/js/pages/module-name/model-name/create.tsx`)

    - [ ] Use form component with default values
    - [ ] Add proper breadcrumbs
    - [ ] Handle form submission
    - [ ] Add loading states

- [ ] **Create Edit Page** (`resources/js/pages/module-name/model-name/edit.tsx`)
    - [ ] Load existing data properly
    - [ ] Use memoized default values
    - [ ] Handle form submission
    - [ ] Add proper breadcrumbs with current item

### TypeScript Types

- [ ] **Update Global Types** (`resources/js/types/index.ts`)
    - [ ] Add model interface
    - [ ] Add page props interfaces
    - [ ] Export all types properly

## 🔐 Security & Permissions

- [ ] **Create Permissions**

    - [ ] Add to `PermissionSeeder`
    - [ ] Define appropriate permission names
    - [ ] Run seeder: `php artisan db:seed --class=PermissionSeeder`

- [ ] **Add Navigation Menu**

    - [ ] Add to navigation seeder or admin panel
    - [ ] Include proper icon and permissions
    - [ ] Set appropriate order

- [ ] **Test Authorization**
    - [ ] Verify permission checks work
    - [ ] Test company data isolation
    - [ ] Ensure unauthorized access is blocked

## 🧪 Testing & Validation

- [ ] **Manual Testing**

    - [ ] Test create functionality
    - [ ] Test edit functionality
    - [ ] Test delete functionality
    - [ ] Test search and sorting
    - [ ] Test pagination
    - [ ] Test validation errors
    - [ ] Test permission restrictions
    - [ ] Test multi-company data isolation

- [ ] **Build Verification**

    ```bash
    npm run build
    ```

- [ ] **Code Quality**
    - [ ] Run TypeScript check
    - [ ] Verify no console errors
    - [ ] Check responsive design
    - [ ] Validate accessibility

## 📝 Documentation

- [ ] **Update Documentation**

    - [ ] Add module to project README
    - [ ] Document any special business rules
    - [ ] Add to architecture documentation

- [ ] **Code Comments**
    - [ ] Add JSDoc comments for complex methods
    - [ ] Document business logic in comments
    - [ ] Add TODO comments for future enhancements

## 🚀 Deployment Checklist

- [ ] **Database**

    - [ ] Ensure migration is included in production deploy
    - [ ] Run permission seeder in production
    - [ ] Update navigation menus

- [ ] **Frontend**
    - [ ] Verify production build works
    - [ ] Test in production environment
    - [ ] Monitor for any runtime errors

## 📋 Common Gotchas

- ⚠️ **Always use `tenant()->id` for company scoping**
- ⚠️ **Include `company_id` in unique constraints**
- ⚠️ **Use `withQueryString()` for pagination links**
- ⚠️ **Add proper TypeScript types for all props**
- ⚠️ **Use `useStandardForm` hook for consistent behavior**
- ⚠️ **Add audit logging to all important models**
- ⚠️ **Test with multiple companies to ensure data isolation**

## 🔄 Quick Commands Reference

```bash
# Generate new module
php artisan module:make ModuleName

# Create migration
php artisan module:make-migration create_table_name ModuleName

# Create factory
php artisan module:make-factory ModelNameFactory ModuleName

# Run module migrations
php artisan module:migrate ModuleName

# Build frontend
npm run build

# Start development server
npm run dev
```

---

This checklist ensures your new modules follow all established patterns and integrate seamlessly with the MyXFin application architecture.
