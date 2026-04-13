# Requirements: Form Storage — LocalStorage Persistence

## User Story
As a visitor filling forms on the website, I want my form data to persist in localStorage, so that it can be pre-filled on subsequent pages in the funnel.

## Acceptance Criteria

### Save Operation
1. WHEN `saveFormData()` is called with a valid StoredFormData object THE SYSTEM SHALL serialize it to JSON and store it under the key `growthAgencyFormData`.
2. WHEN `saveFormData()` is called and localStorage throws an error THE SYSTEM SHALL catch the error silently and log to console.error.

### Retrieve Operation
3. WHEN `getFormData()` is called and data exists in localStorage THE SYSTEM SHALL return the parsed StoredFormData object.
4. WHEN `getFormData()` is called and no data exists THE SYSTEM SHALL return `null`.
5. WHEN `getFormData()` encounters a JSON parse error THE SYSTEM SHALL return `null` and log to console.error.

### Clear Operation
6. WHEN `clearFormData()` is called THE SYSTEM SHALL remove the `growthAgencyFormData` key from localStorage.
7. WHEN `clearFormData()` is called and localStorage throws an error THE SYSTEM SHALL catch the error silently and log to console.error.

### Data Integrity
8. WHEN data is saved and then retrieved THE SYSTEM SHALL return an object identical to the original input.
9. THE StoredFormData interface SHALL support fields: name, firstName, lastName, email, phone, company, industry, role, message, formType, timestamp.
