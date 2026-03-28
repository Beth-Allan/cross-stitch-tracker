# Milestone 8: Goals & Plans

**Provide alongside:** `product-overview.md`, `design-system/`, `data-shapes/goals-and-plans/types.ts`

**Prerequisites:** Milestones 2 (Project Management) and 4 (Stitching Sessions) — goals track progress from project and session data. Milestone 7 (Dashboards) for the Goals Summary teaser on the Main Dashboard.

---

## About This Handoff

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Product requirements and user flow specifications
- Design system tokens (colors, typography)
- Sample data showing the shape of data components expect
- Test specs focused on user-facing behavior

**Your job:**
- Integrate these components into your application
- Wire up callback props to your routing and business logic
- Replace sample data with real data from your backend
- Implement loading, error, and empty states

The components are props-based — they accept data and fire callbacks. How you architect the backend, data layer, and business logic is up to you.

---

## Goal

Build the goal-setting, planning, rotation management, and achievement system that helps stitchers stay motivated, track progress, and organize their multi-project workflows.

## Overview

The Goals & Plans section is a four-tab page (Goals, Plans, Rotations, Achievements) plus a ProjectGoalsPanel that embeds into the Chart Detail page. Goals range from project-specific milestones to global stitching targets. Plans schedule future activity. Rotations manage how users divide time across WIPs. Achievements are auto-tracked trophies that celebrate milestones and streaks.

## Key Functionality

### Goals Tab
- **9 goal types:**
  - Project-specific: milestone (reach X% or X stitches), frequency (stitch X times per period), deadline (finish by date), session count (complete X sessions)
  - Global: volume (stitch X per period), consistency (stitch X days per period), project completion (finish X projects per period), project start (start X per period)
  - Manual: user-defined check-off (e.g., "buy fabric for Project X")
- **Goal periods:** one-time, daily, weekly, monthly, quarterly, yearly
- **Recurrence:** per-goal auto-renew toggle; non-recurring goals get a "Continue for next month?" nudge when the period ends
- **Progress tracking:** auto-updated from session data for stitch/frequency/session goals; manual check-off for manual goals
- **Filters:** by status (active/completed/expired/paused), by scope (project/global), by period
- Paginated: 10 per page with "Show more"

### Plans Tab
- **4 plan types:** start date, recurring schedule, deadline, seasonal focus
- **Timeline view:** forward-looking chronological view with project thumbnails
- **Plan cards:** project name + thumbnail, type badge, scheduled date/recurrence, status
- Paginated: 10 per page

### Rotations Tab
- **6 rotation styles:** Round Robin, Focus + Rotate, Daily/Weekly Assignment, Milestone Rotation, Random/Shuffle, Seasonal Focus
- **Hybrid per-project triggers:** within one rotation, each project can have a different turn trigger (Project A = 1000 stitches, Project B = 1 week, Project C = 5%)
- **Turn trigger types:** time-based (days/weeks), stitch count, percentage progress, session count
- **Active rotation detail:** current project highlighted with progress ring toward trigger, project queue with drag-to-reorder, pause/skip/complete turn buttons
- One active rotation at a time; others can be paused or saved

### Achievements Tab (Trophy Case)
- **Pre-defined achievements** that auto-track from stitching data:
  - Stitch milestones: 10K, 50K, 100K, 500K, 1M lifetime
  - Streaks: 7-day, 30-day, 100-day stitching streaks
  - Variety: 25/50/100+ unique thread colours in a year
  - Records: 1K, 3K, 5K+ stitches in a single session
  - Completion: finish 1/5/10/25 projects
  - Dedication: stitch every day in a calendar month
- **Trophy grid:** unlocked achievements highlighted with date earned; locked ones dimmed with progress bar
- **6 categories:** Milestones, Streaks, Variety, Records, Completion, Dedication
- **Toast notifications** when an achievement unlocks (triggered by session logging)
- Browse-only — achievements cannot be manually created or edited

### Project Goals Panel
- Embeds into Chart Detail page as a tab or section
- Shows goals, plans, and rotation membership for that specific project
- Quick-add inline goal/plan creation without navigating away

## Components Provided

| Component | File | Purpose |
|-----------|------|---------|
| `GoalsAndPlans` | `sections/goals-and-plans/components/GoalsAndPlans.tsx` | Four-tab page (Goals, Plans, Rotations, Achievements) |
| `GoalsTab` | `sections/goals-and-plans/components/GoalsTab.tsx` | Goal list with create form and filters |
| `PlansTab` | `sections/goals-and-plans/components/PlansTab.tsx` | Plan timeline with create form |
| `RotationsTab` | `sections/goals-and-plans/components/RotationsTab.tsx` | Rotation management with detail view |
| `AchievementsTab` | `sections/goals-and-plans/components/AchievementsTab.tsx` | Trophy case grid |
| `ProjectGoalsPanel` | `sections/goals-and-plans/components/ProjectGoalsPanel.tsx` | Chart Detail embed for per-project goals |

## Props Reference

### Key Types

```typescript
type GoalType = 'milestone' | 'frequency' | 'deadline' | 'sessionCount' | 'volume'
  | 'consistency' | 'projectCompletion' | 'projectStart' | 'manual'
type GoalPeriod = 'oneTime' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
type GoalStatus = 'active' | 'completed' | 'expired' | 'paused'
type RotationStyle = 'roundRobin' | 'focusRotate' | 'dailyAssignment'
  | 'milestoneRotation' | 'randomShuffle' | 'seasonalFocus'
type TurnTriggerType = 'time' | 'stitches' | 'percentage' | 'sessions'
type AchievementCategory = 'milestones' | 'streaks' | 'variety' | 'records' | 'completion' | 'dedication'
```

### GoalsTab Callbacks

| Callback | Signature | When Fired |
|----------|-----------|------------|
| `onCreateGoal` | `(goal: Partial<Goal>) => void` | User creates a new goal |
| `onEditGoal` | `(goalId: string, updates: Partial<Goal>) => void` | User edits a goal |
| `onDeleteGoal` | `(goalId: string) => void` | User deletes a goal |
| `onTogglePause` | `(goalId: string) => void` | User pauses or resumes a goal |
| `onRenewGoal` | `(goalId: string) => void` | User accepts "Continue this goal?" nudge |
| `onDismissNudge` | `(goalId: string) => void` | User dismisses the renewal nudge |
| `onCheckOffGoal` | `(goalId: string) => void` | User manually checks off a manual goal |

### RotationsTab Callbacks

| Callback | Signature | When Fired |
|----------|-----------|------------|
| `onCreateRotation` | `(rotation: Partial<Rotation>) => void` | User creates a rotation |
| `onEditRotation` | `(rotationId: string, updates: Partial<Rotation>) => void` | User edits settings |
| `onDeleteRotation` | `(rotationId: string) => void` | User deletes a rotation |
| `onTogglePause` | `(rotationId: string) => void` | User pauses or resumes |
| `onSkipTurn` | `(rotationId: string) => void` | User skips the current turn |
| `onCompleteTurn` | `(rotationId: string) => void` | User completes the current turn |
| `onReorderProjects` | `(rotationId: string, projectIds: string[]) => void` | User drags to reorder queue |

### ProjectGoalsPanel Callbacks

| Callback | Signature | When Fired |
|----------|-----------|------------|
| `onCreateGoal` | `(goal: Partial<Goal>) => void` | User adds a goal from project detail |
| `onCreatePlan` | `(plan: Partial<Plan>) => void` | User adds a plan from project detail |
| `onEditGoal` | `(goalId: string, updates: Partial<Goal>) => void` | User edits a goal inline |
| `onDeleteGoal` | `(goalId: string) => void` | User deletes a goal |
| `onEditPlan` | `(planId: string, updates: Partial<Plan>) => void` | User edits a plan inline |
| `onDeletePlan` | `(planId: string) => void` | User deletes a plan |

## Expected User Flows

### 1. Set a Stitching Goal
1. User navigates to Goals & Plans and opens the Goals tab
2. User clicks "Create Goal" and selects type "milestone"
3. User links it to a project, sets target "Reach 50% complete," sets due date
4. User enables auto-renew so a new goal is created when this one completes
5. Goal card appears with progress bar showing current % toward 50%
6. **Outcome:** Goal created; progress auto-updates as sessions are logged

### 2. Set Up a Rotation
1. User opens the Rotations tab and clicks "Create Rotation"
2. User selects "Focus + Rotate" style and names it "Spring 2026"
3. User adds 4 WIP projects, designates one as the focus project
4. User sets hybrid triggers: focus project = 2000 stitches per turn, others = 500 stitches each
5. Rotation starts; current turn shows focus project with progress ring
6. After stitching 2000 stitches (detected from session logging), user clicks "Complete Turn"
7. Rotation advances to next project in queue
8. **Outcome:** Structured multi-project workflow with per-project turn triggers

### 3. Browse the Trophy Case
1. User opens the Achievements tab
2. Grid shows unlocked trophies (highlighted with date earned) and locked ones (dimmed with progress bars)
3. User taps "50K Lifetime Stitches" to see description and unlock date
4. A locked achievement "100-Day Streak" shows progress: 43/100 days
5. **Outcome:** Motivation through visible progress toward pre-defined milestones

### 4. Manage Goals from Project Detail
1. User opens a chart detail page and switches to the Goals & Plans tab
2. Panel shows 2 active goals for this project, 1 plan, and rotation membership
3. User clicks "Add Goal" and creates a frequency goal: "Stitch 3 times per week"
4. Goal appears in the project panel and also on the main Goals tab
5. **Outcome:** Per-project goal management without leaving the project context

## Empty States

- **Goals tab, no goals:** "No goals yet. Set your first goal to track your stitching progress." with "Create Goal" CTA
- **Plans tab, no plans:** "No plans scheduled. Plan your next stitching milestones." with "Create Plan" CTA
- **Rotations tab, no rotations:** "No rotations set up. Create a rotation to manage your WIP workflow." with "Create Rotation" CTA
- **Achievements tab, all locked:** Show all locked achievements with progress bars (never truly "empty")
- **Project Goals Panel, no goals:** "No goals for this project. Add a goal or plan to stay on track." with "Add Goal" and "Add Plan" buttons

## Files to Reference

- `sections/goals-and-plans/components/` — All screen design components
- `data-shapes/goals-and-plans/types.ts` — TypeScript interfaces for Goal, Plan, Rotation, Achievement, ProjectGoalsPanel
- `product/sections/goals-and-plans/spec.md` — Full specification
- `product/sections/goals-and-plans/data.json` — Sample data
- `product/sections/goals-and-plans/*.png` — Screenshots (goals-tab, plans-tab, rotations-tab, achievements-tab, project-goals-panel)

## Done When

- [ ] Goals & Plans page renders with four tabs (Goals, Plans, Rotations, Achievements)
- [ ] Goals tab supports all 9 goal types with create/edit/delete/pause
- [ ] Goal progress auto-updates from session logging for stitch/frequency/session goals
- [ ] Manual goals show checkbox instead of progress bar
- [ ] Auto-renew toggle works; non-recurring goals show "Continue?" nudge
- [ ] Period badges use correct colours: daily=sky, weekly=emerald, monthly=amber, quarterly=violet, yearly=rose
- [ ] Status colours: active=emerald, completed=violet, expired=stone, paused=amber
- [ ] Plans tab shows timeline view with 4 plan types
- [ ] Rotations tab supports all 6 rotation styles with hybrid per-project triggers
- [ ] Active rotation shows current turn with progress ring and queue
- [ ] Pause/skip/complete turn buttons work
- [ ] Drag-to-reorder works in the rotation queue
- [ ] Achievement trophy case shows unlocked (highlighted) and locked (dimmed with progress)
- [ ] Achievement categories: Milestones, Streaks, Variety, Records, Completion, Dedication
- [ ] Toast notification fires when an achievement unlocks
- [ ] ProjectGoalsPanel embeds into Chart Detail with quick-add for goals and plans
- [ ] Pagination: 10 items per page with "Show more"
- [ ] Filter bars appear on Goals and Plans tabs when 8+ items
- [ ] Responsive: cards stack on mobile, rotation queue scrolls horizontally
- [ ] Light and dark mode work correctly
