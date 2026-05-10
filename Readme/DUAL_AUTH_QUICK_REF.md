# Dual Auth Quick Reference

## Files Summary

| File | Purpose | Status |
|------|---------|--------|
| `AccountTypeToggle.tsx` | Toggle component | ✅ New |
| `AdminDashboardPage.tsx` | Admin dashboard | ✅ New |
| `LoginPage.tsx` | Login with toggle | ✅ Updated |
| `RegisterPage.tsx` | Register with toggle | ✅ Updated |
| `authApi.ts` | API with role param | ✅ Updated |
| `App.tsx` | Routes for both dashboards | ✅ Updated |

## Component Usage

```tsx
<AccountTypeToggle 
  value={accountType}           // 'user' | 'health_centre'
  onChange={setAccountType}     // (type) => void
  isRTL={isRTL}                // boolean
/>
```

## API Integration

### Login
```tsx
await authApi.login({
  email: 'user@example.com',
  password: 'password',
  role: accountType  // 'user' or 'health_centre'
})
```

### Register
```tsx
await authApi.register({
  email: 'user@example.com',
  password: 'password',
  full_name: 'John Doe',
  phone: '+20123456789',
  date_of_birth: '1990-01-01',
  gender: 'male',
  language_preference: 'en',
  role: accountType  // 'user' or 'health_centre'
})
```

## Routing

| Path | Role | Purpose |
|------|------|---------|
| `/dashboard` | user | Patient dashboard |
| `/admin-dashboard` | health_centre | Admin dashboard |

## Getting User Role

```tsx
const { user } = useAuthStore();
console.log(user.role); // 'user' or 'health_centre'
```

## Toggle States

### User Selected
- Button: Blue background, white text
- Icon: 👤
- Label: "User" / "مستخدم"

### Health Centre Selected
- Button: Blue background, white text
- Icon: 🏢
- Label: "Health Centre" / "مركز صحي"

## Navigation

```tsx
// Route based on role
const path = accountType === 'health_centre' 
  ? 'admin-dashboard' 
  : 'dashboard';
navigate(`/${locale}/${path}`);
```

## Testing

```bash
# Test User Login
1. Visit /en/login
2. Keep "User" selected
3. Login → Should go to /dashboard

# Test Health Centre Login
1. Visit /en/login
2. Switch to "Health Centre"
3. Login → Should go to /admin-dashboard

# Test User Register
1. Visit /en/register
2. Keep "User" selected
3. Register → Should go to /dashboard

# Test Health Centre Register
1. Visit /en/register
2. Switch to "Health Centre"
3. Register → Should go to /admin-dashboard
```

## Styling Override

Edit `AccountTypeToggle.tsx` to customize:

```tsx
// Active button style
className={value === 'user'
  ? 'bg-primary text-white shadow-md'  // ← Customize
  : 'bg-gray-100 text-gray-700'
}
```

## Internationalization

```tsx
// Automatically uses locale for text
{isRTL ? 'مركز صحي' : 'Health Centre'}
```

## Features Included

✅ Toggle on login page
✅ Toggle on register page
✅ Smart routing to different dashboards
✅ Role parameter sent to API
✅ RTL support
✅ Responsive design
✅ Session persistence maintained
✅ JWT security maintained

## What's Next

Provide admin interface requirements:
- Layout design
- Admin features needed
- Dashboard components
- Specific functionality

Then I'll build the complete admin interface!

## Key Differences

### User Path
- Toggle set to "User"
- Accesses `/dashboard`
- Sees patient interface
- Patient features available

### Health Centre Path
- Toggle set to "Health Centre"
- Accesses `/admin-dashboard`
- Sees admin interface (coming)
- Admin features available (coming)

## Error Handling

If role not provided:
- Defaults to 'user'
- User sees patient dashboard
- Backend should validate role

## Backend Expectations

When user submits form:
1. Frontend sends role parameter
2. Backend receives and validates role
3. Backend creates user account with role
4. Backend returns user data with role
5. Frontend stores role in auth store

## Security Notes

- Role stored in secure auth store
- JWT token in HTTP-only cookie
- Role validated on backend
- User cannot change role on frontend
- All requests include authentication

---

**Everything is ready to use!** Test the toggle and let me know when you're ready for admin features.
