# Tasks: Form Storage — Test Implementation

## Setup
- [ ] Create test file `src/__tests__/utils/formStorage.spec.ts`
- [ ] Clear localStorage in beforeEach

## Save Operation (AC 1-2)
- [ ] Test saveFormData stores data under correct key
- [ ] Test saveFormData handles localStorage errors gracefully

## Retrieve Operation (AC 3-5)
- [ ] Test getFormData returns stored data
- [ ] Test getFormData returns null when empty
- [ ] Test getFormData returns null on parse error

## Clear Operation (AC 6-7)
- [ ] Test clearFormData removes the key
- [ ] Test clearFormData handles errors gracefully

## Data Round-Trip (AC 8-9)
- [ ] Test save then retrieve returns identical object
- [ ] Test all StoredFormData fields survive serialization
