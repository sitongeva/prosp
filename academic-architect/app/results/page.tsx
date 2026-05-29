import Link from 'next/link';
import { calculateAcademicsScore } from '@/lib/scoring/academics';
import { calculateActivitiesScore } from '@/lib/scoring/activities';
import type {
  AcademicPath, ActivityCount, ActivityTier, ActivityYears, CourseOfferings, GpaBucket,
  AcademicsResult, ActivitiesResult,
} from '@/lib/types/scoring';

function academicsInsight(path: AcademicPath, result: AcademicsResult): string[] {
  const benchmarks: Record<AcademicPath, string> = {
    competitive: 'Top-tier colleges (Ivy League, MIT, Stanford) typically admit students with a 3.8–4.0 GPA and 8+ AP or IB courses.',
    selective: 'Selective colleges generally look for a 3.5+ GPA and a solid mix of AP, IB, or honors coursework.',
    state_local: 'Most state universities are accessible with a 3.0+ GPA and standard coursework.',
    trade_career: 'Vocational programs prioritize hands-on skills and certifications over traditional GPA metrics.',
  };
  const points = [benchmarks[path]];
  if (result.gpaSubScore >= 90) points.push('Your GPA is in the top range — a strong foundation for your target path.');
  else if (result.gpaSubScore >= 70) points.push('Your GPA is solid, but bringing it higher would strengthen your competitiveness.');
  else points.push('Your GPA is below the typical benchmark. Focusing on grade recovery should be a near-term priority.');
  if (result.rigorUtilizationPct >= 80) points.push("You're taking full advantage of the rigorous courses your school offers — exactly what admissions looks for.");
  else if (result.rigorUtilizationPct >= 40) points.push("There's room to add more AP or IB courses. Even 1–2 more would noticeably strengthen your profile.");
  else points.push('Adding AP, IB, or honors courses is one of the highest-leverage moves you can make to improve this score.');
  return points;
}

function activitiesInsight(path: AcademicPath, result: ActivitiesResult): string[] {
  const benchmarks: Record<AcademicPath, string> = {
    competitive: 'Top colleges look for nationally or regionally recognized achievements — not just participation, but real distinction.',
    selective: 'Selective schools value consistent leadership, state-level recognition, and sustained commitment over time.',
    state_local: 'State schools appreciate school leadership, community involvement, and a track record of follow-through.',
    trade_career: 'Vocational programs value relevant internships, apprenticeships, and hands-on project experience.',
  };
  const points = [benchmarks[path]];
  if (result.baseScore >= 90) points.push('Your top activity demonstrates exactly the kind of achievement that stands out in applications.');
  else if (result.baseScore >= 60) points.push('You have a credible foundation. Pushing toward a higher-distinction role — state or national level — would make a meaningful difference.');
  else points.push('Building toward a leadership role or more recognized achievement would significantly strengthen this part of your profile.');
  if (result.countMultiplier < 1.0 && result.baseScore >= 60) points.push('You have strong peak achievements but fewer total activities. Adding 1–2 more committed involvements would round out your profile.');
  if (result.spikeBonus > 0) points.push('Having a clear theme across your activities is a real differentiator — it lets you tell a cohesive story about who you are.');
  else points.push('Look for connections between your activities. A clear shared theme or role — even a subtle one — makes your application narrative significantly stronger.');
  return points;
}

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
          What this means for you
        </h3>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-xs tracking-widest uppercase text-white/50 mb-3">Academics</p>
            <ul className="space-y-3 text-sm text-white/80">
              {academicsInsight(path, academicsResult).map((point, i) => (
                <li key={i} className="leading-relaxed">{point}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs tracking-widest uppercase text-white/50 mb-3">Activities</p>
            <ul className="space-y-3 text-sm text-white/80">
              {activitiesInsight(path, activitiesResult).map((point, i) => (
                <li key={i} className="leading-relaxed">{point}</li>
              ))}
            </ul>
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
