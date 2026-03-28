# Test Specs: Goals & Plans

Framework-agnostic UI behavior test specs. Adapt to your testing setup.

## Overview
Test goal creation and tracking, plan scheduling, rotation management with turn controls, achievement trophy case display, and project detail integration.

## User Flow Tests

### Create a Project Goal
**Scenario:** User creates a milestone goal linked to a specific project.

#### Success Path
**Steps:**
1. Navigate to Goals & Plans page, Goals tab active
2. Click "Create Goal"
3. Select goal type: "Milestone"
4. Link to project: "Mystic Garden" (searchable select)
5. Set target: reach 50% complete
6. Set period: "One Time"
7. Set due date: June 2026
8. Toggle auto-renew off
9. Click "Save"

**Expected Results:**
- [ ] Create Goal form allows picking type, target, project, period, and due date
- [ ] `onCreateGoal` is called with { type: "milestone", project, targetValue: 50, unit: "%", period: "oneTime", dueDate, autoRenew: false }
- [ ] New goal card appears with: title, project name, progress bar (current % / 50%), due date, period badge
- [ ] Progress bar shows percentage + fraction (e.g., "15,000 / 30,000 stitches")

#### Create a Global Goal
**Steps:**
1. Click "Create Goal"
2. Select type: "Volume"
3. Leave project unlinked (global goal)
4. Set target: 10,000 stitches per month
5. Toggle auto-renew on
6. Click "Save"

**Expected Results:**
- [ ] Global goals do not require a project link
- [ ] Period badge shows "monthly" in amber pill
- [ ] Auto-renew toggle is clearly visible on the form

---

### Goal Renewal Nudge
**Scenario:** A non-recurring goal completes its period and shows a renewal nudge.

#### Success Path
**Steps:**
1. View a completed non-recurring goal with showRenewalNudge=true
2. Click "Continue for next month?"
3. Alternatively, click "Dismiss"

**Expected Results:**
- [ ] Renewal nudge appears as a subtle banner at the top of the completed goal card
- [ ] `onRenewGoal` is called when accepting the nudge
- [ ] `onDismissNudge` is called when dismissing
- [ ] Nudge does not appear for goals with autoRenew=true (they renew automatically)

---

### Create and Manage a Rotation
**Scenario:** User creates a Round Robin rotation with multiple WIP projects.

#### Success Path
**Steps:**
1. Switch to the Rotations tab
2. Click "Create Rotation"
3. Enter name: "Weekly Rotation"
4. Select style: "Round Robin"
5. Add 3 projects from the WIP list
6. Set turn trigger for Project A: 1000 stitches; Project B: 1 week; Project C: 5%
7. Click "Save"
8. View the active rotation detail

**Expected Results:**
- [ ] `onCreateRotation` is called with name, style, projects with per-project triggers
- [ ] Rotation card shows: name, "Round Robin" style badge, project count (3), current turn project with progress ring
- [ ] Active rotation detail highlights current project with progress ring toward trigger
- [ ] Project queue shows all 3 projects with drag-to-reorder handles
- [ ] "Next up" queue is visible below the current project

#### Advance the Rotation
**Steps:**
1. View the active rotation with Project A as current
2. Click "Complete Turn"
3. Observe rotation advances to Project B

**Expected Results:**
- [ ] `onCompleteTurn` is called with the rotation ID
- [ ] Current project changes to the next in queue
- [ ] Progress ring resets for the new current project
- [ ] "Skip Turn" button is also available as an alternative

---

### Browse Achievement Trophy Case
**Scenario:** User views their achievements and progress toward locked ones.

#### Success Path
**Steps:**
1. Switch to the Achievements tab
2. Browse the trophy case grid

**Expected Results:**
- [ ] Unlocked achievements show: full color card, icon, name, unlock date
- [ ] Locked achievements show: dimmed/greyed card, progress bar toward unlock target
- [ ] Achievements are grouped by category: Milestones, Streaks, Variety, Records, Completion, Dedication
- [ ] Tapping an achievement shows full description, unlock date, and related stats
- [ ] No create/edit/delete actions (browse-only view)

---

### Project Detail Integration
**Scenario:** User views and adds goals/plans for a specific project from Chart Detail.

#### Success Path
**Steps:**
1. Navigate to a project's Chart Detail page
2. Open the "Goals & Plans" tab
3. View existing goals and plans for this project
4. Click "Add Goal" for inline quick-add
5. View rotation membership status

**Expected Results:**
- [ ] Only goals, plans, and rotation membership for this specific project are shown
- [ ] "Add Goal" and "Add Plan" buttons allow inline creation without navigating away
- [ ] `onCreateGoal` is called with the project pre-linked
- [ ] Rotation membership section shows which rotation(s) this project belongs to and current turn status

## Empty State Tests
- [ ] Goals tab with no goals shows "Create your first goal" prompt
- [ ] Plans tab with no plans shows "Schedule your first plan" prompt
- [ ] Rotations tab with no rotations shows "Create a rotation to manage your WIPs" prompt
- [ ] Achievements tab with all locked shows progress toward each (no empty state needed)
- [ ] Project Detail Goals & Plans tab with no goals shows "Set Goals" prompt
- [ ] Rotation with only 1 project shows a hint to add more projects

## Component Interaction Tests
- [ ] Period badges use correct colors: daily=sky, weekly=emerald, monthly=amber, quarterly=violet, yearly=rose
- [ ] Status colors: active=emerald, completed=violet, expired=stone, paused=amber
- [ ] Manual goals show a simple checkbox instead of a progress bar
- [ ] Goals and Plans lists paginate at 10 items with "Show more"
- [ ] Filter bar appears on Goals tab when 8+ goals exist
- [ ] Rotation "current turn" shows a progress ring, not just a bar
- [ ] Achievement unlock toast notification fires when triggered by session logging

## Edge Cases
- [ ] Goal with targetValue=0 does not cause divide-by-zero in progress calculation
- [ ] Rotation with all projects paused shows appropriate state
- [ ] Plan with scheduledDate in the past shows as "overdue" or completed
- [ ] Achievement with currentValue > targetValue shows as 100% (capped, not >100%)
- [ ] Deleting the last project from a rotation prompts to delete the rotation
- [ ] Very long goal titles and plan descriptions truncate in card views
- [ ] One active rotation at a time — creating a new active rotation pauses the existing one
