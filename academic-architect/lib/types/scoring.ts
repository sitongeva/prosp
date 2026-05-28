// ============================================================================
// Shared types for the scoring engine
// ============================================================================

export type AcademicPath =
  | 'competitive'
  | 'selective'
  | 'state_local'
  | 'trade_career';

export type CareerGoal =
  | 'medicine'
  | 'law'
  | 'engineering'
  | 'business'
  | 'technology'
  | 'arts_humanities';

export type GpaBucket =
  | 'gpa_3_8_to_4_0'
  | 'gpa_3_5_to_3_79'
  | 'gpa_3_0_to_3_49'
  | 'gpa_below_3_0';

export type CourseOfferings =
  | 'limited'
  | 'moderate'
  | 'robust'
  | 'extensive'
  | 'unknown';

export type GradeLevel = 'freshman' | 'sophomore' | 'junior' | 'senior';

export type ActivityTier =
  | 'tier_1'
  | 'tier_2'
  | 'tier_3'
  | 'tier_4'
  | 'none_unsure';

export type ActivityCount =
  | 'count_0'
  | 'count_1'
  | 'count_2_3'
  | 'count_4_5'
  | 'count_6_plus';

export type ActivityYears =
  | 'years_lt_1'
  | 'years_1_2'
  | 'years_3'
  | 'years_4_plus';

export interface AcademicsInput {
  path: AcademicPath;
  gpaBucket: GpaBucket;
  apIbHonorsCount: number;
  dualEnrollmentCount: number;
  courseOfferings: CourseOfferings;
  isIbDiplomaCandidate: boolean;
  hasCteCredential: boolean;
}

export interface AcademicsResult {
  score: number;
  gpaSubScore: number;
  rigorMultiplier: number;
  rigorUtilizationPct: number;
  cteBonus: number;
  signal: string;
  scoringVersion: string;
}

export interface ActivitiesInput {
  path: AcademicPath;
  highestTier: ActivityTier;
  activityCount: ActivityCount;
  yearsOnTop: ActivityYears;
  hasSpike: boolean;
}

export interface ActivitiesResult {
  score: number;
  baseScore: number;
  countMultiplier: number;
  yearsMultiplier: number;
  spikeBonus: number;
  signal: string;
  scoringVersion: string;
}

// The user's full form submission — we'll extend this as we add categories
export interface FullProfileInput {
  careerGoal: CareerGoal | null;
  path: AcademicPath | null;
  gradeLevel: GradeLevel | null;
  intendedMajor: string;
  gpaBucket: GpaBucket | null;
  apIbHonorsCount: number;
  dualEnrollmentCount: number;
  courseOfferings: CourseOfferings;
  isIbDiplomaCandidate: boolean;
  hasCteCredential: boolean;
  highestTier: ActivityTier | null;
  activityCount: ActivityCount | null;
  yearsOnTop: ActivityYears | null;
  hasSpike: boolean;
}
