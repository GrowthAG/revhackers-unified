# Tasks: Orqflow Store — Test Implementation

## Setup
- [ ] Create test file `src/__tests__/store/useOrqflow.spec.ts`
- [ ] Setup Supabase mock
- [ ] Setup initial Zustand state in beforeEach

## Fetch Tasks (AC 1-4)
- [ ] Test fetchTasks normalizes tasks into map and kanbanColumns
- [ ] Test fetchTasks filters by sprintId when provided
- [ ] Test isLoading set to false after fetch
- [ ] Test error shows destructive toast and sets isLoading false

## Create Task (AC 5-8)
- [ ] Test createTask sets position_order to columnLength * 1000
- [ ] Test createTask adds to tasks map and kanbanColumns
- [ ] Test createTask shows success toast
- [ ] Test createTask error shows destructive toast

## Update Task (AC 9-11)
- [ ] Test updateTask applies optimistic update immediately
- [ ] Test updateTask keeps state on DB success
- [ ] Test updateTask reverts state on DB failure and shows toast

## Delete Task (AC 12-14)
- [ ] Test deleteTask removes from DB and tasks map
- [ ] Test deleteTask shows success toast
- [ ] Test deleteTask error shows destructive toast

## Move Same Column (AC 15-16)
- [ ] Test move within same column reorders array correctly
- [ ] Test old index removed and new index inserted

## Move Cross Column (AC 17-18)
- [ ] Test cross-column move removes from source and adds to target
- [ ] Test task status updated in tasks map

## Optimistic Updates (AC 19-21)
- [ ] Test UI updates before database confirm
- [ ] Test exact rollback to snapshot on failure
- [ ] Test rollback shows destructive toast

## Database Persist (AC 22)
- [ ] Test move persists status and position_order

## Start Timer (AC 23-25)
- [ ] Test startTimer creates time log and sets activeTimer
- [ ] Test startTimer with active timer shows warning
- [ ] Test startTimer without auth shows destructive toast

## Stop Timer (AC 26-28)
- [ ] Test stopTimer calculates duration and updates log
- [ ] Test stopTimer clears activeTimer and shows toast
- [ ] Test stopTimer does nothing when no timer active

## Realtime Subscribe (AC 29-30)
- [ ] Test subscribeToTasks creates channel with project filter
- [ ] Test duplicate subscription unsubscribes first

## Realtime Events (AC 31-34)
- [ ] Test INSERT event adds task to map and column
- [ ] Test UPDATE with status change moves between columns
- [ ] Test UPDATE without status change updates task data
- [ ] Test DELETE removes from map and column

## Unsubscribe (AC 35)
- [ ] Test unsubscribeFromTasks removes channel

## Sprints (AC 36-37)
- [ ] Test fetchSprints returns ordered sprints
- [ ] Test fetchSprints error shows toast

## Workspace Users (AC 38-39)
- [ ] Test fetchWorkspaceUsers returns profiles
- [ ] Test fetchWorkspaceUsers error logs to console
