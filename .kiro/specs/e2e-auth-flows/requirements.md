# Requirements: Authentication Flows — E2E Tests

## User Story
As an admin user, I want the authentication system to work reliably, so that I can log in securely, recover my password, and access protected routes without unexpected failures.

## Acceptance Criteria

### Login Page Rendering
1. WHEN navigating to `/login` THE SYSTEM SHALL render the login page without triggering the Error Boundary.
2. WHEN the login page loads THE SYSTEM SHALL display an email input field.
3. WHEN the login page loads THE SYSTEM SHALL display a password input field.
4. WHEN the login page loads THE SYSTEM SHALL display a submit button with text matching "Entrar".

### Login Validation
5. WHEN a user submits the login form with an empty email THE SYSTEM SHALL not proceed with authentication.
6. WHEN a user submits the login form with invalid credentials THE SYSTEM SHALL display an error message.

### Protected Route Guard
7. WHEN an unauthenticated user navigates to `/admin` THE SYSTEM SHALL redirect to `/login`.
8. WHEN an unauthenticated user navigates to `/admin/projects` THE SYSTEM SHALL redirect to `/login`.
9. WHEN an unauthenticated user navigates to `/admin/pipeline` THE SYSTEM SHALL redirect to `/login`.

### Password Recovery Page
10. WHEN navigating to `/forgot-password` THE SYSTEM SHALL render the password recovery form without errors.
11. WHEN the forgot password page loads THE SYSTEM SHALL display an email input field.
12. WHEN a valid email is submitted THE SYSTEM SHALL display a confirmation message.

### Signup Blocking
13. WHEN navigating to `/signup` THE SYSTEM SHALL redirect to `/login` (public registration disabled).

### Reset Password Page
14. WHEN navigating to `/reset-password` without a recovery token THE SYSTEM SHALL render the page without crashing.

### Loading State
15. WHEN the auth state is loading THE SYSTEM SHALL display a loading indicator and NOT flash the login page.
