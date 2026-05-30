// ============================================================================
// Shared types for the scoring engine
// ============================================================================

export type AcademicPath =
  | 'competitive'
  | 'selective'
  | 'state_local'
  | 'trade_career';

export type CareerCluster =
  | 'medicine_health'
  | 'science_research'
  | 'engineering_tech'
  | 'business_finance'
  | 'law_public_service'
  | 'arts_media_humanities'
  | 'skilled_trades'
  | 'service_hospitality'
  | 'exploring';

export type PathConfidence =
  | 'locked_in'
  | 'strongly_leaning'
  | 'one_of_several'
  | 'just_guessing';

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

export type ApExamScore = 5 | 4 | 3 | 2 | 1 | 'pending';
export type IbSubjectScore = 7 | 6 | 5 | 4 | 3 | 2 | 1 | 'pending';

export interface ApExamEntry {
  id: string;
  subject: string;
  score: ApExamScore;
  selfStudied: boolean;
}

export interface IbExamEntry {
  id: string;
  subject: string;
  score: IbSubjectScore;
}

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

export type TestStatus = 'sat' | 'act' | 'test_optional' | 'not_taken_yet' | 'not_planning';

export type SatBucket =
  | 'sat_1500_1600'
  | 'sat_1400_1490'
  | 'sat_1300_1390'
  | 'sat_1200_1290'
  | 'sat_below_1200';

export type ActBucket =
  | 'act_34_36'
  | 'act_31_33'
  | 'act_28_30'
  | 'act_24_27'
  | 'act_below_24';

export type LeadershipScope =
  | 'founded'
  | 'led_established'
  | 'officer'
  | 'informal'
  | 'none_yet';

export type ImpactScope =
  | 'impact_20_plus'
  | 'impact_5_19'
  | 'impact_1_4'
  | 'impact_solo'
  | 'impact_unsure';

export type SchoolType = 'public' | 'private' | 'charter' | 'magnet' | 'homeschool' | 'online' | 'boarding' | 'other';
export type RegionType = 'urban' | 'suburban' | 'rural' | 'small_town';
export type FirstGenStatus = 'first_gen' | 'not_first_gen' | 'prefer_not_say';
export type IncomeBand = 'income_lt_50k' | 'income_50_100k' | 'income_100_200k' | 'income_gt_200k' | 'prefer_not_say';

export interface AcademicsContext {
  schoolType: SchoolType;
  regionType: RegionType;
  firstGenStatus: FirstGenStatus;
}

export interface AcademicsInput {
  path: AcademicPath;
  gpaBucket: GpaBucket;
  gradeLevel: GradeLevel;
  apCoursesAtSchool: number;
  apExams: ApExamEntry[];
  ibExams: IbExamEntry[];
  courseOfferings: CourseOfferings;
  isIbDiplomaCandidate: boolean;
  hasCteCredential: boolean;
  context?: AcademicsContext;
}

export interface AcademicsResult {
  score: number;
  gpaSubScore: number;
  rigorMultiplier: number;
  rigorUtilizationPct: number;
  gradeAdjustedUtilizationPct: number;
  effectiveRigorCount: number;
  selfStudyBonus: number;
  cteBonus: number;
  expectationMultiplier: number;
  signal: string;
  scoringVersion: string;
}

export interface ActivitiesInput {
  path: AcademicPath;
  highestTier: ActivityTier;
  activityCount: ActivityCount;
  yearsOnTop: ActivityYears;
  hasSpike: boolean;
  hasInSchoolActivities: boolean;
  hasOutOfSchoolActivities: boolean;
}

export interface ActivitiesResult {
  score: number;
  baseScore: number;
  countMultiplier: number;
  yearsMultiplier: number;
  spikeBonus: number;
  balanceBonus: number;
  signal: string;
  scoringVersion: string;
}

export interface TestingInput {
  path: AcademicPath;
  testStatus: TestStatus;
  satBucket: SatBucket | null;
  actBucket: ActBucket | null;
}

export interface TestingResult {
  score: number;
  baseScore: number;
  signal: string;
  scoringVersion: string;
}

export interface LeadershipInput {
  path: AcademicPath;
  leadershipScope: LeadershipScope;
  impactScope: ImpactScope;
  hasMeasurableOutcome: boolean;
}

export interface LeadershipResult {
  score: number;
  baseScore: number;
  scopeMultiplier: number;
  outcomeBonus: number;
  signal: string;
  scoringVersion: string;
}

export interface FullProfileInput {
  careerGoal: CareerCluster | null;
  pathConfidence: PathConfidence | null;
  path: AcademicPath | null;
  gradeLevel: GradeLevel | null;
  intendedMajor: string;
  gpaBucket: GpaBucket | null;
  apCoursesAtSchool: number;
  apExams: ApExamEntry[];
  ibExams: IbExamEntry[];
  courseOfferings: CourseOfferings;
  isIbDiplomaCandidate: boolean;
  hasCteCredential: boolean;
  highestTier: ActivityTier | null;
  activityCount: ActivityCount | null;
  yearsOnTop: ActivityYears | null;
  hasSpike: boolean;
  activityTheme: string;
  selectedApCourses: string[];
  testStatus: TestStatus | null;
  satBucket: SatBucket | null;
  actBucket: ActBucket | null;
  leadershipScope: LeadershipScope | null;
  impactScope: ImpactScope | null;
  hasMeasurableOutcome: boolean;
  schoolType: SchoolType | null;
  regionType: RegionType | null;
  stateOrCountry: string;
  firstGenStatus: FirstGenStatus | null;
  incomeBand: IncomeBand;
  needsFinancialAid: boolean;
  hasInSchoolActivities: boolean;
  hasOutOfSchoolActivities: boolean;
}
