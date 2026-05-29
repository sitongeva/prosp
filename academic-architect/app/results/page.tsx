import Link from 'next/link';
import { calculateAcademicsScore } from '@/lib/scoring/academics';
import { calculateActivitiesScore } from '@/lib/scoring/activities';
import { calculateTestingScore } from '@/lib/scoring/testing';
import { calculateLeadershipScore } from '@/lib/scoring/leadership';
import type {
  AcademicPath, ActivityCount, ActivityTier, ActivityYears, CourseOfferings, GpaBucket,
  AcademicsResult, ActivitiesResult, TestingResult, LeadershipResult,
  TestStatus, SatBucket, ActBucket, LeadershipScope, ImpactScope,
  GradeLevel, PathConfidence, ApExamEntry, IbExamEntry,
} from '@/lib/types/scoring';

// ─── helpers ───────────────────────────────────────────────────────────────

function safeJsonParse<T>(str: string | undefined, fallback: T): T {
  try { return str ? JSON.parse(str) : fallback; } catch { return fallback; }
}

// ─── display label maps ─────────────────────────────────────────────────────

const GRADE_DISPLAY: Record<GradeLevel, string> = {
  freshman: '9th grader', sophomore: '10th grader',
  junior: '11th grader', senior: '12th grader',
};
const GPA_DISPLAY: Record<GpaBucket, string> = {
  gpa_3_8_to_4_0: '3.8–4.0', gpa_3_5_to_3_79: '3.5–3.79',
  gpa_3_0_to_3_49: '3.0–3.49', gpa_below_3_0: 'below 3.0',
};
const OFFERINGS_DISPLAY: Record<CourseOfferings, string> = {
  limited: '0–2 AP courses', moderate: '3–7 AP courses', robust: '8–15 AP courses',
  extensive: '16+ AP courses', unknown: 'an unknown number of AP courses',
};
const TIER_DISPLAY: Record<ActivityTier, string> = {
  tier_1: 'nationally or internationally recognized',
  tier_2: 'state or regionally recognized',
  tier_3: 'school leadership level',
  tier_4: 'active participant',
  none_unsure: 'not yet established',
};
const COUNT_DISPLAY: Record<ActivityCount, string> = {
  count_0: 'no committed activities', count_1: '1 committed activity',
  count_2_3: '2–3 committed activities', count_4_5: '4–5 committed activities',
  count_6_plus: '6+ committed activities',
};
const YEARS_DISPLAY: Record<ActivityYears, string> = {
  years_lt_1: 'less than a year', years_1_2: '1–2 years',
  years_3: '3 years', years_4_plus: '4+ years',
};
const SCOPE_DISPLAY: Record<LeadershipScope, string> = {
  founded: 'founded or built something original',
  led_established: 'led an established organization',
  officer: 'served as an officer or coordinator',
  informal: 'led informally without a formal title',
  none_yet: 'no formal leadership role yet',
};
const IMPACT_DISPLAY: Record<ImpactScope, string> = {
  impact_20_plus: '20+ people', impact_5_19: '5–19 people',
  impact_1_4: '1–4 people', impact_solo: 'a solo initiative',
  impact_unsure: 'an undetermined scope',
};
const SAT_DISPLAY: Record<string, string> = {
  sat_1500_1600: '1500–1600', sat_1400_1490: '1400–1490',
  sat_1300_1390: '1300–1390', sat_1200_1290: '1200–1290', sat_below_1200: 'below 1200',
};
const ACT_DISPLAY: Record<string, string> = {
  act_34_36: '34–36', act_31_33: '31–33', act_28_30: '28–30',
  act_24_27: '24–27', act_below_24: 'below 24',
};
const CAREER_DISPLAY: Record<string, string> = {
  medicine_health: 'Medicine & Health Sciences',
  science_research: 'Science & Research',
  engineering_tech: 'Engineering & Technology',
  business_finance: 'Business, Finance & Entrepreneurship',
  law_public_service: 'Law, Policy & Public Service',
  arts_media_humanities: 'Arts, Media & Humanities',
  skilled_trades: 'Skilled Trades',
  service_hospitality: 'Service & Hospitality',
  exploring: 'still exploring',
};
const CONFIDENCE_DISPLAY: Record<string, string> = {
  locked_in: 'locked in', strongly_leaning: 'strongly leaning',
  one_of_several: 'one of several options', just_guessing: 'still figuring it out',
};

// ─── profile snapshot ───────────────────────────────────────────────────────

function buildProfileSummary(
  careerGoal: string | null,
  gradeLevel: GradeLevel,
  path: AcademicPath,
  gpaBucket: GpaBucket,
  intendedMajor: string,
  pathConfidence: PathConfidence | null,
  scores: { label: string; score: number }[],
): { snapshot: string; positioning: string } {
  const grade = GRADE_DISPLAY[gradeLevel];
  const career = careerGoal ? (CAREER_DISPLAY[careerGoal] ?? careerGoal) : null;
  const gpa = GPA_DISPLAY[gpaBucket];
  const pathLabel = { competitive: 'competitive (top-tier)', selective: 'selective', state_local: 'state/local', trade_career: 'vocational/trade' }[path];
  const confidence = pathConfidence ? CONFIDENCE_DISPLAY[pathConfidence] : null;

  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const overall = Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length);

  const majorNote = intendedMajor.trim() ? `, with a focus on ${intendedMajor.trim()}` : '';
  const careerNote = career ? ` in the direction of ${career}${majorNote}` : majorNote ? ` (${intendedMajor.trim()})` : '';
  const confidenceNote = confidence ? ` (${confidence} on this path)` : '';

  let snapshot = `You're a ${grade} targeting ${pathLabel} schools${careerNote}${confidenceNote}, with a ${gpa} GPA. `;

  if (overall >= 80) {
    snapshot += `Your overall profile is strong — ${strongest.label} (${strongest.score}/100) is your sharpest credential, and ${weakest.label} (${weakest.score}/100) is where focused effort would have the most leverage.`;
  } else if (overall >= 60) {
    snapshot += `Your profile has a real anchor in ${strongest.label} (${strongest.score}/100), but ${weakest.label} (${weakest.score}/100) is a visible gap that admissions will notice when comparing you to other applicants.`;
  } else {
    snapshot += `You're in the early stages of building a competitive profile. ${strongest.label} (${strongest.score}/100) is your strongest foothold right now — build out from there.`;
  }

  let positioning = '';
  const gap = strongest.score - weakest.score;
  if (gap >= 40) {
    positioning = `Your profile is uneven: strong ${strongest.label.toLowerCase()}, underdeveloped ${weakest.label.toLowerCase()}. Closing that gap is the highest-ROI use of your time — an uneven profile leaves points on the table that a more balanced one would capture.`;
  } else if (overall >= 80) {
    positioning = `Your profile is well-rounded. The play now isn't to plug gaps — it's to deepen your ${strongest.label.toLowerCase()} story so it becomes genuinely hard to overlook.`;
  } else if (overall >= 60) {
    positioning = `To move from competitive to compelling, focus first on ${weakest.label.toLowerCase()} — that category has the most room to shift your overall standing.`;
  } else {
    positioning = `Every area can grow from here. Start with ${weakest.label.toLowerCase()} — even modest gains there will compound as the rest of your profile develops.`;
  }

  return { snapshot, positioning };
}

// ─── per-category insight functions ─────────────────────────────────────────

function academicsInsight(
  path: AcademicPath,
  gradeLevel: GradeLevel,
  gpaBucket: GpaBucket,
  apCoursesAtSchool: number,
  apExams: ApExamEntry[],
  courseOfferings: CourseOfferings,
  result: AcademicsResult,
): string[] {
  const points: string[] = [];
  const gpa = GPA_DISPLAY[gpaBucket];
  const grade = GRADE_DISPLAY[gradeLevel];
  const pathLabel = { competitive: 'top-tier', selective: 'selective', state_local: 'state', trade_career: 'vocational' }[path];

  // GPA
  if (result.gpaSubScore >= 90) {
    points.push(`Your ${gpa} GPA is in the top range for ${pathLabel} schools — this is the foundation everything else builds on.`);
  } else if (result.gpaSubScore >= 70) {
    const target = path === 'competitive' ? '3.8+' : path === 'selective' ? '3.7+' : '3.5+';
    points.push(`Your ${gpa} GPA is solid, but ${pathLabel} schools typically favor ${target}. As a ${grade}, there's still time to move this — prioritize it.`);
  } else {
    points.push(`Your ${gpa} GPA is below the typical bar for ${pathLabel} schools. As a ${grade}, grade recovery is the most important academic move you can make right now.`);
  }

  // Rigor
  if (apCoursesAtSchool > 0) {
    const offerStr = OFFERINGS_DISPLAY[courseOfferings];
    const utilWord = result.rigorUtilizationPct >= 80 ? 'excellent' : result.rigorUtilizationPct >= 40 ? 'good' : 'limited';
    points.push(`With ${apCoursesAtSchool} AP course${apCoursesAtSchool !== 1 ? 's' : ''} at a school offering ${offerStr}, you're making ${utilWord} use of available rigor — admissions weights this school-adjusted rate, not just the raw count.`);
  } else if (path === 'competitive' || path === 'selective') {
    points.push(`You haven't recorded AP courses yet. As a ${grade} targeting ${pathLabel} schools, adding rigorous coursework is the single highest-leverage academic move available to you.`);
  }

  // Exam scores
  const scoredExams = apExams.filter(e => typeof e.score === 'number') as (ApExamEntry & { score: number })[];
  if (scoredExams.length > 0) {
    const avg = scoredExams.reduce((s, e) => s + e.score, 0) / scoredExams.length;
    const lowCount = scoredExams.filter(e => e.score <= 2).length;
    if (avg >= 4.0) {
      points.push(`Your AP exam average of ${avg.toFixed(1)} across ${scoredExams.length} exam${scoredExams.length > 1 ? 's' : ''} signals genuine mastery — scores of 4 and 5 are what admissions officers look for, not just course-taking.`);
    } else if (lowCount > 0 && lowCount >= scoredExams.length / 2) {
      points.push(`Several of your AP exams scored 1–2, which limits the signal value of your course load. Stronger performance on upcoming exams would substantially improve this part of your profile.`);
    } else {
      points.push(`Your AP exam scores are mixed. Identifying the exams where you can score 4–5 — and prepping specifically for those — would sharpen the academic story your transcript tells.`);
    }
  }

  // Self-study
  if (result.selfStudyBonus > 0) {
    const count = apExams.filter(e => e.selfStudied && (e.score === 4 || e.score === 5)).length;
    points.push(`You self-studied ${count} AP exam${count > 1 ? 's' : ''} and scored 4 or 5 — this is the kind of intellectual initiative that makes a real impression, especially when called out in your application essays.`);
  }

  return points;
}

function activitiesInsight(
  path: AcademicPath,
  highestTier: ActivityTier,
  activityCount: ActivityCount,
  activityTheme: string,
  yearsOnTop: ActivityYears,
  result: ActivitiesResult,
): string[] {
  const points: string[] = [];
  const pathLabel = { competitive: 'top-tier', selective: 'selective', state_local: 'state', trade_career: 'vocational' }[path];

  if (highestTier === 'none_unsure') {
    points.push(`You haven't established activities yet. For ${pathLabel} schools, activities are how admissions builds a picture of who you are beyond the classroom — starting now matters.`);
  } else {
    const tierDesc = TIER_DISPLAY[highestTier];
    const yearsNote = result.yearsMultiplier >= 1.05 ? ` sustained over ${YEARS_DISPLAY[yearsOnTop]}` : '';
    if (result.baseScore >= 90) {
      points.push(`Your highest activity is ${tierDesc}${yearsNote} — this is exactly the level of distinction that anchors strong applications at ${pathLabel} schools.`);
    } else if (result.baseScore >= 60) {
      const nextLevel = highestTier === 'tier_4' ? 'moving into a school leadership role (officer, captain, founder)' : highestTier === 'tier_3' ? 'earning state or regional recognition in your area' : 'reaching national-level recognition';
      points.push(`Your highest activity is at the ${tierDesc} level${yearsNote}. ${nextLevel.charAt(0).toUpperCase() + nextLevel.slice(1)} is the clearest path to a meaningfully higher score.`);
    } else {
      points.push(`Your current activity level is ${tierDesc}. Building toward a more visible or competitive role — even in the next year — will compound across your whole application.`);
    }
  }

  // Count
  if (activityCount === 'count_0') {
    points.push(`You have no committed activities on record. Starting one club, sport, job, or project this semester would immediately change how your profile reads.`);
  } else if (result.countMultiplier < 1.0) {
    points.push(`With ${COUNT_DISPLAY[activityCount]}, your portfolio is narrower than ${pathLabel} schools typically expect. Adding 1–2 more consistent commitments would close this gap.`);
  } else {
    points.push(`Your ${COUNT_DISPLAY[activityCount]} shows real breadth — admissions reads this as someone who is genuinely engaged, not just resume-padding.`);
  }

  // Theme / spike
  if (activityTheme && activityTheme.trim()) {
    points.push(`Your activities connect around "${activityTheme.trim()}" — this thread is a genuine differentiator. Lean into it explicitly in your personal statement and activities list.`);
  } else if (result.spikeBonus === 0 && activityCount !== 'count_0' && activityCount !== 'count_1') {
    points.push(`Your activities don't yet have a visible connecting thread. Finding one — even a shared role or subject area — transforms a list of activities into a coherent story about you.`);
  }

  return points;
}

function testingInsight(
  path: AcademicPath,
  testStatus: TestStatus,
  satBucket: SatBucket | null,
  actBucket: ActBucket | null,
  result: TestingResult,
): string[] {
  const points: string[] = [];
  const pathLabel = { competitive: 'top-tier', selective: 'selective', state_local: 'state', trade_career: 'vocational' }[path];
  const benchmarks: Record<AcademicPath, string> = {
    competitive: '1500+ SAT or 34+ ACT', selective: '1400+ SAT or 31+ ACT',
    state_local: '1200+ SAT or 26+ ACT', trade_career: 'minimal test emphasis',
  };

  if (testStatus === 'not_taken_yet') {
    if (path === 'competitive' || path === 'selective') {
      points.push(`You haven't taken the SAT or ACT yet. For ${pathLabel} schools, the benchmark is ${benchmarks[path]} — putting a test date on the calendar now is one of the most concrete steps you can take.`);
    } else {
      points.push(`You haven't taken the SAT or ACT yet. Even one sitting gives you a data point — most ${pathLabel} schools are test-optional anyway, so you can decide whether to submit once you see your score.`);
    }
    return points;
  }

  if (testStatus === 'test_optional') {
    points.push(`You're applying test-optional. Without a test score, your GPA, course rigor, activities, and essays carry proportionally more weight — make sure those are as polished as possible.`);
    if (path === 'competitive') {
      points.push(`At the most selective schools, a strong score (${benchmarks.competitive}) can still help because it gives admissions something concrete to anchor your candidacy. If you have time, it's worth considering one test attempt.`);
    }
    return points;
  }

  const scoreDesc = testStatus === 'sat' && satBucket
    ? `SAT ${SAT_DISPLAY[satBucket]}`
    : testStatus === 'act' && actBucket
    ? `ACT ${ACT_DISPLAY[actBucket]}`
    : 'your score';

  if (result.score >= 90) {
    points.push(`Your ${scoreDesc} is at the top of the range for ${pathLabel} schools — this is a clear asset that strengthens every other part of your application.`);
  } else if (result.score >= 70) {
    points.push(`Your ${scoreDesc} is competitive but below the typical ${pathLabel} bar of ${benchmarks[path]}. A targeted retake — even 50–100 points on the SAT — could move this meaningfully.`);
  } else {
    points.push(`Your ${scoreDesc} is below the ${pathLabel} benchmark of ${benchmarks[path]}. Retaking the test with focused prep is one of the highest-ROI actions available to you.`);
  }

  return points;
}

function leadershipInsight(
  path: AcademicPath,
  leadershipScope: LeadershipScope,
  impactScope: ImpactScope,
  hasMeasurableOutcome: boolean,
  result: LeadershipResult,
): string[] {
  const points: string[] = [];
  const pathLabel = { competitive: 'top-tier', selective: 'selective', state_local: 'state', trade_career: 'vocational' }[path];

  if (leadershipScope === 'none_yet') {
    points.push(`You don't have a formal leadership role yet. For ${pathLabel} schools, leadership signals initiative and the ability to move others. Even one first step — proposing a club, volunteering to lead a project — would change this score.`);
    return points;
  }

  const scopeDesc = SCOPE_DISPLAY[leadershipScope];

  if (result.baseScore >= 80) {
    points.push(`Having ${scopeDesc} is a genuine credential — this is the kind of role that makes admissions readers pay attention and ask follow-up questions.`);
  } else if (result.baseScore >= 50) {
    const upgrade = leadershipScope === 'informal'
      ? 'pursuing a formal title (officer, president, captain)'
      : leadershipScope === 'officer'
      ? 'launching your own initiative or becoming the top leader of your organization'
      : 'expanding the scale or visibility of your leadership';
    points.push(`You've ${scopeDesc}, which is a real credential. The natural next move — ${upgrade} — would visibly amplify this part of your application.`);
  } else {
    points.push(`You've ${scopeDesc}. Building toward a more formal or visible role would make this section of your application much stronger.`);
  }

  if (impactScope !== 'impact_unsure') {
    const impactDesc = IMPACT_DISPLAY[impactScope];
    if (result.scopeMultiplier >= 1.05) {
      points.push(`Demonstrating impact across ${impactDesc} is exactly what separates title-holders from genuine leaders in the admissions read.`);
    } else if (result.scopeMultiplier < 1.0) {
      points.push(`Your leadership impact has been primarily individual so far. Finding ways to bring others along — even a small team of 2–3 people — would immediately boost the signal your leadership sends.`);
    } else {
      points.push(`Your impact with ${impactDesc} is a credible start. Scale it up — more people, a broader scope, a budget — and the score follows.`);
    }
  }

  if (hasMeasurableOutcome) {
    points.push(`You have a concrete, measurable result from your leadership. This is uncommon and genuinely persuasive — make it front and center in your essays and activities list, with specific numbers.`);
  } else {
    points.push(`You don't have a measurable outcome recorded yet. Before you apply, try to attach a number to your impact: members gained, funds raised, attendance increased. Numbers make leadership claims credible.`);
  }

  return points;
}

// ─── page ───────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ResultsPage({ searchParams: searchParamsPromise }: PageProps) {
  const searchParams = await searchParamsPromise;
  // Academics
  const path = (searchParams.path ?? 'selective') as AcademicPath;
  const gpaBucket = (searchParams.gpaBucket ?? 'gpa_3_5_to_3_79') as GpaBucket;
  const gradeLevel = (searchParams.gradeLevel ?? 'senior') as GradeLevel;
  const apCoursesAtSchool = Number(searchParams.apCoursesAtSchool ?? 0);
  const apExams = safeJsonParse<ApExamEntry[]>(searchParams.apExams, []);
  const ibExams = safeJsonParse<IbExamEntry[]>(searchParams.ibExams, []);
  const courseOfferings = (searchParams.courseOfferings ?? 'unknown') as CourseOfferings;
  const isIbDiplomaCandidate = searchParams.isIbDiplomaCandidate === 'true';
  const hasCteCredential = searchParams.hasCteCredential === 'true';

  // Activities
  const highestTier = (searchParams.highestTier ?? 'none_unsure') as ActivityTier;
  const activityCount = (searchParams.activityCount ?? 'count_2_3') as ActivityCount;
  const yearsOnTop = (searchParams.yearsOnTop ?? 'years_1_2') as ActivityYears;
  const hasSpike = searchParams.hasSpike === 'true';
  const activityTheme = searchParams.activityTheme ?? '';

  // Testing
  const testStatus = (searchParams.testStatus ?? 'not_taken_yet') as TestStatus;
  const satBucket = (searchParams.satBucket ?? null) as SatBucket | null;
  const actBucket = (searchParams.actBucket ?? null) as ActBucket | null;

  // Leadership
  const leadershipScope = (searchParams.leadershipScope ?? 'none_yet') as LeadershipScope;
  const impactScope = (searchParams.impactScope ?? 'impact_unsure') as ImpactScope;
  const hasMeasurableOutcome = searchParams.hasMeasurableOutcome === 'true';

  // Identity
  const careerGoal = searchParams.careerGoal ?? null;
  const intendedMajor = searchParams.intendedMajor ?? '';
  const pathConfidence = (searchParams.pathConfidence ?? null) as PathConfidence | null;

  const academicsResult = calculateAcademicsScore({
    path, gpaBucket, gradeLevel, apCoursesAtSchool, apExams, ibExams,
    courseOfferings, isIbDiplomaCandidate, hasCteCredential,
  });
  const activitiesResult = calculateActivitiesScore({ path, highestTier, activityCount, yearsOnTop, hasSpike });
  const testingResult = calculateTestingScore({ path, testStatus, satBucket, actBucket });
  const leadershipResult = calculateLeadershipScore({ path, leadershipScope, impactScope, hasMeasurableOutcome });

  const scoreSummary = [
    { label: 'Academics',  score: academicsResult.score },
    { label: 'Activities', score: activitiesResult.score },
    { label: 'Testing',    score: testingResult.score },
    { label: 'Leadership', score: leadershipResult.score },
  ];

  const { snapshot, positioning } = buildProfileSummary(
    careerGoal, gradeLevel, path, gpaBucket, intendedMajor, pathConfidence, scoreSummary,
  );

  return (
    <main className="min-h-screen px-6 md:px-12 py-10 md:py-16 max-w-5xl mx-auto">
      <Link href="/" className="font-display font-semibold tracking-tight">
        Academic Architect
      </Link>

      <div className="mt-12">
        <h1 className="font-display text-5xl md:text-6xl">Your Academic Profile</h1>
      </div>

      {/* Score cards 2×2 */}
      <div className="grid grid-cols-2 gap-6 mt-10">
        {scoreSummary.map(({ label, score }, i) => {
          const signal = [
            academicsResult.signal, activitiesResult.signal,
            testingResult.signal, leadershipResult.signal,
          ][i];
          return (
            <div key={label} className="card flex flex-col items-center justify-center text-center py-10">
              <p className="text-xs tracking-widest uppercase text-navy/50 mb-4">{label}</p>
              <div className="text-6xl md:text-7xl font-display font-semibold text-navy">
                {score}<span className="text-2xl text-navy/40">/100</span>
              </div>
              <p className="mt-2 text-sm text-navy/60 max-w-xs">{signal}</p>
            </div>
          );
        })}
      </div>

      {/* Profile snapshot */}
      <div className="card mt-6">
        <p className="text-xs tracking-widest uppercase text-navy/50 mb-3">Profile Snapshot</p>
        <p className="text-navy leading-relaxed mb-4">{snapshot}</p>
        <p className="text-navy/70 leading-relaxed text-sm border-t border-navy/8 pt-4">{positioning}</p>
      </div>

      {/* Architecture Insight */}
      <div className="card bg-navy text-white mt-6">
        <p className="text-xs tracking-widest uppercase text-white/60 mb-3">Architecture Insight</p>
        <h3 className="font-display text-2xl mb-6 text-white">Breaking it down</h3>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-xs tracking-widest uppercase text-white/50 mb-3">Academics</p>
            <ul className="space-y-3 text-sm text-white/80">
              {academicsInsight(path, gradeLevel, gpaBucket, apCoursesAtSchool, apExams, courseOfferings, academicsResult).map((p, i) => (
                <li key={i} className="leading-relaxed">{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-white/50 mb-3">Activities</p>
            <ul className="space-y-3 text-sm text-white/80">
              {activitiesInsight(path, highestTier, activityCount, activityTheme, yearsOnTop, activitiesResult).map((p, i) => (
                <li key={i} className="leading-relaxed">{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-white/50 mb-3">Testing</p>
            <ul className="space-y-3 text-sm text-white/80">
              {testingInsight(path, testStatus, satBucket, actBucket, testingResult).map((p, i) => (
                <li key={i} className="leading-relaxed">{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-white/50 mb-3">Leadership</p>
            <ul className="space-y-3 text-sm text-white/80">
              {leadershipInsight(path, leadershipScope, impactScope, hasMeasurableOutcome, leadershipResult).map((p, i) => (
                <li key={i} className="leading-relaxed">{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* What's next */}
      <div className="mt-12">
        <h2 className="font-display text-2xl mb-4">What&apos;s next</h2>
        <p className="text-navy/60 max-w-2xl">
          This is your Academics, Activities, Testing, and Leadership scores.
          One more category — Research &amp; Internships — is coming next.
        </p>
        <Link href="/audit" className="btn-secondary mt-6">← Re-run the audit</Link>
      </div>
    </main>
  );
}
