# Code Reference - Quick Lookup

## 🔑 Key Imports in Your Code

### Using Authentication in Components

```typescript
// 1. Import the auth store
import { useAuthStore } from '../../lib/store/authStore';

// 2. Use in component
const { user, isAuthenticated, login, logout } = useAuthStore();

// Access user data
console.log(user?.full_name);  // John Doe
console.log(user?.email);      // john@example.com
console.log(user?.role);       // patient
console.log(user?.id);         // 1
```

### Calling API Methods

```typescript
// 1. Import the auth API
import { authApi } from '../../lib/api/authApi';

// 2. Login
try {
  const user = await authApi.login({
    email: 'user@example.com',
    password: 'password123'
  });
  console.log('Logged in:', user);
} catch (error) {
  console.error('Login failed:', error.message);
}

// 3. Register
try {
  const user = await authApi.register({
    email: 'user@example.com',
    password: 'password123',
    full_name: 'John Doe'
  });
  console.log('Registered:', user);
} catch (error) {
  console.error('Registration failed:', error.message);
}

// 4. Logout
try {
  await authApi.logout();
} catch (error) {
  console.error('Logout failed:', error.message);
}
```

### Creating Protected Pages

```typescript
// In App.tsx, wrap routes with ProtectedRoute:
import { ProtectedRoute } from './components/auth/ProtectedRoute';

<Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
  <Route path="dashboard" element={<DashboardPage />} />
  <Route path="profile" element={<ProfilePage />} />
  {/* All nested routes are protected */}
</Route>
```

## 📚 File Locations

```
src/
├── lib/
│   ├── api/
│   │   └── authApi.ts              ← API calls (login, register, logout)
│   ├── store/
│   │   └── authStore.ts            ← User state management
│   └── i18n/
│       └── LanguageContext.tsx
├── hooks/
│   └── useAuthInit.ts              ← Restore session on app load
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx       ← Route protection wrapper
│   └── layout/
│       ├── TopNav.tsx              ← Logout button, user display
│       ├── Sidebar.tsx
│       └── AppLayout.tsx
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx           ← Login form + API integration
│   │   └── RegisterPage.tsx        ← Register form + API integration
│   ├── dashboard/
│   │   └── DashboardPage.tsx       ← Uses user?.full_name
│   ├── profile/
│   │   └── ProfilePage.tsx         ← Displays real user data
│   └── ...
└── App.tsx                         ← Root + route setup + ProtectedRoute
```

## 🔧 Code Snippets for Common Tasks

### Get Current User in Any Component

```typescript
import { useAuthStore } from '../lib/store/authStore';

export function MyComponent() {
  const user = useAuthStore((state) => state.user);
  
  return <div>Hello, {user?.full_name}!</div>;
}
```

### Check if User is Authenticated

```typescript
import { useAuthStore } from '../lib/store/authStore';

export function MyComponent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <div>Please log in first</div>;
  }
  
  return <div>Welcome, authenticated user!</div>;
}
```

### Handle Login in Component

```typescript
import { useAuthStore } from '../lib/store/authStore';
import { authApi } from '../lib/api/authApi';

export function MyLoginForm() {
  const login = useAuthStore((state) => state.login);
  
  const handleLogin = async (email: string, password: string) => {
    try {
      const userData = await authApi.login({ email, password });
      login(userData);  // Save to store
      // Navigate to dashboard
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return <form onSubmit={/* ... */}>...</form>;
}
```

### Handle Logout in Component

```typescript
import { useAuthStore } from '../lib/store/authStore';
import { authApi } from '../lib/api/authApi';

export function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);
  
  const handleLogout = async () => {
    try {
      await authApi.logout();  // Call backend
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      logout();  // Clear local state
      // Navigate to login
    }
  };
  
  return <button onClick={handleLogout}>Logout</button>;
}
```

### Display User Data Conditionally

```typescript
import { useAuthStore } from '../lib/store/authStore';

export function UserInfo() {
  const user = useAuthStore((state) => state.user);
  
  return (
    <>
      {user && (
        <div>
          <p>Name: {user.full_name}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
        </div>
      )}
    </>
  );
}
```

### Subscribe to User Changes

```typescript
import { useAuthStore } from '../lib/store/authStore';
import { useEffect } from 'react';

export function MyComponent() {
  useEffect(() => {
    // Subscribe to user changes
    const unsubscribe = useAuthStore.subscribe(
      (state) => state.user,
      (user) => {
        console.log('User changed:', user);
      }
    );
    
    return unsubscribe;
  }, []);
  
  return <div>Component</div>;
}
```

## 📊 Data Flow Examples

### Login Flow Step by Step

```typescript
// 1. User fills form
<input value={email} onChange={...} />
<input value={password} onChange={...} />

// 2. User clicks submit
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // 3. Call API
  const userData = await authApi.login({ email, password });
  
  // 4. Store user
  login(userData);
  
  // 5. Redirect
  navigate('/en/dashboard');
};

// 6. On new page:
// - User data is in authStore
// - localStorage['auth-store'] has { user, isAuthenticated }
// - Components can access via useAuthStore()

// 7. On refresh:
// - useAuthInit runs
// - Restores from localStorage
// - User stays logged in
```

### Protected Route Check

```typescript
// In ProtectedRoute.tsx
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    // User not logged in
    return <Navigate to="/en/login" replace />;
  }
  
  // User logged in
  return children;
}

// In App.tsx
<Route element={<ProtectedRoute>
  <AppLayout />
</ProtectedRoute>}>
  {/* All child routes protected */}
</Route>
```

## 🎯 Type Definitions

### User Type
```typescript
interface User {
  id: number;           // From backend
  email: string;        // From backend
  full_name: string;    // From backend
  role: string;         // From backend
}
```

### Auth State Type
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeAuth: (user: User | null) => void;
}
```

### API Payload Types
```typescript
interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

interface AuthResponse {
  id: number;
  email: string;
  full_name: string;
  role: string;
}
```

## 🔍 Debugging Tips

### Check if User is Stored
```javascript
// In browser console
JSON.parse(localStorage.getItem('auth-store'));
// Should show: { state: { user: {...}, isAuthenticated: true } }
```

### Check API Calls
```javascript
// Open DevTools → Network tab
// Try login
// Should see: POST /users/login
// Response: { id: 1, email: "...", full_name: "...", role: "..." }
```

### Check Auth Store State
```typescript
import { useAuthStore } from '../lib/store/authStore';

// In component
const state = useAuthStore((state) => state);
console.log('Auth state:', state);
// Should show: { user: {...}, isAuthenticated: true, ... }
```

### Enable Debug Logging
```typescript
// In authApi.ts - already has console.log("[v0] ...")
console.log('[v0] Login successful:', response);
console.log('[v0] Login error:', err);

// In LoginPage.tsx - already has
console.log('[v0] Login successful:', response);

// Look for "[v0]" in console to debug auth flow
```

## 📋 Configuration

### Change API URL
```typescript
// In src/lib/api/authApi.ts
const API_BASE_URL = 'https://yousefmohamed.pythonanywhere.com';
// Change to your URL
```

### Change localStorage Key
```typescript
// In src/lib/store/authStore.ts
persist(
  (set) => ({...}),
  {
    name: 'auth-store',  // Change key here
  }
)
```

### Extend User Type
```typescript
// In src/lib/store/authStore.ts & authApi.ts
interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  // Add more fields:
  // phone?: string;
  // avatar?: string;
  // createdAt?: string;
}
```

## ✅ Checklist for New Features

To add new auth features:

- [ ] Add endpoint to authApi.ts if needed
- [ ] Update User type if needed
- [ ] Add to AuthState if needed
- [ ] Update components that use the data
- [ ] Update localStorage persist config
- [ ] Add error handling
- [ ] Test with backend
- [ ] Update documentation
