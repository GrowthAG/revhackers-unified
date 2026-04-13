# Tasks: REI Scoring Library — Test Implementation

## Setup
- [ ] Create test file `src/__tests__/lib/reiScoring.spec.ts`

## Core Score Calculation (AC 1-3)
- [ ] Test empty form returns percentage 0 and level "Inicial"
- [ ] Test fully filled high-value form returns percentage >= 90 and level "Lider"
- [ ] Test company, responsible, and email fields are excluded from scoring

## Select Field Scoring (AC 4-8)
- [ ] Test hasPlans='yes' adds 15 points
- [ ] Test hasPlans='no' adds 0 points
- [ ] Test hasPlans='complete' adds 15 points
- [ ] Test hasPlans='basic' adds 5 points
- [ ] Test hasPlans='none' adds 0 points
- [ ] Test hasMarketingMaterials='complete_kit' adds 15 points

## Text Field Scoring (AC 9-11)
- [ ] Test long textarea (>50 chars) adds points proportional to length
- [ ] Test textarea score caps at 10
- [ ] Test short text field with content adds 5 points
- [ ] Test empty field adds 0 points

## Level Boundaries (AC 12-16)
- [ ] Test percentage 90+ → "Lider" + green accent color
- [ ] Test percentage 70-89 → "Avancado" + zinc-900 color
- [ ] Test percentage 50-69 → "Intermediario" + zinc-700 color
- [ ] Test percentage 30-49 → "Em Desenvolvimento" + zinc-500 color
- [ ] Test percentage 0-29 → "Inicial" + zinc-400 color

## Output Structure (AC 17-21)
- [ ] Test total is a rounded integer
- [ ] Test percentage is a rounded integer 0-100
- [ ] Test recommendations has exactly 3 strings
- [ ] Test description is a non-empty string
- [ ] Test level matches one of the 5 defined levels
