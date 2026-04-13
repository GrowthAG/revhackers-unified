# Tasks: Public Pages E2E — Test Implementation

## Setup
- [ ] Update `playwright.config.ts` with webServer auto-start
- [ ] Create test file `tests/public-pages.spec.ts`

## Homepage (AC 1-3)
- [ ] Test `/` loads without Error Boundary
- [ ] Test hero CTA button is visible
- [ ] Test partner logo grid is visible

## Blog (AC 4-5)
- [ ] Test `/blog` renders page title
- [ ] Test `/blog` does not trigger Error Boundary

## Diagnostic (AC 6-7)
- [ ] Test `/diagnostico` renders without crash
- [ ] Test form elements are present

## Score Pages (AC 8-11)
- [ ] Test `/score` renders without crash
- [ ] Test `/score-site` renders without crash
- [ ] Test `/score-founder` renders without crash
- [ ] Test `/score-revenue` renders without crash

## Booking (AC 12)
- [ ] Test `/booking` renders without Error Boundary

## Cases & Services (AC 13-15)
- [ ] Test `/cases` renders listing
- [ ] Test `/servicos` renders listing
- [ ] Test `/metodologia` renders content

## Legal (AC 16-17)
- [ ] Test `/termos-de-uso` renders
- [ ] Test `/privacidade` renders

## Redirects (AC 19-21)
- [ ] Test `/agenda` redirects to `/booking`
- [ ] Test `/signup` redirects to `/login`
- [ ] Test `/rei` redirects to `/rei-hub`

## 404 (AC 22)
- [ ] Test unknown route shows NotFound page
