import Link from 'next/link';
import { calculateAcademicsScore } from '@/lib/scoring/academics';
import { calculateActivitiesScore } from '@/lib/scoring/activities';
import type {
  AcademicPath, ActivityCount, ActivityTier, ActivityYears, CourseOfferings, GpaBucket,
} from '@/lib/types/scoring';

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

export default function ResultsPage({ searchParams }: PageProps) {
  // Academics inputs
  const path = (searchParams.path ?? 'selective') as AcademicPath;
  const gpaBucket = (searchParams.gpaBucket ?? 'gpa_3_5_to_3_79') as GpaBucket;
  const apIbHonorsCount = Number(searchParams.apIbHonorsCount ?? 0);
  const dualEnrollmentCount = Number(searchParams.dualEnrollmentCount ?? 0);
  const courseOfferings = (searchParams.courseOfferings ?? 'unknown') as CourseOfferings;
  const isIbDiplomaCandidate = searchParams.isIbDiplomaCandidate === 'true';
  const hasCteCredential = searchParams.hasCteCredential === 'true';

  // Activities inputs
  const highestTier = (searchParams.highestTier ?? 'none_unsure') as ActivityTier;
  const activityCount = (searchParams.activityCount ?? 'count_2_3') as ActivityCount;
  const yearsOnTop = (searchParams.yearsOnTop ?? 'years_1_2') as ActivityYears;
  const hasSpike = searchParams.hasSpike === 'true';

  const academicsResult = calculateAcademicsScore({
    path,
    gpaBucket,
    apIbHonorsCount,
    dualEnrollmentCount,
    courseOfferings,
    isIbDiplomaCandidate,
    hasCteCredential,
  });

  const activitiesResult = calculateActivitiesScore({
    path,
    highestTier,
    activityCount,
    yearsOnTop,
    hasSpike,
  });

  return (
    <main className="min-h-screen px-6 md:px-12 py-10 md:py-16 max-w-5xl mx-auto">
      <Link href="/" className="font-display font-semibold tracking-tight">
        Academic Architect
      </Link>

      <div className="mt-12">
        <p className="text-xs tracking-widest uppercase text-navy/50 mb-3">
          Step 5 of 5 · Analysis Complete
        </p>
        <h1 className="font-display text-5xl md:text-6xl">Your Academic Profile</h1>
      </div>

      {/* Two score cards */}
      <div className="grid md:grid-cols-2 gap-6 mt-10">
        <div className="card flex flex-col items-center justify-center text-center py-12">
          <p className="text-xs tracking-widest uppercase text-navy/50 mb-4">Academics</p>
          <div className="text-7xl font-display font-semibold text-navy">
            {academicsResult.score}
            <span className="text-2xl text-navy/40">/100</span>
          </div>
          <p className="mt-2 text-sm text-navy/60 max-w-xs">
            {academicsResult.signal}
          </p>
        </div>

        <div className="card flex flex-col items-center justify-center text-center py-12">
          <p className="text-xs tracking-widest uppercase text-navy/50 mb-4">Activities</p>
          <div className="text-7xl font-display font-semibold text-navy">
            {activitiesResult.score}
            <span className="text-2xl text-navy/40">/100</span>
          </div>
          <p className="mt-2 text-sm text-navy/60 max-w-xs">
            {activitiesResult.signal}
          </p>
        </div>
      </div>

      {/* Architecture Insight — both categories */}
      <div className="card bg-navy text-white mt-6">
        <p className="text-xs tracking-widest uppercase text-white/60 mb-3">
          Architecture Insight
        </p>
        <h3 className="font-display text-2xl mb-6 text-white">
          How these scores were calculated
        </h3>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-xs tracking-widest uppercase text-white/50 mb-3">Academics</p>
            <ul className="space-y-2 text-sm text-white/80">
              <li>GPA sub-score: <strong className="text-white">{academicsResult.gpaSubScore}/100</strong></li>
              <li>Rigor multiplier: <strong className="text-white">{academicsResult.rigorMultiplier}×</strong></li>
              <li>Rigor utilization: <strong className="text-white">{academicsResult.rigorUtilizationPct}%</strong></li>
              {academicsResult.cteBonus > 0 && (
                <li>CTE bonus: <strong className="text-white">+{academicsResult.cteBonus}</strong></li>
              )}
            </ul>
            <p className="mt-4 text-xs text-white/40">v{academicsResult.scoringVersion}</p>
          </div>

          <div>
            <p className="text-xs tracking-widest uppercase text-white/50 mb-3">Activities</p>
            <ul className="space-y-2 text-sm text-white/80">
              <li>Base score: <strong className="text-white">{activitiesResult.baseScore}/100</strong></li>
              <li>Count multiplier: <strong className="text-white">{activitiesResult.countMultiplier}×</strong></li>
              <li>Years multiplier: <strong className="text-white">{activitiesResult.yearsMultiplier}×</strong></li>
              {activitiesResult.spikeBonus > 0 && (
                <li>Spike bonus: <strong className="text-white">+{activitiesResult.spikeBonus}</strong></li>
              )}
            </ul>
            <p className="mt-4 text-xs text-white/40">v{activitiesResult.scoringVersion}</p>
          </div>
        </div>
      </div>

      {/* What's next */}
      <div className="mt-12">
        <h2 className="font-display text-2xl mb-4">What's next</h2>
        <p className="text-navy/60 max-w-2xl">
          This is your Academics and Activities score. Three more categories —
          Standardized Testing, Leadership, and Research — are coming next.
        </p>
        <Link href="/audit" className="btn-secondary mt-6">
          ← Re-run the audit
        </Link>
      </div>
    </main>
  );
}
