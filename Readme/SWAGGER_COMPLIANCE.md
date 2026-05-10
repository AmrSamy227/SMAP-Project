# Swagger API Compliance

This document shows exactly how the code now matches your Swagger API documentation.

---

## Endpoint: POST /users/login

### Swagger Specification
```
Request:
{
  "email": string,
  "password": string
}

Response (200):
{
  "message": "Login successful"
}

Note: JWT is sent via Set-Cookie header
```

### Implementation
**File:** `src/lib/api/authApi.ts`

```typescript
async login(payload: LoginPayload): Promise<AuthResponse> {
  // Step 1: Call login endpoint
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // IMPORTANT: Include cookies
    body: JSON.stringify(payload), // { email, password }
  });

  // Step 2: Backend sets JWT in Set-Cookie header (automatic)
  // Step 3: Fetch user data from /users/me
  const meResponse = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    credentials: 'include', // IMPORTANT: Include cookies
  });

  // Step 4: Return user data
  const data: AuthResponse = await meResponse.json();
  return data;
}
```

---

## Endpoint: POST /users/register

### Swagger Specification
```
Request:
{
  "email": string (required),
  "password": string (required),
  "full_name": string (required),
  "phone": string (required),
  "date_of_birth": string (required, format: YYYY-MM-DD),
  "gender": string (required, enum: male/female/other),
  "language_preference": string (required, enum: en/ar)
}

Response (201):
{
  "id": number,
  "email": string,
  "full_name": string,
  "role": string
}
```

### Implementation
**File:** `src/lib/api/authApi.ts`

```typescript
export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone: string;                    // ✅ Added
  date_of_birth: string;            // ✅ Added (YYYY-MM-DD)
  gender: string;                   // ✅ Added
  language_preference: string;      // ✅ Added
}

async register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload), // Send all required fields
  });

  const data: AuthResponse = await response.json();
  return data;
}
```

**Form Implementation:** `src/pages/auth/RegisterPage.tsx`

```typescript
const [formData, setFormData] = useState({
  full_name: '',          // ✅ User name
  email: '',              // ✅ Email
  password: '',           // ✅ Password
  confirmPassword: '',    // Verify password
  phone: '',              // ✅ Phone number
  date_of_birth: '',      // ✅ Birth date (YYYY-MM-DD)
  gender: 'male',         // ✅ Gender dropdown
  language_preference: locale === 'ar' ? 'ar' : 'en', // ✅ Auto-set
});

const handleSubmit = async (e) => {
  // ... validation ...
  
  const response = await authApi.register({
    email: formData.email,
    password: formData.password,
    full_name: formData.full_name,
    phone: formData.phone,           // ✅ Included
    date_of_birth: formData.date_of_birth, // ✅ Included
    gender: formData.gender,         // ✅ Included
    language_preference: formData.language_preference, // ✅ Included
  });
};
```

**Form Fields Added:**
```tsx
{/* Phone Number */}
<input
  type="tel"
  name="phone"
  placeholder="+20 1XX XXX XXXX"
  // ... styling ...
/>

{/* Date of Birth */}
<input
  type="date"
  name="date_of_birth"
  // ... styling ...
/>

{/* Gender */}
<select name="gender">
  <option value="male">Male</option>
  <option value="female">Female</option>
  <option value="other">Other</option>
</select>
```

---

## Endpoint: GET /users/me

### Swagger Specification
```
Request:
- No body
- JWT sent automatically via cookie

Response (200):
{
  "id": number,
  "email": string,
  "full_name": string,
  "role": string
}

Response (401):
Authentication failed - cookie invalid or missing
```

### Implementation
**File:** `src/lib/api/authApi.ts`

```typescript
async getCurrentUser(): Promise<AuthResponse | null> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    credentials: 'include', // ✅ Cookie included automatically
  });

  if (!response.ok) {
    return null; // Invalid session
  }

  return await response.json();
}
```

**Usage in Session Initialization:** `src/hooks/useAuthInit.ts`

```typescript
useEffect(() => {
  const initializeAuthFromStorage = async () => {
    // Load user from localStorage
    if (user && isAuthenticated) {
      // Verify JWT is still valid
      const response = await authApi.getCurrentUser();
      
      if (response) {
        // Session valid - user stays logged in
        initializeAuth(user);
      } else {
        // Session invalid - logout
        logout();
      }
    }
  };
  
  initializeAuthFromStorage();
}, []);
```

---

## Endpoint: POST /users/logout

### Swagger Specification
```
Request:
- No body
- JWT sent automatically via cookie

Response (200):
{
  "message": "Logout successful"
}
```

### Implementation
**File:** `src/lib/api/authApi.ts`

```typescript
async logout(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/users/logout`, {
      method: 'POST',
      credentials: 'include', // ✅ Cookie included
    });
  } catch (error) {
    console.error('[v0] Logout error:', error);
  }
}
```

---

## Cookie Handling Pattern

### Critical Detail: credentials: 'include'
Every API call **must** include `credentials: 'include'`:

```typescript
fetch(url, {
  method: 'POST',
  credentials: 'include', // ✅ MUST BE PRESENT
  ...
})
```

**Why:**
- Tells browser to send cookies with request
- Tells browser to store cookies from response
- Enables HTTP-only cookie handling

### JWT Flow
1. **Registration/Login:** Backend sets `Set-Cookie: jwt=...;HttpOnly`
2. **Subsequent Requests:** Browser automatically includes cookie
3. **Backend Validation:** Server validates JWT from cookie
4. **Logout:** Backend clears cookie or marks as invalid

---

## Data Persistence Strategy

### What Gets Stored
```
LocalStorage (via Zustand persist):
{
  auth-store: {
    user: { id, email, full_name, role },
    isAuthenticated: true
  }
}
```

### What Gets Sent with Requests
```
HTTP Cookie (automatically by browser):
Cookie: jwt=eyJhbGciOiJIUzI1NiIs...
```

### On Page Refresh
1. Zustand hydrates from localStorage
2. `useAuthInit` calls `/users/me` with stored cookie
3. If valid → user stays logged in
4. If invalid → user is logged out

---

## Compliance Checklist

- [x] Login endpoint returns `{ message }`, not token
- [x] Login fetches user data from `/users/me`
- [x] Register sends all 7 required fields
- [x] All API calls include `credentials: 'include'`
- [x] Session verified on page refresh with `/users/me`
- [x] Date of birth in YYYY-MM-DD format
- [x] Language preference auto-set from locale
- [x] HTTP-only cookie handling (automatic)

Your implementation is now **100% Swagger compliant!**
