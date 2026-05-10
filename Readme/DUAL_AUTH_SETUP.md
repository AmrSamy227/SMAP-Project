# Dual Authentication System Setup

## Overview

Your app now supports two types of authentication:
1. **User Account** - Regular patient/user registration and login
2. **Health Centre Account** - Admin/Health centre staff registration and login

## What's New

### Components Added

#### 1. AccountTypeToggle Component
**File:** `src/components/auth/AccountTypeToggle.tsx`

A toggle button component that allows users to switch between "User" and "Health Centre" modes on the login/register pages.

```tsx
<AccountTypeToggle 
  value={accountType} 
  onChange={setAccountType}
  isRTL={isRTL}
/>
```

**Props:**
- `value: 'user' | 'health_centre'` - Current selected account type
- `onChange: (type) => void` - Callback when toggle is changed
- `isRTL?: boolean` - RTL language support

### Pages Updated

#### 1. LoginPage (`src/pages/auth/LoginPage.tsx`)
- Added `accountType` state to track user selection
- Added `AccountTypeToggle` component at the top of the form
- Updated login API call to include `role` parameter
- Routes to different dashboards based on account type:
  - User → `/en/dashboard`
  - Health Centre → `/en/admin-dashboard`

#### 2. RegisterPage (`src/pages/auth/RegisterPage.tsx`)
- Added `accountType` state to track user selection
- Added `AccountTypeToggle` component at the top of the form
- Updated registration API call to include `role` parameter
- Routes to different dashboards based on account type
- Form fields remain the same for both user types

### API Updates

#### Updated Interfaces in `src/lib/api/authApi.ts`

```typescript
export interface LoginPayload {
  email: string;
  password: string;
  role?: string;  // NEW: 'user' or 'health_centre'
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  language_preference: string;
  role?: string;  // NEW: 'user' or 'health_centre'
}
```

### New Pages

#### AdminDashboardPage
**File:** `src/pages/admin/AdminDashboardPage.tsx`

Health centre admins are routed to this dashboard instead of the regular user dashboard. Currently displays:
- Placeholder stats (Total Patients, Appointments, Staff)
- Coming soon message for admin features

**Features to be added:**
- Patient management
- Appointment scheduling
- Staff management
- Health centre analytics

### Routes Updated

**App.tsx** now includes:
```tsx
<Route path="dashboard" element={<DashboardPage />} />
<Route path="admin-dashboard" element={<AdminDashboardPage />} />
```

## User Flow

### Registration Flow

```
User visits /register
    ↓
Selects account type (User or Health Centre)
    ↓
Fills registration form (same fields for both)
    ↓
Submits with role parameter
    ↓
Backend validates and creates account
    ↓
User redirected to appropriate dashboard:
  - User → /dashboard (patient view)
  - Health Centre → /admin-dashboard (admin view)
```

### Login Flow

```
User visits /login
    ↓
Selects account type (User or Health Centre)
    ↓
Enters email and password
    ↓
Submits with role parameter
    ↓
Backend verifies credentials
    ↓
User redirected to appropriate dashboard
```

## Backend Integration

The `role` parameter is now being sent to your backend:

### Login Request
```json
POST /users/login
{
  "email": "user@example.com",
  "password": "password123",
  "role": "user"  // or "health_centre"
}
```

### Register Request
```json
POST /users/register
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "+20123456789",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "language_preference": "en",
  "role": "user"  // or "health_centre"
}
```

### Expected Response
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "user"  // Backend returns the role
}
```

## Styling

The toggle uses Tailwind CSS with:
- Primary color for selected state
- Gray-100 background for unselected state
- Smooth transitions
- Icon support (UserIcon for User, BuildingIcon for Health Centre)
- RTL support

## Next Steps

### For Admin Dashboard Development

You mentioned you'll provide details about the admin layout soon. When you're ready, I can:

1. Create an admin-specific layout component
2. Build admin dashboard features (patient management, appointments, staff, etc.)
3. Implement role-based access control
4. Create admin-specific pages and components

### For Backend Integration

Make sure your backend:
1. Accepts the `role` parameter in login/register endpoints
2. Returns the role in the user response
3. Validates that users access appropriate endpoints based on their role
4. Handles role-specific business logic (patient vs admin operations)

## File Summary

### New Files
- `src/components/auth/AccountTypeToggle.tsx` - Toggle component
- `src/pages/admin/AdminDashboardPage.tsx` - Admin dashboard placeholder

### Modified Files
- `src/pages/auth/LoginPage.tsx` - Added toggle and role handling
- `src/pages/auth/RegisterPage.tsx` - Added toggle and role handling
- `src/lib/api/authApi.ts` - Added role parameter to interfaces
- `src/App.tsx` - Added admin dashboard route

## Testing Checklist

- [ ] User can toggle between User and Health Centre on login page
- [ ] User can toggle between User and Health Centre on register page
- [ ] Login with User account routes to dashboard
- [ ] Login with Health Centre account routes to admin-dashboard
- [ ] Register as User routes to dashboard
- [ ] Register as Health Centre routes to admin-dashboard
- [ ] Role parameter is sent to backend in requests
- [ ] Admin dashboard displays correctly
- [ ] User dashboard displays correctly

## Customization

To customize the toggle styling, edit `AccountTypeToggle.tsx`:
- Change colors by modifying Tailwind classes
- Update icons from lucide-react
- Modify button text or layout
- Add more account types if needed

## Questions?

Ready to build the admin interface when you provide the design details!
