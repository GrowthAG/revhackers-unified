# Requirements: REI Scoring Library — Form-Based Maturity Assessment

## User Story
As a prospect filling the REI form, I want to receive an accurate maturity score based on my responses, so that I understand my operational readiness level.

## Acceptance Criteria

### Score Calculation
1. WHEN `calculateREIScore()` receives an empty form (no fields filled) THE SYSTEM SHALL return a score with percentage 0 and level "Inicial".
2. WHEN `calculateREIScore()` receives a fully filled form with high-value selections THE SYSTEM SHALL return a percentage >= 90 and level "Lider".
3. WHEN calculating score THE SYSTEM SHALL skip `company`, `responsible`, and `email` fields from scoring.

### Select Field Scoring
4. WHEN a select field has value `yes` THE SYSTEM SHALL add 15 points.
5. WHEN a select field has value `no` THE SYSTEM SHALL add 0 points.
6. WHEN a select field has value `complete` or `complete_kit` THE SYSTEM SHALL add 15 points.
7. WHEN a select field has value `basic` THE SYSTEM SHALL add 5 points.
8. WHEN a select field has value `none` THE SYSTEM SHALL add 0 points.

### Text Field Scoring
9. WHEN a textarea field has content longer than 50 characters THE SYSTEM SHALL add up to 10 points based on length (length / 20, capped at 10).
10. WHEN a text field has non-empty trimmed content (≤ 50 chars) THE SYSTEM SHALL add 5 points.
11. WHEN a field is empty THE SYSTEM SHALL add 0 points.

### Level Classification
12. WHEN percentage >= 90 THE SYSTEM SHALL classify as "Lider" with color `text-[#00CC6A]`.
13. WHEN percentage >= 70 and < 90 THE SYSTEM SHALL classify as "Avancado" with color `text-zinc-900`.
14. WHEN percentage >= 50 and < 70 THE SYSTEM SHALL classify as "Intermediario" with color `text-zinc-700`.
15. WHEN percentage >= 30 and < 50 THE SYSTEM SHALL classify as "Em Desenvolvimento" with color `text-zinc-500`.
16. WHEN percentage < 30 THE SYSTEM SHALL classify as "Inicial" with color `text-zinc-400`.

### Output Structure
17. THE SYSTEM SHALL return `total` as a rounded integer.
18. THE SYSTEM SHALL return `percentage` as a rounded integer between 0-100.
19. THE SYSTEM SHALL return `recommendations` as an array with exactly 3 strings.
20. THE SYSTEM SHALL return `description` as a non-empty string.
21. THE SYSTEM SHALL return `level` matching one of the 5 defined levels.
