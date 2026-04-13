# Design: REI Scoring Library

## System Architecture

Pure function module at `src/lib/reiScoring.ts` (137 lines). Single export `calculateREIScore()` takes form data object, iterates fields, applies scoring weights, and returns `REIScore` interface.

### Scoring Weight Map

```typescript
const SCORING_WEIGHTS = {
    text: 5,       // Simple filled text field
    textarea: 10,  // Rich text field (scored by length)
    select: {      // Named value mappings
        'yes': 15, 'no': 0,
        'personalized': 10, 'complete': 15,
        'basic': 5, 'none': 0, 'some': 8,
        'structured': 15, 'informal': 8, 'none_plan': 0,
        // Revenue tiers, marketing materials, etc.
    }
};
```

### Scoring Algorithm
1. Iterate all key/value pairs in formData
2. Skip `company`, `responsible`, `email` (identity fields)
3. Match `hasPlans`, `hasMarketingMaterials` as select fields → maxScore += 15
4. Match long strings (>50 chars) as textarea → maxScore += 10
5. Match non-empty strings as text → maxScore += 5
6. Calculate percentage = (totalScore / maxScore) * 100
7. Map percentage to level band

## Testing Strategy

- Test file: `src/__tests__/lib/reiScoring.spec.ts`
- Environment: Node
- No mocks needed
- Create fixture form data objects for each level boundary
