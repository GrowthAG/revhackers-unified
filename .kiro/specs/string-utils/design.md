# Design: String Utilities

## System Architecture

Minimal utility at `src/utils/stringUtils.ts` (7 lines). Single exported function `removeEmojis()` using a comprehensive regex to strip Unicode emoji ranges.

### Regex Pattern
```regex
/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g
```

## Testing Strategy

- Test file: `src/__tests__/utils/stringUtils.spec.ts`
- Environment: Node
- No mocks needed
- Test with real emoji characters from various Unicode blocks
