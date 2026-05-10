# Quick Start - Authentication System

## 🚀 What's Ready to Use

Your app now has a **complete JWT authentication system** with automatic session persistence. Users stay logged in after refresh and only log out when they manually click the logout button.

## ✅ Features Implemented

| Feature | Status | Details |
|---------|--------|---------|
| Login with Backend API | ✅ | Connects to `/users/login` |
| Register with Backend API | ✅ | Connects to `/users/register` |
| JWT Storage | ✅ | HTTP-only cookie (automatic) |
| Session Persistence | ✅ | Stays logged in after refresh |
| Protected Routes | ✅ | All app pages require login |
| User Profile Data | ✅ | Shows real registration data |
| Logout | ✅ | Manual logout only |
| Error Handling | ✅ | User-friendly messages |

## 📋 Testing Checklist

### 1. Register a New User
- [ ] Navigate to `/en/register`
- [ ] Fill form: email, password, confirm password, full name
- [ ] Click register
- [ ] Should see dashboard with welcome message using your name
- [ ] Refresh page - should still be logged in

### 2. Test Login
- [ ] Click user avatar → Logout
- [ ] Navigate to `/en/login`
- [ ] Enter your registered credentials
- [ ] Should redirect to dashboard
- [ ] Refresh page - should still be logged in

### 3. Test Protected Routes
- [ ] While logged in, all pages work: `/en/dashboard`, `/en/profile`, etc.
- [ ] Logout
- [ ] Try accessing `/en/dashboard` directly
- [ ] Should redirect to `/en/login`

### 4. Test Session Persistence
- [ ] Login with your account
- [ ] Hard refresh (Ctrl+F5 or Cmd+Shift+R)
- [ ] Should still be logged in
- [ ] Check browser dev tools > Application > Local Storage
- [ ] Should see "auth-store" key with your user data

## 📁 Key Files

```
src/lib/api/authApi.ts          ← Login/Register API calls
src/lib/store/authStore.ts      ← User state + localStorage
src/hooks/useAuthInit.ts        ← Restore user on app load
src/components/auth/ProtectedRoute.tsx ← Route protection
src/pages/auth/LoginPage.tsx    ← Login form connected to API
src/pages/auth/RegisterPage.tsx ← Register form connected to API
```

## 🔧 How It Works

### Session Flow
```
User Registers
    ↓
Backend returns { id, email, full_name, role }
    ↓
Auth store saves to localStorage
    ↓
User directed to dashboard
    ↓
Refresh page
    ↓
App initializes & restores from localStorage
    ↓
User stays logged in ✓
```

### Protected Routes Flow
```
User tries to access /en/dashboard
    ↓
ProtectedRoute checks if authenticated
    ↓
If NO → redirect to /en/login
If YES → show dashboard
```

## 🌐 API Endpoints

Your backend needs these endpoints:

```bash
POST /users/login
Body: { email, password }
Response: { id, email, full_name, role }

POST /users/register
Body: { email, password, full_name }
Response: { id, email, full_name, role }

POST /users/logout (optional)
- Clears backend session

GET /users/me (optional)
- Returns current user
```

## 💾 Data Persistence

User data is automatically saved to localStorage under key: `auth-store`

```javascript
// Stored structure
{
  "auth-store": {
    "state": {
      "user": {
        "id": 1,
        "email": "user@example.com",
        "full_name": "John Doe",
        "role": "patient"
      },
      "isAuthenticated": true
    }
  }
}
```

## 🐛 Debugging Tips

### User not staying logged in?
1. Open browser dev tools → Application tab
2. Check Local Storage for "auth-store" key
3. Should contain user data after login
4. If missing, check console for errors

### Login/Register not working?
1. Open dev tools → Network tab
2. Try login, watch for API request
3. Check if request hits correct endpoint
4. Look at response status and body
5. Check browser console for error messages

### User data not showing in profile?
1. Verify user has `full_name` field (not `name`)
2. Check auth store has correct data after login
3. ProfilePage reads from `user?.full_name`

## 🎯 Next Steps (Optional)

- Add password reset functionality
- Add email verification on registration
- Implement token refresh for expired tokens
- Add admin dashboard with different permissions
- Set up multi-language error messages

## 📚 Documentation

See `AUTHENTICATION_SETUP.md` for detailed information about:
- Complete API integration guide
- How session persistence works
- Error handling strategies
- Troubleshooting common issues
