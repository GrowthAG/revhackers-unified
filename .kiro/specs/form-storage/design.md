# Design: Form Storage

## System Architecture

Simple utility module at `src/utils/formStorage.ts` (50 lines). Three exported functions wrapping `localStorage` with error handling.

### API

| Function | Input | Output | Side Effect |
|----------|-------|--------|-------------|
| `saveFormData(data)` | `StoredFormData` | `void` | Writes to localStorage |
| `getFormData()` | none | `StoredFormData \| null` | Reads from localStorage |
| `clearFormData()` | none | `void` | Removes from localStorage |

## Testing Strategy

- Test file: `src/__tests__/utils/formStorage.spec.ts`
- Environment: jsdom (provides localStorage mock)
- Clear localStorage in `beforeEach`
- Mock `console.error` to assert error handling
