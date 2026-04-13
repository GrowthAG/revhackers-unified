# Tasks: Diagnostic Mapping — Test Implementation

## Setup
- [ ] Create test file `src/__tests__/utils/diagnosticMapping.spec.ts`

## Revenue Type (AC 4-6)
- [ ] Test revenue + score 25 → "Inconsistência de Escala" + "red-500"
- [ ] Test revenue + score 65 → "Oportunidade de Eficiência" + "revgreen"
- [ ] Test revenue + score 95 → "Alta Performance Operacional" + "white"

## Growth Type (AC 7-9)
- [ ] Test growth + score 25 → "Fragilidade de Ativos" + "red-500"
- [ ] Test growth + score 65 → "Maturidade em Progresso" + "revgreen"
- [ ] Test growth + score 95 → "Maturidade de Crescimento" + "white"

## Site Type (AC 10-12)
- [ ] Test site + score 25 → "Infraestrutura Obsoleta" + "red-500"
- [ ] Test site + score 65 → "Gargalo de Conversão" + "revgreen"
- [ ] Test site + score 95 → "Excelência de Infraestrutura" + "white"

## Founder Type (AC 13-15)
- [ ] Test founder + score 25 → "Desconexão de Autoridade" + "red-500"
- [ ] Test founder + score 65 → "Autoridade em Construção" + "revgreen"
- [ ] Test founder + score 95 → "Liderança de Pensamento" + "white"

## Output Structure (AC 16-17)
- [ ] Test all results have title, description, action, color
- [ ] Test no field is empty string

## Boundary Values (AC 18-23)
- [ ] Test score 49 → critical
- [ ] Test score 50 → warning
- [ ] Test score 89 → warning
- [ ] Test score 90 → optimized
- [ ] Test score 0 → critical
- [ ] Test score 100 → optimized
