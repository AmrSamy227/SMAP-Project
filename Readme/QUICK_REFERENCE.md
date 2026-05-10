# Quick Reference - Authentication & Profile System

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/api/authApi.ts` | Login/Register API calls |
| `src/lib/api/profileApi.ts` | Profile API calls |
| `src/lib/store/authStore.ts` | Auth state management |
| `src/components/profile/ProfileModal.tsx` | Profile view/edit modal |
| `src/components/layout/TopNav.tsx` | Navbar with profile button |
| `src/pages/auth/LoginPage.tsx` | Login form |
| `src/pages/auth/RegisterPage.tsx` | Registration form |
| `src/hooks/useAuthInit.ts` | Session initialization |

## API Endpoints

### Public (No Auth Required)
```
POST   /users/register/user     - Register user
POST   /users/register/clinic   - Register clinic
POST   /users/login             - Login
```

### Protected (Bearer Token Required)
```
GET    /users/me                - Get current user
POST   /users/me/profile        - Create profile
PATCH  /users/me/profile        - Update profile
PATCH  /users/me/clinic         - Update clinic
POST   /users/logout            - Logout
```

## Registration Payload

### User Registration
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "+20123456789",
  "language_preference": "en",
  "profile": {
    "date_of_birth": "1990-01-15",
    "gender": "male",
    "blood_type": "O+",
    "height": "180",
    "weight": "75",
    "known_allergies": "Penicillin",
    "chronic_conditions": "None",
    "emergency_contact_name": "Jane Doe",
    "emergency_contact_phone": "+20198765432"
  }
}
```

### Clinic Registration
```json
{
  "email": "clinic@example.com",
  "password": "password123",
  "full_name": "Dr. Ahmed",
  "phone": "+20123456789",
  "language_preference": "ar",
  "clinic": {
    "name": "Al Shifa Clinic",
    "address": "123 Main St, Cairo",
    "phone": "+20224567890",
    "email": "info@clinic.com",
    "location": "30.0444,31.2357"
  }
}
```

## Login Payload

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

## Login Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "uuid": "abc-123-def",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+20123456789",
    "role": "user",
    "is_active": true
  }
}
```

## Usage Examples

### Register User
```typescript
import { authApi } from './lib/api/authApi'

const response = await authApi.registerUser({
  email: 'user@example.com',
  password: 'password123',
  full_name: 'John Doe',
  phone: '+20123456789',
  language_preference: 'en',
  profile: {
    date_of_birth: '1990-01-15',
    gender: 'male'
  }
})

// Response includes access_token + user
localStorage.setItem('access_token', response.access_token)
authStore.login(response.user)
```

### Login
```typescript
const response = await authApi.login({
  email: 'user@example.com',
  password: 'password123'
})

localStorage.setItem('access_token', response.access_token)
authStore.login(response.user)
```

### Get Profile
```typescript
import { profileApi } from './lib/api/profileApi'

const profile = await profileApi.getCurrentUserWithProfile()
// Returns: UserWithProfile with nested profile/clinic data
```

### Update Profile
```typescript
const updated = await profileApi.updateUserProfile({
  blood_type: 'A+',
  weight: '72',
  known_allergies: 'Penicillin, Aspirin'
})
```

### Logout
```typescript
await authApi.logout() // Clears backend session
localStorage.removeItem('access_token') // Clear frontend
authStore.logout() // Clear auth state
```

## Component Usage

### Open Profile Modal
```typescript
const [isProfileOpen, setIsProfileOpen] = useState(false)

<button onClick={() => setIsProfileOpen(true)}>
  Open Profile
</button>

<ProfileModal 
  isOpen={isProfileOpen} 
  onClose={() => setIsProfileOpen(false)} 
/>
```

## State Management

### Zustand Auth Store
```typescript
import { useAuthStore } from './lib/store/authStore'

const { user, isAuthenticated, login, logout } = useAuthStore()

// User data
user?.uuid
user?.email
user?.full_name
user?.phone
user?.role // 'user' or 'clinic'

// Auth state
isAuthenticated // boolean
login(user) // Set user + authenticated
logout() // Clear user + authenticated
```

## localStorage Keys

```
auth-store      - Persisted Zustand state (user + isAuthenticated)
access_token    - JWT token for API requests
```

## Bearer Token Usage

```typescript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`
}

const response = await fetch(url, {
  method: 'GET',
  headers,
  credentials: 'include'
})
```

## Error Codes

| Status | Meaning |
|--------|---------|
| 400 | Email/phone already registered, invalid data |
| 401 | Invalid credentials, expired token |
| 403 | Account deactivated, wrong role |
| 404 | User/profile not found |
| 500 | Server error |

## Common Tasks

### Check if User Logged In
```typescript
if (user && isAuthenticated) {
  // User is logged in
}
```

### Get User's Role
```typescript
const isUser = user?.role === 'user'
const isClinic = user?.role === 'clinic'
```

### Redirect Based on Role
```typescript
const dashboard = user?.role === 'clinic' 
  ? '/admin-dashboard' 
  : '/dashboard'
navigate(dashboard)
```

### Display User in UI
```typescript
{user?.full_name}
{user?.email}
{user?.phone}
{user?.role}
```

## Environment

```
API Base URL: https://yousefmohamed.pythonanywhere.com
Set in: src/lib/api/authApi.ts (const API_BASE_URL)
```

## Production Checklist

- [ ] Verify HTTPS is enabled
- [ ] Test token expiration
- [ ] Test logout functionality
- [ ] Verify Bearer token in all requests
- [ ] Test invalid credentials handling
- [ ] Test network error handling
- [ ] Check localStorage cleared on logout
- [ ] Verify RTL language support
- [ ] Test mobile responsiveness
- [ ] Check accessibility compliance

## Troubleshooting

### "Token is missing"
- Check localStorage.getItem('access_token') returns value
- Verify login was successful
- Check browser DevTools > Application > localStorage

### "401 Unauthorized"
- Token may be expired
- Try logging out and back in
- Check token format: "Bearer eyJhbGc..."

### "Profile not found"
- User hasn't created profile yet
- Call POST /users/me/profile first
- Check response status from profile endpoint

### "CORS error"
- Verify credentials: 'include' is set
- Check backend allows cross-origin requests
- Verify Bearer token header format

## Support Links

📚 Full Documentation: AUTH_SYSTEM_UPDATED.md
📊 Visual Flows: VISUAL_FLOW_GUIDE.md
✅ Complete Implementation: IMPLEMENTATION_COMPLETE.md
🎯 Profile Features: PROFILE_SYSTEM_COMPLETE.md
