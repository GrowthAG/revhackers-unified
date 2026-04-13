# Design: Authentication Flows — E2E Tests

## System Architecture

Auth flow uses Supabase Auth via `AuthContext.tsx`. The E2E tests validate the **frontend rendering** of auth pages and the **route guard behavior** of `ProtectedRoute`. They do NOT test actual Supabase authentication (that would require test credentials and be flaky).

### Auth Flow Diagram

```mermaid
graph TD
    A[User visits /admin] --> B{Authenticated?}
    B -->|No| C[Redirect to /login]
    B -->|Yes| D[Render AdminDashboard]
    C --> E[User enters credentials]
    E --> F{Valid?}
    F -->|Yes| G[onAuthStateChange → SIGNED_IN]
    G --> H[fetchUserRole]
    H --> D
    F -->|No| I[Show error toast]
```

### Components Under Test

| Component | Path | Behavior |
|-----------|------|----------|
| `Login.tsx` | `/login` | Email + password form |
| `ForgotPassword.tsx` | `/forgot-password` | Email recovery form |
| `Signup.tsx` | `/signup` | Redirects to `/login` |
| `UpdatePassword.tsx` | `/reset-password` | New password form |
| `ProtectedRoute.tsx` | wraps `/admin/*` | Guards against unauthenticated access |
| `AuthContext.tsx` | global provider | Session management |

## Testing Strategy

- Test file: `tests/auth-flows.spec.ts`
- Framework: Playwright
- Approach: Rendering + redirect tests only (no real Supabase calls)
- Protected route tests: Verify redirect occurs within timeout
