# Goals & Plans

## Overview
A comprehensive goal-setting, planning, and rotation management section that helps cross stitchers stay motivated and organized. Users can set measurable goals (project-specific or global), schedule stitching plans, manage rotation systems for dividing time across WIPs, and browse a trophy case of auto-tracked achievements. Accessible from dedicated tabbed pages and inline on Project Detail.

## User Flows
- **Goals Tab**: Create project-specific or global goals (milestone, frequency, deadline, session-based, volume, consistency, project completion/start, manual); track progress auto-updated from session logging; filter by status/type/period; manage auto-renew and renewal nudges
- **Plans Tab**: Schedule start dates, recurring schedules, deadlines, and seasonal focus for projects; view upcoming plans on a chronological timeline
- **Rotations Tab**: Create rotation systems (Round Robin, Focus+Rotate, Daily/Weekly Assignment, Milestone Rotation, Random/Shuffle, Seasonal Focus) with hybrid per-project turn triggers; manage active rotation with pause/skip/complete controls and drag-to-reorder queue
- **Achievements Tab**: Browse a trophy case of auto-tracked achievements across categories (Milestones, Streaks, Variety, Records, Completion, Dedication); unlocked achievements highlighted with date earned, locked ones dimmed with progress
- **Project Detail Integration**: View and quick-add goals, plans, and rotation membership for a specific project inline on Chart Detail

## Components Provided
- `GoalsAndPlans` — Main tabbed page wrapping all four tabs: Goals, Plans, Rotations, Achievements
- `ProjectGoalsPanel` — Embeddable panel for Chart Detail showing project-specific goals, plans, and rotation membership with inline creation

## Props Reference

### Key Data Entities
- `Goal` — id, title, description, type, period, status, project (nullable for global), targetValue, currentValue, unit, startDate, endDate, dueDate, isRecurring, autoRenew, completedAt, showRenewalNudge
- `Plan` — id, title, description, project, planType, status, scheduledDate, endDate, recurrenceLabel, recurrenceDayOfWeek, season
- `Rotation` — id, name, description, style, status, projects[] (with per-project turn triggers), currentTurnStartedAt
- `RotationProject` — project, order, turnTrigger (type + value + unit), isFocus, isCurrent, turnProgress, turnTarget, turnUnit
- `Achievement` — id, name, description, icon, category, currentValue, targetValue, unit, isUnlocked, unlockedAt
- `ProjectSummary` — id, name, designerName, coverImageUrl, statusGradient, totalStitches, completedStitches, percentComplete, status

### Key Callback Props — Goals
- `onCreateGoal` / `onEditGoal` / `onDeleteGoal` — Goal CRUD
- `onTogglePause` — Pause or resume a goal
- `onRenewGoal` — Accept renewal nudge for next period
- `onDismissNudge` — Dismiss the renewal nudge
- `onCheckOffGoal` — Manually complete a manual goal

### Key Callback Props — Plans
- `onCreatePlan` / `onEditPlan` / `onDeletePlan` — Plan CRUD
- `onUpdatePlanStatus` — Mark plan as completed or skipped

### Key Callback Props — Rotations
- `onCreateRotation` / `onEditRotation` / `onDeleteRotation` — Rotation CRUD
- `onTogglePause` — Pause or resume a rotation
- `onSkipTurn` / `onCompleteTurn` — Advance to next project in rotation
- `onReorderProjects` — Drag-to-reorder project queue

### Type Enums
- `GoalType`: milestone, frequency, deadline, sessionCount, volume, consistency, projectCompletion, projectStart, manual
- `GoalPeriod`: oneTime, daily, weekly, monthly, quarterly, yearly
- `GoalStatus`: active, completed, expired, paused
- `PlanType`: startDate, recurringSchedule, deadline, seasonalFocus
- `PlanStatus`: upcoming, active, completed, skipped
- `RotationStyle`: roundRobin, focusRotate, dailyAssignment, milestoneRotation, randomShuffle, seasonalFocus
- `RotationStatus`: active, paused, completed
- `TurnTriggerType`: time, stitches, percentage, sessions
- `AchievementCategory`: milestones, streaks, variety, records, completion, dedication

## Visual Reference
See the screenshot .png files in this directory for the target UI design.
