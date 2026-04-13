# Tasks: ReiScoringService — Test Implementation

## Setup
- [ ] Create test file `src/__tests__/services/ReiScoringService.spec.ts`

## Score Router (AC 1-4)
- [ ] Test calculateScore with type 'founder' delegates correctly
- [ ] Test calculateScore with type 'dev' delegates correctly
- [ ] Test calculateScore with type 'crm_ops' delegates correctly
- [ ] Test calculateScore with type 'consulting' delegates correctly
- [ ] Test calculateScore with unknown type defaults to consulting

## Founder Score (AC 5-13)
- [ ] Test frequency "Diariamente" → consistencyScore 95
- [ ] Test frequency "2-3x" → consistencyScore 80
- [ ] Test frequency "1x" → consistencyScore 60
- [ ] Test empty frequency → consistencyScore 30
- [ ] Test "Vídeos" format increases growth +20 and authority +10
- [ ] Test "Artigos" format increases authority +20 and decreases growth -5
- [ ] Test "Polêmico" tone increases growth +15 and uniqueness +20
- [ ] Test "Mentor" tone increases authority +15
- [ ] Test total score is rounded average of 4 dimensions

## Dev Score (AC 14-19)
- [ ] Test content "pronto" increases strategy +20 and conversion +10
- [ ] Test content "zero" decreases strategy -10 and tech -5
- [ ] Test brand "completo" increases design +30
- [ ] Test brand "Não temos" decreases design -15
- [ ] Test "High-Ticket" increases conversion +30
- [ ] Test "E-commerce" increases tech +20 and strategy +10

## Consulting Score (AC 20-26)
- [ ] Test large revenue increases process +20 and people +10
- [ ] Test valid CRM increases tech +20 and data +15
- [ ] Test large team (10+) increases people +30
- [ ] Test medium team (3-5) increases people +15
- [ ] Test complete marketing materials increases process +20
- [ ] Test many metrics (>4) increases data +30

## CRM Score (AC 27-32)
- [ ] Test valid CRM increases adoption +30 and data +20
- [ ] Test "conversao" challenge decreases process -10
- [ ] Test "escalar" challenge decreases automation -5
- [ ] Test "meio-processo" gargalo decreases process -15
- [ ] Test "dados-cegueira" gargalo decreases data -20
- [ ] Test "meio-followup" gargalo decreases automation -15

## Boundaries (AC 33-36)
- [ ] Test no dimension exceeds 100
- [ ] Test CRM dimensions floor at 10
- [ ] Test always returns exactly 4 radarData entries
- [ ] Test always returns exactly 3 insights strings

## Insights Text (AC 37-40)
- [ ] Test low consistency founder insight text
- [ ] Test high consistency founder insight text
- [ ] Test low data consulting/CRM insight text
- [ ] Test low adoption CRM insight text
