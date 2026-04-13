# Requirements: ReiScoringService — Maturity Score Calculator

## User Story 1: Score Calculation by REI Type
As an admin analyst, I want the ReiScoringService to calculate accurate maturity scores for each REI type (founder, dev, consulting, crm_ops), so that prospects receive data-driven assessments of their operational readiness.

## Acceptance Criteria

### Score Router
1. WHEN `calculateScore()` is called with type `founder` THE SYSTEM SHALL delegate to `calculateFounderScore()`.
2. WHEN `calculateScore()` is called with type `dev` THE SYSTEM SHALL delegate to `calculateDevScore()`.
3. WHEN `calculateScore()` is called with type `crm_ops` THE SYSTEM SHALL delegate to `calculateCrmScore()`.
4. WHEN `calculateScore()` is called with type `consulting` or any unknown type THE SYSTEM SHALL delegate to `calculateConsultingScore()`.

### Founder Score
5. WHEN content_frequency includes "Diariamente" THE SYSTEM SHALL set consistencyScore to 95.
6. WHEN content_frequency includes "2-3x" THE SYSTEM SHALL set consistencyScore to 80.
7. WHEN content_frequency includes "1x" THE SYSTEM SHALL set consistencyScore to 60.
8. WHEN content_frequency is empty or unrecognized THE SYSTEM SHALL set consistencyScore to 30.
9. WHEN preferred_formats includes "Vídeos" THE SYSTEM SHALL increase growthScore by 20 and authorityScore by 10.
10. WHEN preferred_formats includes "Artigos" THE SYSTEM SHALL increase authorityScore by 20 and decrease growthScore by 5.
11. WHEN tone_voice includes "Polêmico" THE SYSTEM SHALL increase growthScore by 15 and uniquenessScore by 20.
12. WHEN tone_voice includes "Mentor" THE SYSTEM SHALL increase authorityScore by 15.
13. WHEN calculating total score THE SYSTEM SHALL average the 4 dimensions and round to nearest integer.

### Dev Score
14. WHEN contentStatus includes "pronto" THE SYSTEM SHALL increase strategyScore by 20 and conversionPotential by 10.
15. WHEN contentStatus includes "zero" THE SYSTEM SHALL decrease strategyScore by 10 and techScore by 5.
16. WHEN brandGuidelines includes "completo" THE SYSTEM SHALL increase designScore by 30.
17. WHEN brandGuidelines includes "Não temos" THE SYSTEM SHALL decrease designScore by 15.
18. WHEN projectType includes "High-Ticket" THE SYSTEM SHALL increase conversionPotential by 30.
19. WHEN projectType includes "E-commerce" THE SYSTEM SHALL increase techScore by 20 and strategyScore by 10.

### Consulting Score
20. WHEN revenue/tamanho includes "Acima de" or "10 milhões" or "50+" THE SYSTEM SHALL increase processScore by 20 and peopleScore by 10.
21. WHEN CRM field is valid (length > 3 and not "nao-utilizo") THE SYSTEM SHALL increase techScore by 20 and dataScore by 15.
22. WHEN timeGrowth includes "10+" or "6-10" THE SYSTEM SHALL increase peopleScore by 30.
23. WHEN timeGrowth includes "3-5" THE SYSTEM SHALL increase peopleScore by 15.
24. WHEN marketingMaterials includes "completos" THE SYSTEM SHALL increase processScore by 20.
25. WHEN metricas array has more than 4 items THE SYSTEM SHALL increase dataScore by 30.
26. WHEN metricas array has 3-4 items THE SYSTEM SHALL increase dataScore by 15.

### CRM Score
27. WHEN CRM field is valid (length > 3 and not "nao-utilizo") THE SYSTEM SHALL increase adoptionScore by 30 and dataScore by 20.
28. WHEN desafios includes "conversao" or "previsibilidade" THE SYSTEM SHALL decrease processScore by 10.
29. WHEN desafios includes "escalar" THE SYSTEM SHALL decrease automationsScore by 5.
30. WHEN gargaloFunil includes "meio-processo" THE SYSTEM SHALL decrease processScore by 15.
31. WHEN gargaloFunil includes "dados-cegueira" THE SYSTEM SHALL decrease dataScore by 20.
32. WHEN gargaloFunil includes "meio-followup" THE SYSTEM SHALL decrease automationsScore by 15.

### Score Boundaries
33. WHEN any individual dimension exceeds 100 THE SYSTEM SHALL cap it at 100.
34. WHEN any individual CRM dimension is below 10 THE SYSTEM SHALL floor it at 10 (CRM score only).
35. THE SYSTEM SHALL always return exactly 4 radarData entries.
36. THE SYSTEM SHALL always return exactly 3 insights strings.

### Insight Text Logic
37. WHEN consistencyScore < 60 (Founder) THE SYSTEM SHALL return insight about limited growth due to publishing frequency.
38. WHEN consistencyScore >= 60 (Founder) THE SYSTEM SHALL return positive cadence insight.
39. WHEN dataScore < 50 (Consulting/CRM) THE SYSTEM SHALL return insight about data collection gaps.
40. WHEN adoptionScore < 60 (CRM) THE SYSTEM SHALL return insight about tool adoption friction.
