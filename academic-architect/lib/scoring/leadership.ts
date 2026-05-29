// ============================================================================
// ACADEMIC ARCHITECT — Leadership Category Scoring
// Version: 1.0.0
// ============================================================================

import type {
  AcademicPath,
  ImpactScope,
  LeadershipInput,
  LeadershipResult,
  LeadershipScope,
} from '@/lib/types/scoring';

const BASE_SCORE_TABLE: Record<LeadershipScope, Record<AcademicPath, number>> = {
  founded:         { competitive: 100, selective: 100, state_local:  95, trade_career: 95 },
  led_established: { competitive:  85, selective:  95, state_local: 100, trade_career: 85 },
  officer:         { competitive:  60, selective:  80, state_local:  90, trade_career: 80 },
  informal:        { competitive:  40, selective:  60, state_local:  75, trade_career: 75 },
  none_yet:        { competitive:  15, selective:  35, state_local:  55, trade_career: 70 },
};

const SCOPE_MULTIPLIER: Record<ImpactScope, number> = {
  impact_20_plus: 1.10,
  impact_5_19:    1.05,
  impact_1_4:     1.00,
  impact_solo:    0.90,
  impact_unsure:  1.00,
};

const PATH_LABEL: Record<AcademicPath, string> = {
  competitive:  'top-tier',
  selective:    'selective',
  state_local:  'your target',
  trade_career: 'vocational',
};

function generateSignal(
  score: number,
  baseScore: number,
  scopeMultiplier: number,
  hasMeasurableOutcome: boolean,
  path: AcademicPath,
): string {
  const pathLabel = PATH_LABEL[path];
  if (score >= 90) return `Standout leadership profile for ${pathLabel} pathways.`;
  if (score >= 75) return `Strong leadership signal aligned with ${pathLabel} expectations.`;
  if (score >= 60) {
    if (baseScore >= 80 && scopeMultiplier < 1.0)
      return 'Impressive role, but admissions look for leadership at greater scope.';
    if (baseScore < 60 && hasMeasurableOutcome)
      return 'Concrete impact, but consider stepping into a more formal leadership role.';
    return `Adequate leadership profile for ${pathLabel} pathways, with room to grow.`;
  }
  if (score >= 40) return `Leadership profile below the typical bar for ${pathLabel} schools.`;
  return `Limited formal leadership footprint for ${pathLabel} pathways.`;
}

export function calculateLeadershipScore(input: LeadershipInput): LeadershipResult {
  const baseScore = BASE_SCORE_TABLE[input.leadershipScope][input.path];
  const scopeMultiplier = SCOPE_MULTIPLIER[input.impactScope];
  const outcomeBonus = input.hasMeasurableOutcome ? 5 : 0;
  const score = Math.min(100, Math.round((baseScore * scopeMultiplier) + outcomeBonus));
  const signal = generateSignal(score, baseScore, scopeMultiplier, input.hasMeasurableOutcome, input.path);

  return { score, baseScore, scopeMultiplier, outcomeBonus, signal, scoringVersion: '1.0.0' };
}
