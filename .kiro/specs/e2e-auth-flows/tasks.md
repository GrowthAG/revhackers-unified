# Tasks: Authentication Flows E2E — Test Implementation

## Setup
- [ ] Update existing `tests/auth.spec.ts` or create `tests/auth-flows.spec.ts`

## Login Page (AC 1-4)
- [ ] Test `/login` loads without Error Boundary
- [ ] Test email input is visible
- [ ] Test password input is visible
- [ ] Test "Entrar" button is visible

## Login Validation (AC 5-6)
- [ ] Test empty form submission does not navigate away
- [ ] Test invalid credentials show error feedback

## Protected Routes (AC 7-9)
- [ ] Test unauthenticated `/admin` redirects to `/login`
- [ ] Test unauthenticated `/admin/projects` redirects to `/login`
- [ ] Test unauthenticated `/admin/pipeline` redirects to `/login`

## Password Recovery (AC 10-12)
- [ ] Test `/forgot-password` renders without crash
- [ ] Test email input is visible on forgot password page
- [ ] Test form submission shows confirmation message

## Signup Blocking (AC 13)
- [ ] Test `/signup` redirects to `/login`

## Reset Password (AC 14)
- [ ] Test `/reset-password` renders without crash

## Loading State (AC 15)
- [ ] Test initial load does not flash login page for already-loading sessions
