// ============================================================================
// ACADEMIC ARCHITECT — Academics Category Scoring
// Version: 2.0.0
// ============================================================================
// Pure function. Same inputs always produce same outputs.
// v2 changes: per-exam scoring, self-study bonus, grade-level awareness.
// ============================================================================

import type {
  AcademicPath,
  AcademicsInput,
  AcademicsResult,
  ApExamEntry,
  CourseOfferings,
  GpaBucket,
  GradeLevel,
  IbExamEntry,
} from '@/lib/types/scoring';

const GPA_SCORE_TABLE: Record<GpaBucket, Record<AcademicPath, number>> = {
  gpa_3_8_to_4_0:  { competitive: 100, selective: 100, state_local: 100, trade_career: 100 },
  gpa_3_5_to_3_79: { competitive:  60, selective:  85, state_local: 100, trade_career: 100 },
  gpa_3_0_to_3_49: { competitive:  30, selective:  60, state_local:  85, trade_career:  95 },
  gpa_below_3_0:   { competitive:  10, selective:  25, state_local:  55, trade_career:  85 },
};

const OFFERINGS_MIDPOINT: Record<CourseOfferings, number> = {
  limited:   1,
  moderate:  5,
  robust:   11,
  extensive: 20,
  unknown:   5,
};

const GRADE_PROGRESS: Record<GradeLevel, number> = {
  freshman:  0.15,
  sophomore: 0.40,
  junior:    0.70,
  senior:    1.00,
};

function apExamPoints(exam: ApExamEntry): number {
  switch (exam.score) {
    case 5:         return 3;
    case 4:         return 2;
    case 3:         return 1;
    case 2:         return 0;
    case 1:         return 0;
    case 'pending': return 0.5;
  }
}

function ibExamPoints(exam: IbExamEntry): number {
  switch (exam.score) {
    case 7:         return 3;
    case 6:         return 2;
    case 5:         return 1.5;
    case 4:         return 1;
    case 3:         return 0;
    case 2:         return 0;
    case 1:         return 0;
    case 'pending': return 0.5;
  }
}

function getRigorMultiplier(utilizationPct: number, path: AcademicPath): number {
  const tier =
    utilizationPct === 0   ? 'none'
    : utilizationPct <= 25 ? 'low'
    : utilizationPct <= 50 ? 'moderate'
    : utilizationPct <= 75 ? 'high'
    : 'maxed';

  const table: Record<string, Record<AcademicPath, number>> = {
    none:     { competitive: 0.65, selective: 0.85, state_local: 1.00, trade_career: 1.00 },
    low:      { competitive: 0.80, selective: 0.95, state_local: 1.00, trade_career: 1.00 },
    moderate: { competitive: 0.95, selective: 1.05, state_local: 1.05, trade_career: 1.00 },
    high:     { competitive: 1.10, selective: 1.10, state_local: 1.05, trade_career: 1.00 },
    maxed:    { competitive: 1.15, selective: 1.10, state_local: 1.05, trade_career: 1.00 },
  };

  return table[tier][path];
}

function getCteBonus(path: AcademicPath, hasCte: boolean): number {
  if (!hasCte) return 0;
  switch (path) {
    case 'trade_career': return 15;
    case 'state_local':  return 5;
    case 'selective':    return 5;
    case 'competitive':  return 0;
  }
}

function generateSignal(
  score: number,
  gpaSubScore: number,
  rigorMultiplier: number,
  effectiveRigorCount: number,
  selfStudyBonus: number,
  apExams: ApExamEntry[],
  path: AcademicPath,
  expectationMultiplier: number,
): string {
  const pathLabel = {
    competitive:  'top-tier',
    selective:    'selective',
    state_local:  'your target',
    trade_career: 'vocational',
  }[path];

  let contextNote = '';
  if (expectationMultiplier < 1.0) {
    contextNote = ' We adjusted what we expect from your profile based on your school and background. The bar you are measured against reflects what is realistic from where you started.';
  }

  if (score >= 90) return `Your academics will hold up at ${pathLabel} schools.${contextNote}`;

  if (score >= 75) {
    if (selfStudyBonus > 0)
      return `Strong academics with the kind of self-directed initiative ${pathLabel} schools notice.${contextNote}`;
    return `You're hitting the academic bar ${pathLabel} schools look for.${contextNote}`;
  }

  if (score >= 60) {
    if (gpaSubScore >= 80 && rigorMultiplier < 0.95)
      return `Your grades are solid, but you'll need a harder schedule to compete at ${pathLabel} schools.${contextNote}`;
    if (gpaSubScore < 70 && rigorMultiplier >= 1.05)
      return `You're taking on a lot, and your grades are showing the strain. Pick fewer hard classes and ace them.${contextNote}`;
    if (effectiveRigorCount > 0 && apExams.some(e => e.score === 1 || e.score === 2))
      return `AP exam performance is limiting the impact of your rigorous schedule.${contextNote}`;
    return `Adequate profile for ${pathLabel} pathways, with room to strengthen.${contextNote}`;
  }

  if (score >= 40) return `You're below the typical bar at ${pathLabel} schools. Real change is needed in your grades or your rigor or both.${contextNote}`;
  return `Your current academic profile won't get you into ${pathLabel} schools. Either change the target or change the trajectory.${contextNote}`;
}

export function calculateAcademicsScore(input: AcademicsInput): AcademicsResult {
  const gpaSubScore = GPA_SCORE_TABLE[input.gpaBucket][input.path];

  // AP exam points
  const apPoints = input.apExams.reduce((sum, e) => sum + apExamPoints(e), 0);

  // Self-study bonus: +0.5 per self-studied exam with score >= 4
  const selfStudyBonus = input.apExams
    .filter(e => e.selfStudied && (e.score === 4 || e.score === 5))
    .length * 0.5;

  // IB exam points
  const ibPoints = input.ibExams.reduce((sum, e) => sum + ibExamPoints(e), 0);

  // Partial credit for AP courses on transcript without recorded exam
  const unrecordedCourses = Math.max(0, input.apCoursesAtSchool - input.apExams.length);
  const partialCredit = unrecordedCourses * 0.5;

  let effectiveRigorCount = apPoints + selfStudyBonus + ibPoints + partialCredit;

  // Grade-aware expectation
  const offeringsMidpoint = OFFERINGS_MIDPOINT[input.courseOfferings];
  const gradeAdjustedExpectation = offeringsMidpoint * GRADE_PROGRESS[input.gradeLevel];

  // Context-based expectation multiplier
  let expectationMultiplier = 1.0;
  if (input.context) {
    if (input.context.regionType === 'rural') expectationMultiplier *= 0.85;
    else if (input.context.regionType === 'small_town') expectationMultiplier *= 0.92;
    if (input.context.schoolType === 'homeschool') expectationMultiplier *= 0.90;
    if (input.context.firstGenStatus === 'first_gen') expectationMultiplier *= 0.93;
  }
  const adjustedExpectation = gradeAdjustedExpectation * expectationMultiplier;

  // Plausibility cap: prevent absurd freshman inputs from breaking the model
  if (effectiveRigorCount > adjustedExpectation * 2) {
    effectiveRigorCount = adjustedExpectation * 2;
  }

  const rigorUtilizationPct = Math.min(
    100,
    Math.round((effectiveRigorCount / Math.max(0.5, adjustedExpectation)) * 100),
  );

  let rigorMultiplier = getRigorMultiplier(rigorUtilizationPct, input.path);

  // IB Diploma override
  if (input.isIbDiplomaCandidate &&
      (input.path === 'competitive' || input.path === 'selective')) {
    rigorMultiplier = Math.max(rigorMultiplier, 1.10);
  }

  const cteBonus = getCteBonus(input.path, input.hasCteCredential);

  const rawScore = (gpaSubScore * rigorMultiplier) + cteBonus;
  const score = Math.min(100, Math.round(rawScore));

  const signal = generateSignal(
    score, gpaSubScore, rigorMultiplier,
    effectiveRigorCount, selfStudyBonus, input.apExams, input.path,
    expectationMultiplier,
  );

  return {
    score,
    gpaSubScore,
    rigorMultiplier,
    rigorUtilizationPct,
    gradeAdjustedUtilizationPct: rigorUtilizationPct,
    effectiveRigorCount,
    selfStudyBonus,
    cteBonus,
    expectationMultiplier,
    signal,
    scoringVersion: '2.0.0',
  };
}
