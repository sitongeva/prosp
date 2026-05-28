'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar, { StepKey } from '@/components/Sidebar';
import ProgressBar from '@/components/ProgressBar';
import type {
  AcademicPath,
  ActivityCount,
  ActivityTier,
  ActivityYears,
  CareerGoal,
  CourseOfferings,
  FullProfileInput,
  GpaBucket,
  GradeLevel,
} from '@/lib/types/scoring';

// ---------------------------------------------------------------------------
// Option data — what shows on each step's selection cards
// ---------------------------------------------------------------------------

const CAREER_GOALS: { key: CareerGoal; label: string; blurb: string }[] = [
  { key: 'medicine',        label: 'Medicine',        blurb: 'Healthcare, surgery, research, and public health paths.' },
  { key: 'law',             label: 'Law',             blurb: 'Jurisprudence, litigation, corporate policy, and advocacy.' },
  { key: 'engineering',     label: 'Engineering',     blurb: 'Civil, aerospace, mechanical, and technical design systems.' },
  { key: 'business',        label: 'Business',        blurb: 'Finance, management, entrepreneurship, and strategy.' },
  { key: 'technology',      label: 'Technology',      blurb: 'Software development, AI research, and digital infrastructure.' },
  { key: 'arts_humanities', label: 'Arts & Humanities', blurb: 'Creative expression, history, sociology, and journalism.' },
];

const PATHS: { key: AcademicPath; label: string; blurb: string }[] = [
  { key: 'competitive',  label: 'Competitive college',  blurb: 'Top-tier universities requiring rigorous course loads and specialized extracurriculars.' },
  { key: 'selective',    label: 'Selective college',    blurb: 'Established institutions with specific prerequisites and balanced profiles.' },
  { key: 'state_local',  label: 'State/local college',  blurb: 'Regional campuses focused on accessible pathways and direct degree completion.' },
  { key: 'trade_career', label: 'Trade/career',         blurb: 'Vocational paths prioritizing certifications, workshops, and technical mastery.' },
];

const GPA_BUCKETS: { key: GpaBucket; label: string }[] = [
  { key: 'gpa_3_8_to_4_0',  label: '3.8 – 4.0' },
  { key: 'gpa_3_5_to_3_79', label: '3.5 – 3.79' },
  { key: 'gpa_3_0_to_3_49', label: '3.0 – 3.49' },
  { key: 'gpa_below_3_0',   label: 'Below 3.0' },
];

const OFFERINGS_OPTIONS: { key: CourseOfferings; label: string }[] = [
  { key: 'limited',   label: '0 – 2 (limited)' },
  { key: 'moderate',  label: '3 – 7 (moderate)' },
  { key: 'robust',    label: '8 – 15 (robust)' },
  { key: 'extensive', label: '16+ (extensive)' },
  { key: 'unknown',   label: "I don't know" },
];

const GRADES: { key: GradeLevel; label: string }[] = [
  { key: 'freshman',   label: 'Freshman (Year 1)' },
  { key: 'sophomore',  label: 'Sophomore (Year 2)' },
  { key: 'junior',     label: 'Junior (Year 3)' },
  { key: 'senior',     label: 'Senior (Year 4)' },
];

const ACTIVITY_TIERS: { key: ActivityTier; label: string; blurb: string }[] = [
  { key: 'tier_1',      label: 'Tier 1 — National/International', blurb: 'USAMO finalist, ISEF, national-ranked athlete, published research' },
  { key: 'tier_2',      label: 'Tier 2 — State/Regional Recognition', blurb: 'State orchestra, student body president, all-state athlete' },
  { key: 'tier_3',      label: 'Tier 3 — School Leadership', blurb: 'Team captain, club president, founded a school organization' },
  { key: 'tier_4',      label: 'Tier 4 — Active Member', blurb: 'Regular participation in clubs, teams, or volunteer roles' },
  { key: 'none_unsure', label: 'None yet / Not sure', blurb: "We'll help you build toward your first tier" },
];

const ACTIVITY_COUNTS: { key: ActivityCount; label: string }[] = [
  { key: 'count_0',      label: '0 activities' },
  { key: 'count_1',      label: '1 activity' },
  { key: 'count_2_3',    label: '2–3 activities' },
  { key: 'count_4_5',    label: '4–5 activities' },
  { key: 'count_6_plus', label: '6+ activities' },
];

const ACTIVITY_YEARS: { key: ActivityYears; label: string }[] = [
  { key: 'years_lt_1',   label: 'Less than 1 year' },
  { key: 'years_1_2',    label: '1–2 years' },
  { key: 'years_3',      label: '3 years' },
  { key: 'years_4_plus', label: '4+ years' },
];

// ---------------------------------------------------------------------------
// The form
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 5;

const STEP_TO_KEY: Record<number, StepKey> = {
  1: 'identity',
  2: 'path',
  3: 'foundation',
  4: 'activities',
  5: 'review',
};

export default function AuditPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [profile, setProfile] = useState<FullProfileInput>({
    careerGoal: null,
    path: null,
    gradeLevel: null,
    intendedMajor: '',
    gpaBucket: null,
    apIbHonorsCount: 0,
    dualEnrollmentCount: 0,
    courseOfferings: 'unknown',
    isIbDiplomaCandidate: false,
    hasCteCredential: false,
    highestTier: null,
    activityCount: null,
    yearsOnTop: null,
    hasSpike: false,
  });

  const update = <K extends keyof FullProfileInput>(key: K, value: FullProfileInput[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const canAdvance = (() => {
    if (step === 1) return profile.careerGoal !== null;
    if (step === 2) return profile.path !== null;
    if (step === 3) return profile.gpaBucket !== null && profile.gradeLevel !== null;
    if (step === 4) return profile.highestTier !== null && profile.activityCount !== null && profile.yearsOnTop !== null;
    return true;
  })();

  const completedSteps: StepKey[] = Object.entries(STEP_TO_KEY)
    .filter(([k]) => Number(k) < step)
    .map(([, v]) => v);

  function handleContinue() {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    // Final step — pack into URL and route to results
    const params = new URLSearchParams();
    Object.entries(profile).forEach(([k, v]) => {
      if (v !== null && v !== '' && v !== false) {
        params.set(k, String(v));
      } else if (v === false) {
        params.set(k, 'false');
      }
    });
    router.push(`/results?${params.toString()}`);
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar currentStep={STEP_TO_KEY[step]} completedSteps={completedSteps} />

      <main className="flex-1 px-6 md:px-16 py-10 md:py-16 max-w-5xl">
        <div className="step-pill mb-6">STEP {step} OF {TOTAL_STEPS}</div>

        {step === 1 && <StepCareerGoal profile={profile} update={update} />}
        {step === 2 && <StepPath profile={profile} update={update} />}
        {step === 3 && <StepFoundation profile={profile} update={update} />}
        {step === 4 && <StepActivities profile={profile} update={update} />}
        {step === 5 && <StepReview profile={profile} />}

        <div className="mt-12 mb-8">
          <ProgressBar current={step} total={TOTAL_STEPS} />
        </div>

        <div className="flex items-center justify-between">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="btn-secondary">
              ← Back
            </button>
          ) : <span />}
          <button
            onClick={handleContinue}
            disabled={!canAdvance}
            className="btn-primary"
          >
            {step === TOTAL_STEPS ? 'See My Score' : 'Continue'} →
          </button>
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step components
// ---------------------------------------------------------------------------

function StepCareerGoal({
  profile, update,
}: { profile: FullProfileInput; update: <K extends keyof FullProfileInput>(k: K, v: FullProfileInput[K]) => void }) {
  return (
    <>
      <h1 className="font-display text-4xl md:text-5xl mb-4">
        What is your ultimate career goal?
      </h1>
      <p className="text-navy/60 max-w-xl mb-10">
        Select the career path that inspires you most. We'll use this to align
        your academic strategy with industry standards.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CAREER_GOALS.map((g) => (
          <div
            key={g.key}
            className="option-card"
            data-selected={profile.careerGoal === g.key}
            onClick={() => update('careerGoal', g.key)}
          >
            <h3 className="font-display text-xl mb-2">{g.label}</h3>
            <p className="text-sm text-navy/60">{g.blurb}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function StepPath({
  profile, update,
}: { profile: FullProfileInput; update: <K extends keyof FullProfileInput>(k: K, v: FullProfileInput[K]) => void }) {
  return (
    <>
      <h1 className="font-display text-4xl md:text-5xl mb-4">
        What's the academic path you'd like to take?
      </h1>
      <p className="text-navy/60 max-w-xl mb-10">
        Choose the institutional standard that best aligns with your career
        aspirations.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PATHS.map((p) => (
          <div
            key={p.key}
            className="option-card"
            data-selected={profile.path === p.key}
            onClick={() => update('path', p.key)}
          >
            <h3 className="font-display text-xl mb-2">{p.label}</h3>
            <p className="text-sm text-navy/60">{p.blurb}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function StepFoundation({
  profile, update,
}: { profile: FullProfileInput; update: <K extends keyof FullProfileInput>(k: K, v: FullProfileInput[K]) => void }) {
  return (
    <>
      <h1 className="font-display text-4xl md:text-5xl mb-4">
        Academic Foundation
      </h1>
      <p className="text-navy/60 max-w-xl mb-10">
        Your academic history provides the bedrock for your profile. Accurate
        data ensures we map your potential against the right institutional
        standards.
      </p>

      <div className="card max-w-2xl">
        <h3 className="font-display text-xl mb-6">Performance Profile</h3>

        <label className="text-xs tracking-wider uppercase text-navy/60 block mb-3">
          Cumulative Unweighted GPA Range
        </label>
        <div className="grid grid-cols-2 gap-3 mb-2">
          {GPA_BUCKETS.map((b) => (
            <button
              key={b.key}
              onClick={() => update('gpaBucket', b.key)}
              className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                profile.gpaBucket === b.key
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-navy border-navy/10 hover:border-navy/30'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-navy/50 italic mb-6">
          Your GPA on a standard 4.0 scale. If your school only reports weighted,
          use the unweighted figure from your transcript.
        </p>

        <label className="text-xs tracking-wider uppercase text-navy/60 block mb-2">
          AP / IB / Honors Courses Completed
        </label>
        <input
          type="number"
          min={0}
          value={profile.apIbHonorsCount}
          onChange={(e) => update('apIbHonorsCount', Math.max(0, Number(e.target.value)))}
          className="w-full border-b-2 border-navy/15 focus:border-navy outline-none py-2 mb-6 text-lg"
        />

        <label className="text-xs tracking-wider uppercase text-navy/60 block mb-2">
          How many AP/IB courses does your school offer?
        </label>
        <select
          value={profile.courseOfferings}
          onChange={(e) => update('courseOfferings', e.target.value as CourseOfferings)}
          className="w-full border-b-2 border-navy/15 focus:border-navy outline-none py-2 mb-6 text-lg bg-transparent"
        >
          {OFFERINGS_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>

        <label className="text-xs tracking-wider uppercase text-navy/60 block mb-2">
          Current Grade Level
        </label>
        <select
          value={profile.gradeLevel ?? ''}
          onChange={(e) => update('gradeLevel', (e.target.value || null) as GradeLevel | null)}
          className="w-full border-b-2 border-navy/15 focus:border-navy outline-none py-2 mb-6 text-lg bg-transparent"
        >
          <option value="">Select...</option>
          {GRADES.map((g) => (
            <option key={g.key} value={g.key}>{g.label}</option>
          ))}
        </select>

        <div className="space-y-3 mt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.isIbDiplomaCandidate}
              onChange={(e) => update('isIbDiplomaCandidate', e.target.checked)}
              className="w-5 h-5 accent-navy"
            />
            <span>I'm an IB Diploma candidate</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.hasCteCredential}
              onChange={(e) => update('hasCteCredential', e.target.checked)}
              className="w-5 h-5 accent-navy"
            />
            <span>I have a CTE credential / pathway</span>
          </label>
        </div>
      </div>
    </>
  );
}

function StepReview({ profile }: { profile: FullProfileInput }) {
  return (
    <>
      <h1 className="font-display text-4xl md:text-5xl mb-4">
        Ready to see your score?
      </h1>
      <p className="text-navy/60 max-w-xl mb-10">
        Here's what we'll analyze. Click below to generate your Academic
        Foundation score.
      </p>
      <div className="card max-w-2xl space-y-3 text-sm">
        <Row label="Career goal"    value={profile.careerGoal ?? '—'} />
        <Row label="Academic path"  value={profile.path ?? '—'} />
        <Row label="Grade level"    value={profile.gradeLevel ?? '—'} />
        <Row label="GPA range"      value={profile.gpaBucket ?? '—'} />
        <Row label="AP/IB/Honors"   value={String(profile.apIbHonorsCount)} />
        <Row label="School offers"  value={profile.courseOfferings} />
        <Row label="IB Diploma"     value={profile.isIbDiplomaCandidate ? 'Yes' : 'No'} />
        <Row label="CTE pathway"    value={profile.hasCteCredential ? 'Yes' : 'No'} />
        <Row label="Highest tier"   value={profile.highestTier ?? '—'} />
        <Row label="Activity count" value={profile.activityCount ?? '—'} />
        <Row label="Years on top"   value={profile.yearsOnTop ?? '—'} />
        <Row label="Spike"          value={profile.hasSpike ? 'Yes' : 'No'} />
      </div>
    </>
  );
}

function StepActivities({
  profile, update,
}: { profile: FullProfileInput; update: <K extends keyof FullProfileInput>(k: K, v: FullProfileInput[K]) => void }) {
  return (
    <>
      <h1 className="font-display text-4xl md:text-5xl mb-4">
        Activities &amp; Extracurriculars
      </h1>
      <p className="text-navy/60 max-w-xl mb-10">
        Your activities outside the classroom signal leadership, commitment, and
        passion. Let's map where you stand.
      </p>

      <div className="mb-10">
        <h3 className="font-display text-xl mb-2">
          What is your most distinguished activity?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          {ACTIVITY_TIERS.map((t) => (
            <div
              key={t.key}
              className="option-card"
              data-selected={profile.highestTier === t.key}
              onClick={() => update('highestTier', t.key)}
            >
              <h3 className="font-display text-lg mb-2">{t.label}</h3>
              <p className="text-sm text-navy/60">{t.blurb}</p>
            </div>
          ))}
        </div>
        <p className="text-xs italic text-navy/50">
          Why we ask: Admissions officers tier activities by distinction. Yours sets your ceiling.
        </p>
      </div>

      <div className="mb-10">
        <h3 className="font-display text-xl mb-2">
          How many substantive activities are you committed to?
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
          {ACTIVITY_COUNTS.map((c) => (
            <button
              key={c.key}
              onClick={() => update('activityCount', c.key)}
              className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                profile.activityCount === c.key
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-navy border-navy/10 hover:border-navy/30'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-navy/50 italic">
          Activities you've spent at least ~50 hours on in the past year.
        </p>
      </div>

      <div className="mb-10">
        <h3 className="font-display text-xl mb-2">
          How long have you been doing your top activity?
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ACTIVITY_YEARS.map((y) => (
            <button
              key={y.key}
              onClick={() => update('yearsOnTop', y.key)}
              className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                profile.yearsOnTop === y.key
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-navy border-navy/10 hover:border-navy/30'
              }`}
            >
              {y.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={profile.hasSpike}
            onChange={(e) => update('hasSpike', e.target.checked)}
            className="w-5 h-5 mt-0.5 accent-navy shrink-0"
          />
          <span className="font-medium">
            Two or more of my activities connect to a single interest or theme.
          </span>
        </label>
        <p className="text-xs text-navy/50 italic mt-2 ml-8">
          e.g., debate + Model UN + political journalism = political/civic spike
        </p>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-navy/5 pb-2">
      <span className="text-navy/50 uppercase tracking-wider text-xs">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
