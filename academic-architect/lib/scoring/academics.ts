// ============================================================================
// ACADEMIC ARCHITECT — Academics Category Scoring
// Version: 1.0.0
// ============================================================================
// Pure function. Same inputs always produce same outputs.
// ============================================================================

import type {
  AcademicPath,
  AcademicsInput,
  AcademicsResult,
  CourseOfferings,
  GpaBucket,
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

function getRigorMultiplier(utilizationPct: number, path: AcademicPath): number {
  const tier =
    utilizationPct === 0    ? 'none'
    : utilizationPct <= 25  ? 'low'
    : utilizationPct <= 50  ? 'moderate'
    : utilizationPct <= 75  ? 'high'
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
  path: AcademicPath
): string {
  const pathLabel = {
    competitive: 'top-tier',
    selective: 'selective',
    state_local: 'your target',
    trade_career: 'vocational',
  }[path];

  if (score >= 90) return `Excellent academic foundation for ${pathLabel} pathways.`;
  if (score >= 75) return `Strong academic profile, well-aligned with ${pathLabel} expectations.`;
  if (score >= 60) {
    if (gpaSubScore >= 80 && rigorMultiplier < 0.95) {
      return `Solid grades, but course rigor may not signal readiness for ${pathLabel} programs.`;
    }
    if (gpaSubScore < 70 && rigorMultiplier >= 1.05) {
      return `Ambitious schedule, but grades suggest your rigor may be outpacing your performance.`;
    }
    return `Adequate profile for ${pathLabel} pathways, with room to strengthen.`;
  }
  if (score >= 40) return `Below the typical bar for ${pathLabel} schools — meaningful improvement needed.`;
  return `Current academic profile is significantly off-target for ${pathLabel} pathways.`;
}

export function calculateAcademicsScore(input: AcademicsInput): AcademicsResult {
  const gpaSubScore = GPA_SCORE_TABLE[input.gpaBucket][input.path];

  const effectiveRigorCount =
    input.apIbHonorsCount + (input.dualEnrollmentCount * 0.75);

  const offeringsMidpoint = OFFERINGS_MIDPOINT[input.courseOfferings];
  const utilizationRatio = effectiveRigorCount / offeringsMidpoint;
  const rigorUtilizationPct = Math.min(100, Math.round(utilizationRatio * 100));

  let rigorMultiplier = getRigorMultiplier(rigorUtilizationPct, input.path);

  if (input.isIbDiplomaCandidate &&
      (input.path === 'competitive' || input.path === 'selective')) {
    rigorMultiplier = Math.max(rigorMultiplier, 1.10);
  }

  const cteBonus = getCteBonus(input.path, input.hasCteCredential);

  const rawScore = (gpaSubScore * rigorMultiplier) + cteBonus;
  const score = Math.min(100, Math.round(rawScore));

  const signal = generateSignal(score, gpaSubScore, rigorMultiplier, input.path);

  return {
    score,
    gpaSubScore,
    rigorMultiplier,
    rigorUtilizationPct,
    cteBonus,
    signal,
    scoringVersion: '1.0.0',
  };
}
