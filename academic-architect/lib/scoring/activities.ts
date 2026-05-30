// ============================================================================
// ACADEMIC ARCHITECT — Activities Category Scoring
// Version: 1.0.0
// ============================================================================
// Pure function. Same inputs always produce same outputs.
// ============================================================================

import type {
  AcademicPath,
  ActivityCount,
  ActivityTier,
  ActivityYears,
  ActivitiesInput,
  ActivitiesResult,
} from '@/lib/types/scoring';

const BASE_SCORE_TABLE: Record<ActivityTier, Record<AcademicPath, number>> = {
  tier_1:      { competitive: 100, selective: 100, state_local:  95, trade_career:  90 },
  tier_2:      { competitive:  80, selective:  95, state_local: 100, trade_career:  85 },
  tier_3:      { competitive:  55, selective:  75, state_local:  90, trade_career:  80 },
  tier_4:      { competitive:  30, selective:  50, state_local:  70, trade_career:  75 },
  none_unsure: { competitive:  10, selective:  25, state_local:  45, trade_career:  60 },
};

const COUNT_MULTIPLIER: Record<ActivityCount, number> = {
  count_0:      0.50,
  count_1:      0.85,
  count_2_3:    1.00,
  count_4_5:    1.05,
  count_6_plus: 1.00,
};

const YEARS_MULTIPLIER: Record<ActivityYears, number> = {
  years_lt_1:   0.85,
  years_1_2:    0.95,
  years_3:      1.05,
  years_4_plus: 1.10,
};

const PATH_LABEL: Record<AcademicPath, string> = {
  competitive:  'top-tier',
  selective:    'selective',
  state_local:  'your target',
  trade_career: 'vocational',
};

const BALANCE_NOTE = "You're showing up both inside and outside school. That breadth tells admissions you can lead in different environments.";

function generateSignal(
  score: number,
  baseScore: number,
  countMultiplier: number,
  yearsMultiplier: number,
  path: AcademicPath,
  balanceBonus: number,
): string {
  const pathLabel = PATH_LABEL[path];
  const balanceSuffix = balanceBonus > 0 ? ` ${BALANCE_NOTE}` : '';

  if (score >= 90) return `You're doing the kind of things top-tier schools notice.${balanceSuffix}`;
  if (score >= 75) return `Strong activities profile with the depth ${pathLabel} schools look for.${balanceSuffix}`;
  if (score >= 60) {
    if (baseScore >= 80 && countMultiplier < 1.0) {
      return `Impressive peak achievements, but admissions look for depth across multiple commitments.${balanceSuffix}`;
    }
    if (baseScore < 60 && yearsMultiplier >= 1.05) {
      return `Commendable commitment, but consider building toward a higher-distinction role.${balanceSuffix}`;
    }
    return `Adequate activities profile for ${pathLabel} pathways, with room to deepen.${balanceSuffix}`;
  }
  if (score >= 40) return `Your activities are below the bar for ${pathLabel} schools.${balanceSuffix}`;
  return `Limited activities footprint for ${pathLabel} pathways.${balanceSuffix}`;
}

export function calculateActivitiesScore(input: ActivitiesInput): ActivitiesResult {
  const baseScore = BASE_SCORE_TABLE[input.highestTier][input.path];
  const countMultiplier = COUNT_MULTIPLIER[input.activityCount];
  const yearsMultiplier = YEARS_MULTIPLIER[input.yearsOnTop];
  const spikeBonus = input.hasSpike ? 5 : 0;
  const balanceBonus = (input.hasInSchoolActivities && input.hasOutOfSchoolActivities) ? 3 : 0;

  const score = Math.min(100, Math.round((baseScore * countMultiplier * yearsMultiplier) + spikeBonus + balanceBonus));

  const signal = generateSignal(score, baseScore, countMultiplier, yearsMultiplier, input.path, balanceBonus);

  return {
    score,
    baseScore,
    countMultiplier,
    yearsMultiplier,
    spikeBonus,
    balanceBonus,
    signal,
    scoringVersion: '1.0.0',
  };
}
