# API Reference Sheet

Quick reference for all authentication endpoints.

---

## 1. POST /users/register

### Request
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "Ahmed Hassan",
  "phone": "+201001234567",
  "date_of_birth": "2000-01-15",
  "gender": "male",
  "language_preference": "en"
}
```

### Response (201 Created)
```json
{
  "id": 123,
  "email": "user@example.com",
  "full_name": "Ahmed Hassan",
  "role": "patient"
}
```

### Response (422 Validation Error)
```json
{
  "message": "Invalid request body",
  "details": {
    "phone": "Invalid phone format",
    "date_of_birth": "Invalid date format"
  }
}
```

### Code
```typescript
await authApi.register({
  email: "user@example.com",
  password: "securePassword123",
  full_name: "Ahmed Hassan",
  phone: "+201001234567",
  date_of_birth: "2000-01-15",
  gender: "male",
  language_preference: "en"
});
```

---

## 2. POST /users/login

### Request
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Response (200 OK)
```
Status: 200
Body: {
  "message": "Login successful"
}
Headers: Set-Cookie: jwt=eyJhbGciOiJIUzI1NiIs...;HttpOnly;Secure
```

### Response (401 Unauthorized)
```json
{
  "message": "Invalid email or password"
}
```

### Code
```typescript
// Step 1: Login
await authApi.login({
  email: "user@example.com",
  password: "securePassword123"
});
// Backend sets JWT in Set-Cookie header

// Step 2: Fetch user data
// (authApi.login does this automatically)
// GET /users/me → { id, email, full_name, role }
```

---

## 3. GET /users/me

### Request
```
GET /users/me
Cookie: jwt=eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

### Response (200 OK)
```json
{
  "id": 123,
  "email": "user@example.com",
  "full_name": "Ahmed Hassan",
  "role": "patient"
}
```

### Response (401 Unauthorized)
```json
{
  "message": "Unauthorized - Invalid or expired token"
}
```

### Code
```typescript
const user = await authApi.getCurrentUser();
if (user) {
  // User is authenticated
} else {
  // User is not authenticated or token expired
}
```

---

## 4. POST /users/logout

### Request
```
POST /users/logout
Cookie: jwt=eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

### Response (200 OK)
```json
{
  "message": "Logout successful"
}
```

### Code
```typescript
await authApi.logout();
// Backend clears session
// Frontend clears localStorage
```

---

## Field Requirements

### Email
- Must be valid email format: `user@example.com`
- Required for register and login

### Password
- At least 6 characters recommended
- Case sensitive
- Required for register and login

### Full Name
- 2-50 characters
- Can contain spaces and special characters
- Required for register

### Phone
- Format: `+XX XXXXXXXXX` (with country code)
- Example: `+201001234567` or `+20 100 123 4567`
- Required for register

### Date of Birth
- Format: `YYYY-MM-DD`
- Example: `2000-01-15`
- Cannot be future date
- Required for register

### Gender
- Enum: `male`, `female`, `other`
- Case sensitive
- Required for register

### Language Preference
- Enum: `en`, `ar`
- Default: `en`
- Required for register

---

## Curl Examples

### Register
```bash
curl -X POST https://yousefmohamed.pythonanywhere.com/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "Ahmed Hassan",
    "phone": "+201001234567",
    "date_of_birth": "2000-01-15",
    "gender": "male",
    "language_preference": "en"
  }' \
  -c cookies.txt
```

### Login
```bash
curl -X POST https://yousefmohamed.pythonanywhere.com/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

### Get Current User
```bash
curl -X GET https://yousefmohamed.pythonanywhere.com/users/me \
  -b cookies.txt
```

### Logout
```bash
curl -X POST https://yousefmohamed.pythonanywhere.com/users/logout \
  -b cookies.txt
```

---

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 422 Validation Error | Missing/invalid field | Check field format and spelling |
| 401 Unauthorized | Invalid credentials | Verify email and password |
| 401 Unauthorized | JWT cookie missing | Ensure credentials: 'include' |
| 401 Unauthorized | JWT expired | User needs to login again |
| 500 Server Error | Backend issue | Check backend logs |

---

## Testing Checklist

- [ ] Register with all 7 fields
- [ ] Login and see user data returned
- [ ] Hard refresh and verify still logged in
- [ ] Logout and verify can't access protected pages
- [ ] Try login with wrong password (should fail)
- [ ] Try register with invalid phone (should fail)
- [ ] Try register with future birth date (should fail)

---

## Frontend Integration

### In React Component
```typescript
import { authApi } from '../lib/api/authApi';

// Register
const response = await authApi.register({
  email: "user@example.com",
  password: "password123",
  full_name: "Ahmed Hassan",
  phone: "+201001234567",
  date_of_birth: "2000-01-15",
  gender: "male",
  language_preference: "en"
});
// response = { id, email, full_name, role }

// Login
const user = await authApi.login({
  email: "user@example.com",
  password: "password123"
});
// user = { id, email, full_name, role }

// Get current user (verify session)
const currentUser = await authApi.getCurrentUser();
// currentUser = { id, email, full_name, role } or null

// Logout
await authApi.logout();
```

---

## Storage

### LocalStorage (Persistent)
```javascript
// Zustand automatically stores this
localStorage.getItem('auth-store');
// Returns: {
//   state: {
//     user: { id, email, full_name, role },
//     isAuthenticated: true
//   }
// }
```

### HTTP Cookie (Automatic)
```
Cookie: jwt=eyJhbGciOiJIUzI1NiIs...; HttpOnly; Secure; SameSite=Strict
```
- Sent automatically with each request
- Never accessible via JavaScript
- Automatically cleared on logout

---

## Notes

- All times are UTC
- All requests should be JSON
- All responses are JSON
- CORS is enabled for frontend domain
- HTTPS required in production
