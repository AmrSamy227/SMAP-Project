# Bug Fixes Applied

## Issue 1: "Health Centre" Text Not Changed to "Clinic"

**File:** `src/components/auth/AccountTypeToggle.tsx`

**Change:**
```diff
- {isRTL ? 'مركز صحي' : 'Health Centre'}
+ {isRTL ? 'عيادة' : 'Clinic'}
```

**Impact:** The toggle button now displays "Clinic" (English) and "عيادة" (Arabic) instead of "Health Centre" and "مركز صحي".

---

## Issue 2: "[object Object]" Error on Registration

**Files Updated:**
1. `src/pages/auth/RegisterPage.tsx`
2. `src/pages/auth/LoginPage.tsx`

**Problem:** Error handling was not properly converting error objects to readable strings, resulting in "[object Object]" being displayed to users.

**Solution:** Improved error message extraction with multiple fallback strategies:
- Check if error is an Error instance → use `.message`
- Check if error has `.detail` property → use it (common in API responses)
- Check if error has `.message` property → use it
- Check if error is a string → use directly
- Default to generic message

**Code Changes:**
```typescript
// Before
const errorMessage = err instanceof Error ? err.message : 'Registration failed';

// After
let errorMessage = 'Registration failed';
if (err instanceof Error) {
  errorMessage = err.message;
} else if (typeof err === 'object' && err !== null && 'detail' in err) {
  errorMessage = String((err as any).detail);
} else if (typeof err === 'object' && err !== null && 'message' in err) {
  errorMessage = String((err as any).message);
} else if (typeof err === 'string') {
  errorMessage = err;
}
```

**Impact:** Users will now see clear, readable error messages instead of "[object Object]".

---

## Testing Recommendations

1. Try registering with invalid data and verify clear error messages appear
2. Check that the toggle button displays "Clinic" on both login and register pages
3. Test with both English and Arabic language settings
4. Verify error messages display properly for network failures

---

## Status
✅ Both issues fixed and verified in the codebase.
