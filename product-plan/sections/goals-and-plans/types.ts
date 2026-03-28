// Goals & Plans — TypeScript Interfaces

// ─── Enums / Union Types ────────────────────────────────────────────

export type GoalType =
  | 'milestone'      // reach X% or X stitches on a project
  | 'frequency'      // stitch on project X times per period
  | 'deadline'       // finish or reach milestone by date
  | 'sessionCount'   // complete X sessions on a project
  | 'volume'         // stitch X stitches per period (global)
  | 'consistency'    // stitch X days per period (global)
  | 'projectCompletion' // finish X projects per period (global)
  | 'projectStart'   // start X new projects per period (global)
  | 'manual';        // user-defined check-off

export type GoalPeriod = 'oneTime' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type GoalStatus = 'active' | 'completed' | 'expired' | 'paused';

export type PlanType = 'startDate' | 'recurringSchedule' | 'deadline' | 'seasonalFocus';

export type PlanStatus = 'upcoming' | 'active' | 'completed' | 'skipped';

export type RotationStyle =
  | 'roundRobin'
  | 'focusRotate'
  | 'dailyAssignment'
  | 'milestoneRotation'
  | 'randomShuffle'
  | 'seasonalFocus';

export type RotationStatus = 'active' | 'paused' | 'completed';

export type TurnTriggerType = 'time' | 'stitches' | 'percentage' | 'sessions';

export type AchievementCategory = 'milestones' | 'streaks' | 'variety' | 'records' | 'completion' | 'dedication';

// ─── Core Interfaces ────────────────────────────────────────────────

export interface ProjectSummary {
  id: string;
  name: string;
  designerName: string;
  coverImageUrl: string | null;
  statusGradient: string;
  totalStitches: number;
  completedStitches: number;
  percentComplete: number;
  status: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  period: GoalPeriod;
  status: GoalStatus;
  /** Linked project (null for global goals) */
  project: ProjectSummary | null;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate: string | null;
  dueDate: string | null;
  isRecurring: boolean;
  autoRenew: boolean;
  completedAt: string | null;
  /** Show "Continue this goal?" nudge */
  showRenewalNudge: boolean;
  createdAt: string;
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  project: ProjectSummary;
  planType: PlanType;
  status: PlanStatus;
  scheduledDate: string | null;
  endDate: string | null;
  /** Human-readable recurrence description, e.g. "Every Friday" */
  recurrenceLabel: string | null;
  /** Day of week (0=Sun–6=Sat) for recurring schedules */
  recurrenceDayOfWeek: number | null;
  /** For seasonal plans: season name */
  season: string | null;
  createdAt: string;
}

export interface TurnTrigger {
  type: TurnTriggerType;
  value: number;
  unit: string;
}

export interface RotationProject {
  project: ProjectSummary;
  order: number;
  turnTrigger: TurnTrigger;
  isFocus: boolean;
  isCurrent: boolean;
  turnProgress: number;
  turnTarget: number;
  turnUnit: string;
}

export interface Rotation {
  id: string;
  name: string;
  description: string;
  style: RotationStyle;
  status: RotationStatus;
  projects: RotationProject[];
  currentTurnStartedAt: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  /** Current progress toward unlocking */
  currentValue: number;
  /** Threshold to unlock */
  targetValue: number;
  unit: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

// ─── Props Interfaces ───────────────────────────────────────────────

export interface GoalsTabProps {
  goals: Goal[];
  projects: ProjectSummary[];
  /** Create a new goal */
  onCreateGoal?: (goal: Partial<Goal>) => void;
  /** Edit an existing goal */
  onEditGoal?: (goalId: string, updates: Partial<Goal>) => void;
  /** Delete a goal */
  onDeleteGoal?: (goalId: string) => void;
  /** Pause or resume a goal */
  onTogglePause?: (goalId: string) => void;
  /** Accept renewal nudge — create next period's goal */
  onRenewGoal?: (goalId: string) => void;
  /** Dismiss renewal nudge */
  onDismissNudge?: (goalId: string) => void;
  /** Manually check off a manual goal */
  onCheckOffGoal?: (goalId: string) => void;
}

export interface PlansTabProps {
  plans: Plan[];
  projects: ProjectSummary[];
  /** Create a new plan */
  onCreatePlan?: (plan: Partial<Plan>) => void;
  /** Edit an existing plan */
  onEditPlan?: (planId: string, updates: Partial<Plan>) => void;
  /** Delete a plan */
  onDeletePlan?: (planId: string) => void;
  /** Mark plan as completed or skipped */
  onUpdatePlanStatus?: (planId: string, status: PlanStatus) => void;
}

export interface RotationsTabProps {
  rotations: Rotation[];
  projects: ProjectSummary[];
  /** Create a new rotation */
  onCreateRotation?: (rotation: Partial<Rotation>) => void;
  /** Edit rotation settings */
  onEditRotation?: (rotationId: string, updates: Partial<Rotation>) => void;
  /** Delete a rotation */
  onDeleteRotation?: (rotationId: string) => void;
  /** Pause or resume a rotation */
  onTogglePause?: (rotationId: string) => void;
  /** Skip current turn, advance to next project */
  onSkipTurn?: (rotationId: string) => void;
  /** Complete current turn, advance to next project */
  onCompleteTurn?: (rotationId: string) => void;
  /** Reorder projects in rotation */
  onReorderProjects?: (rotationId: string, projectIds: string[]) => void;
}

export interface AchievementsTabProps {
  achievements: Achievement[];
}

export interface ProjectGoalsPanelProps {
  project: ProjectSummary;
  goals: Goal[];
  plans: Plan[];
  rotationMemberships: Rotation[];
  /** Quick-add a goal for this project */
  onCreateGoal?: (goal: Partial<Goal>) => void;
  /** Quick-add a plan for this project */
  onCreatePlan?: (plan: Partial<Plan>) => void;
  /** Edit a goal */
  onEditGoal?: (goalId: string, updates: Partial<Goal>) => void;
  /** Edit a plan */
  onEditPlan?: (planId: string, updates: Partial<Plan>) => void;
  /** Delete a goal */
  onDeleteGoal?: (goalId: string) => void;
  /** Delete a plan */
  onDeletePlan?: (planId: string) => void;
}

export interface GoalsAndPlansProps {
  goals: Goal[];
  plans: Plan[];
  rotations: Rotation[];
  achievements: Achievement[];
  projects: ProjectSummary[];
  /** All goal callbacks */
  onCreateGoal?: (goal: Partial<Goal>) => void;
  onEditGoal?: (goalId: string, updates: Partial<Goal>) => void;
  onDeleteGoal?: (goalId: string) => void;
  onToggleGoalPause?: (goalId: string) => void;
  onRenewGoal?: (goalId: string) => void;
  onDismissNudge?: (goalId: string) => void;
  onCheckOffGoal?: (goalId: string) => void;
  /** All plan callbacks */
  onCreatePlan?: (plan: Partial<Plan>) => void;
  onEditPlan?: (planId: string, updates: Partial<Plan>) => void;
  onDeletePlan?: (planId: string) => void;
  onUpdatePlanStatus?: (planId: string, status: PlanStatus) => void;
  /** All rotation callbacks */
  onCreateRotation?: (rotation: Partial<Rotation>) => void;
  onEditRotation?: (rotationId: string, updates: Partial<Rotation>) => void;
  onDeleteRotation?: (rotationId: string) => void;
  onToggleRotationPause?: (rotationId: string) => void;
  onSkipTurn?: (rotationId: string) => void;
  onCompleteTurn?: (rotationId: string) => void;
  onReorderProjects?: (rotationId: string, projectIds: string[]) => void;
}
