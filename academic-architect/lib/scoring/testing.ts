// ============================================================================
// ACADEMIC ARCHITECT — Testing Category Scoring
// Version: 1.0.0
// ============================================================================

import type {
  AcademicPath,
  SatBucket,
  TestingInput,
  TestingResult,
} from '@/lib/types/scoring';

const SAT_SCORE_TABLE: Record<SatBucket, Record<AcademicPath, number>> = {
  sat_1500_1600: { competitive: 100, selective: 100, state_local: 100, trade_career: 95 },
  sat_1400_1490: { competitive:  75, selective:  95, state_local: 100, trade_career: 90 },
  sat_1300_1390: { competitive:  50, selective:  80, state_local:  95, trade_career: 90 },
  sat_1200_1290: { competitive:  25, selective:  55, state_local:  80, trade_career: 85 },
  sat_below_1200: { competitive: 10, selective:  30, state_local:  60, trade_career: 80 },
};

const ACT_TO_SAT: Record<string, SatBucket> = {
  act_34_36:    'sat_1500_1600',
  act_31_33:    'sat_1400_1490',
  act_28_30:    'sat_1300_1390',
  act_24_27:    'sat_1200_1290',
  act_below_24: 'sat_below_1200',
};

const TEST_OPTIONAL_SCORES: Record<AcademicPath, number> = {
  competitive: 65, selective: 80, state_local: 90, trade_career: 95,
};

const NOT_PLANNING_SCORES: Record<AcademicPath, number> = {
  competitive: 30, selective: 55, state_local: 80, trade_career: 95,
};

const PATH_LABEL: Record<AcademicPath, string> = {
  competitive:  'top-tier',
  selective:    'selective',
  state_local:  'your target',
  trade_career: 'vocational',
};

function generateSignal(score: number, path: AcademicPath, testStatus: string): string {
  const pathLabel = PATH_LABEL[path];
  if (testStatus === 'not_taken_yet') return 'Take the SAT or ACT to strengthen this part of your profile.';
  if (testStatus === 'not_planning') {
    if (path === 'trade_career') return 'Your certifications are doing the work standardized tests do elsewhere. Keep stacking them.';
    return `You're not planning to test. Make sure the rest of your profile compensates at ${pathLabel} schools.`;
  }
  if (score >= 90) return `Test scores firmly support ${pathLabel} applications.`;
  if (score >= 75) return `Test scores are in the range ${pathLabel} schools look for.`;
  if (score >= 60) return `Test scores are adequate for ${pathLabel}, but there is room to improve.`;
  if (score >= 40) return `Test scores are below typical ${pathLabel} benchmarks.`;
  return `Current test profile is significantly off-target for ${pathLabel} schools.`;
}

export function calculateTestingScore(input: TestingInput): TestingResult {
  let baseScore: number;

  if (input.testStatus === 'sat' && input.satBucket) {
    baseScore = SAT_SCORE_TABLE[input.satBucket][input.path];
  } else if (input.testStatus === 'act' && input.actBucket) {
    const satBucket = ACT_TO_SAT[input.actBucket];
    baseScore = SAT_SCORE_TABLE[satBucket][input.path];
  } else if (input.testStatus === 'test_optional') {
    const optionalBase = TEST_OPTIONAL_SCORES[input.path];
    if (input.satBucket || input.actBucket) {
      let submitScore: number;
      if (input.satBucket) submitScore = SAT_SCORE_TABLE[input.satBucket][input.path];
      else if (input.actBucket) submitScore = SAT_SCORE_TABLE[ACT_TO_SAT[input.actBucket!]][input.path];
      else submitScore = optionalBase;
      baseScore = Math.round((submitScore + optionalBase) / 2);
    } else {
      baseScore = optionalBase;
    }
  } else if (input.testStatus === 'not_planning') {
    baseScore = NOT_PLANNING_SCORES[input.path];
  } else {
    baseScore = 50;
  }

  const score = Math.min(100, baseScore);
  const signal = generateSignal(score, input.path, input.testStatus);

  return { score, baseScore, signal, scoringVersion: '1.0.0' };
}
