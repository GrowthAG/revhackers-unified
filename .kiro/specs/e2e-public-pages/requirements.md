# Requirements: Public Pages — E2E Smoke Tests

## User Story
As a visitor, I want all public pages to load without errors, so that I can access diagnostic tools, blog content, case studies, and booking functionality without encountering crashes or blank screens.

## Acceptance Criteria

### Homepage
1. WHEN navigating to `/` THE SYSTEM SHALL render the page without triggering the Error Boundary.
2. WHEN the homepage loads THE SYSTEM SHALL display the hero section with a visible CTA button.
3. WHEN the homepage loads THE SYSTEM SHALL display the partner logo grid.

### Blog
4. WHEN navigating to `/blog` THE SYSTEM SHALL render the blog listing page with at least the page title visible.
5. WHEN navigating to `/blog/:slug` with a valid slug THE SYSTEM SHALL render the article content without errors.

### Diagnostic
6. WHEN navigating to `/diagnostico` THE SYSTEM SHALL render the diagnostic form without triggering the Error Boundary.
7. WHEN the diagnostic page loads THE SYSTEM SHALL display form input elements.

### Score Pages
8. WHEN navigating to `/score` THE SYSTEM SHALL render the Growth Score form without crashing.
9. WHEN navigating to `/score-site` THE SYSTEM SHALL render the Site Score form without crashing.
10. WHEN navigating to `/score-founder` THE SYSTEM SHALL render the Founder Score form without crashing.
11. WHEN navigating to `/score-revenue` THE SYSTEM SHALL render the Revenue Score form without crashing.

### Booking
12. WHEN navigating to `/booking` THE SYSTEM SHALL render the booking page without the Error Boundary being triggered.

### Cases
13. WHEN navigating to `/cases` THE SYSTEM SHALL render the cases listing page.

### Services
14. WHEN navigating to `/servicos` THE SYSTEM SHALL render the services listing page.

### Methodology
15. WHEN navigating to `/metodologia` THE SYSTEM SHALL render the methodology page.

### Legal Pages
16. WHEN navigating to `/termos-de-uso` THE SYSTEM SHALL render the terms of use page.
17. WHEN navigating to `/privacidade` THE SYSTEM SHALL render the privacy policy page.

### Error Boundary Guard
18. FOR all public pages THE SYSTEM SHALL NOT display text matching "Algo deu errado" (Error Boundary fallback).

### Redirects
19. WHEN navigating to `/agenda` THE SYSTEM SHALL redirect to `/booking`.
20. WHEN navigating to `/signup` THE SYSTEM SHALL redirect to `/login`.
21. WHEN navigating to `/rei` THE SYSTEM SHALL redirect to `/rei-hub`.

### 404 Route
22. WHEN navigating to a non-existent route (e.g., `/this-does-not-exist`) THE SYSTEM SHALL render the NotFound page.
