# Implementation Plan - Global Auth Check & 401 Redirect

Implement a global mechanism to check user authentication status and redirect to the login page if the session is invalid (status code 401).

## Proposed Changes

### [NEW] [apiClient.ts](file:///d:/Graduation%20Project/src/lib/api/apiClient.ts)
- Create a centralized `apiClient` using a wrapper around `fetch`.
- Automatically inject the `access_token` from `localStorage` into headers.
- Intercept all responses: if status is `401`, clear authentication state and redirect to the login page.

### [MODIFY] [authApi.ts](file:///d:/Graduation%20Project/src/lib/api/authApi.ts)
- Update `AuthApi` methods to use the new `apiClient`.
- Ensure `getCurrentUser` (calling `/users/me`) properly handles the response according to the user's requirements.

### [MODIFY] [profileApi.ts](file:///d:/Graduation%20Project/src/lib/api/profileApi.ts), [doctorApi.ts](file:///d:/Graduation%20Project/src/lib/api/doctorApi.ts), [providerApi.ts](file:///d:/Graduation%20Project/src/lib/api/providerApi.ts), [recordApi.ts](file:///d:/Graduation%20Project/src/lib/api/recordApi.ts)
- Refactor these API services to use the centralized `apiClient` to benefit from the global 401 handling.

### [MODIFY] [ProtectedRoute.tsx](file:///d:/Graduation%20Project/src/components/auth/ProtectedRoute.tsx)
- (Optional) Enhance the route guard to verify the session if needed, though the global interceptor might be sufficient.

## Verification Plan

### Manual Verification
1. Log in to the application.
2. Manually delete or modify the `access_token` in `localStorage` or wait for it to expire.
3. Perform any action that triggers an API call.
4. Verify that the app automatically redirects to the login page when a 401 error occurs.
5. Verify that calling `/users/me` specifically (as requested) works correctly for authentication verification.
