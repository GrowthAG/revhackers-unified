# Requirements: Orqflow Store — Kanban Task Management (Zustand)

## User Story 1: Task CRUD Operations
As a project manager, I want to create, update, move, and delete tasks on the project Kanban board, so that my team can track work progress in real-time.

## Acceptance Criteria

### Fetch Tasks
1. WHEN `fetchTasks()` is called with a projectId THE SYSTEM SHALL load all tasks and normalize them into `tasks` (O(1) lookup map) and `kanbanColumns` (status → id arrays).
2. WHEN a sprintId is provided THE SYSTEM SHALL filter tasks by that sprint.
3. WHEN fetching completes THE SYSTEM SHALL set `isLoading` to false.
4. WHEN a database error occurs THE SYSTEM SHALL show a destructive toast and set `isLoading` to false.

### Create Task
5. WHEN `createTask()` is called THE SYSTEM SHALL insert a task with `position_order` set to `currentColumnLength * 1000`.
6. WHEN creation succeeds THE SYSTEM SHALL add the task to `tasks` map and append its ID to the correct `kanbanColumns` array.
7. WHEN creation succeeds THE SYSTEM SHALL show a success toast.
8. WHEN creation fails THE SYSTEM SHALL show a destructive toast.

### Update Task
9. WHEN `updateTask()` is called THE SYSTEM SHALL apply an optimistic update to the `tasks` map immediately.
10. WHEN the database update succeeds THE SYSTEM SHALL keep the optimistic state.
11. WHEN the database update fails THE SYSTEM SHALL revert to the previous task state and show a destructive toast.

### Delete Task
12. WHEN `deleteTask()` is called THE SYSTEM SHALL remove the task from the database and then from the `tasks` map.
13. WHEN deletion succeeds THE SYSTEM SHALL show a success toast.
14. WHEN deletion fails THE SYSTEM SHALL show a destructive toast without removing from state.

---

## User Story 2: Drag-and-Drop Movement
As a project manager, I want to drag tasks between columns with instant visual feedback, so that I can reorganize work without waiting for database confirmation.

## Acceptance Criteria

### Move Task (Same Column)
15. WHEN `moveTask()` is called with the same status column THE SYSTEM SHALL reorder the task within that column's array without creating a new column entry.
16. WHEN reordering within a column THE SYSTEM SHALL remove from old index and insert at new index.

### Move Task (Cross Column)
17. WHEN `moveTask()` is called with a different status THE SYSTEM SHALL remove the task ID from the source column array and insert it into the target column array at the specified index.
18. WHEN moving cross-column THE SYSTEM SHALL update the task's `status` in the `tasks` map.

### Optimistic Updates
19. WHEN a move operation starts THE SYSTEM SHALL update the UI immediately (optimistic).
20. WHEN the database persist fails THE SYSTEM SHALL rollback to the exact previous state (snapshot-based rollback).
21. WHEN rollback occurs THE SYSTEM SHALL show a destructive toast explaining the revert.

### Database Persistence
22. WHEN a task is moved THE SYSTEM SHALL persist `status` and `position_order` to the database.

---

## User Story 3: Time Tracking
As a team member, I want to track time spent on tasks, so that project hours are accurately logged for billing and analysis.

## Acceptance Criteria

### Start Timer
23. WHEN `startTimer()` is called and no timer is active THE SYSTEM SHALL insert a time log with `start_time` and set `activeTimer` in state.
24. WHEN `startTimer()` is called and a timer is already active THE SYSTEM SHALL show a warning toast and NOT create a new timer.
25. WHEN the user is not authenticated THE SYSTEM SHALL show a destructive toast and NOT start the timer.

### Stop Timer
26. WHEN `stopTimer()` is called THE SYSTEM SHALL calculate `duration_seconds` and update the time log with `end_time` and `duration_seconds`.
27. WHEN `stopTimer()` succeeds THE SYSTEM SHALL clear `activeTimer` from state and show a success toast with accumulated minutes.
28. WHEN no timer is active THE SYSTEM SHALL do nothing.

---

## User Story 4: Realtime Subscriptions
As a collaborator, I want to see task changes from other users in real-time, so that the Kanban board stays synchronized across sessions.

## Acceptance Criteria

### Subscribe
29. WHEN `subscribeToTasks()` is called THE SYSTEM SHALL create a Supabase realtime channel filtered by `project_id`.
30. WHEN a previous subscription exists THE SYSTEM SHALL unsubscribe before creating a new one.

### INSERT Events
31. WHEN a realtime INSERT event arrives THE SYSTEM SHALL add the task to `tasks` map and append to the correct column (if not already present).

### UPDATE Events
32. WHEN a realtime UPDATE event arrives and the status changed THE SYSTEM SHALL remove the task from the old column and add to the new column.
33. WHEN a realtime UPDATE event arrives without status change THE SYSTEM SHALL update the task data in the map.

### DELETE Events
34. WHEN a realtime DELETE event arrives THE SYSTEM SHALL remove the task from `tasks` map and from its column array.

### Unsubscribe
35. WHEN `unsubscribeFromTasks()` is called THE SYSTEM SHALL remove the Supabase channel and set `realtimeChannel` to null.

---

## User Story 5: Sprint Management
As a project manager, I want to fetch sprints for a project, so that I can organize tasks by delivery cycle.

## Acceptance Criteria

### Fetch Sprints
36. WHEN `fetchSprints()` is called with a projectId THE SYSTEM SHALL return all sprints ordered by `start_date` descending.
37. WHEN a database error occurs THE SYSTEM SHALL show a destructive toast.

### Fetch Workspace Users
38. WHEN `fetchWorkspaceUsers()` is called THE SYSTEM SHALL return all profiles from the database.
39. WHEN a database error occurs THE SYSTEM SHALL log to console without showing a toast.
