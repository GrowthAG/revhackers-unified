# Requirements: Diagnostic Mapping — Score-to-Insight Resolver

## User Story
As a prospect viewing my diagnostic result, I want to see contextual insights matching my score level and diagnostic type, so that I understand the severity of my situation and the recommended action.

## Acceptance Criteria

### Score Ranges
1. WHEN score is 0-49 THE SYSTEM SHALL return the `critical` insight level for the given diagnostic type.
2. WHEN score is 50-89 THE SYSTEM SHALL return the `warning` insight level for the given diagnostic type.
3. WHEN score is 90-100 THE SYSTEM SHALL return the `optimized` insight level for the given diagnostic type.

### Revenue Type
4. WHEN type is `revenue` and level is critical THE SYSTEM SHALL return title "Inconsistência de Escala" with color "red-500".
5. WHEN type is `revenue` and level is warning THE SYSTEM SHALL return title "Oportunidade de Eficiência" with color "revgreen".
6. WHEN type is `revenue` and level is optimized THE SYSTEM SHALL return title "Alta Performance Operacional" with color "white".

### Growth Type
7. WHEN type is `growth` and level is critical THE SYSTEM SHALL return title "Fragilidade de Ativos" with color "red-500".
8. WHEN type is `growth` and level is warning THE SYSTEM SHALL return title "Maturidade em Progresso" with color "revgreen".
9. WHEN type is `growth` and level is optimized THE SYSTEM SHALL return title "Maturidade de Crescimento" with color "white".

### Site Type
10. WHEN type is `site` and level is critical THE SYSTEM SHALL return title "Infraestrutura Obsoleta" with color "red-500".
11. WHEN type is `site` and level is warning THE SYSTEM SHALL return title "Gargalo de Conversão" with color "revgreen".
12. WHEN type is `site` and level is optimized THE SYSTEM SHALL return title "Excelência de Infraestrutura" with color "white".

### Founder Type
13. WHEN type is `founder` and level is critical THE SYSTEM SHALL return title "Desconexão de Autoridade" with color "red-500".
14. WHEN type is `founder` and level is warning THE SYSTEM SHALL return title "Autoridade em Construção" with color "revgreen".
15. WHEN type is `founder` and level is optimized THE SYSTEM SHALL return title "Liderança de Pensamento" with color "white".

### Output Structure
16. THE SYSTEM SHALL always return an object with `title`, `description`, `action`, and `color` fields.
17. THE SYSTEM SHALL return non-empty strings for all 4 fields.

### Boundary Values
18. WHEN score is exactly 49 THE SYSTEM SHALL return `critical`.
19. WHEN score is exactly 50 THE SYSTEM SHALL return `warning`.
20. WHEN score is exactly 89 THE SYSTEM SHALL return `warning`.
21. WHEN score is exactly 90 THE SYSTEM SHALL return `optimized`.
22. WHEN score is exactly 0 THE SYSTEM SHALL return `critical`.
23. WHEN score is exactly 100 THE SYSTEM SHALL return `optimized`.
