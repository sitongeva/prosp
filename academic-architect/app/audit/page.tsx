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
  { key: 'freshman',   label: 'Grade 9' },
  { key: 'sophomore',  label: 'Grade 10' },
  { key: 'junior',     label: 'Grade 11' },
  { key: 'senior',     label: 'Grade 12' },
];

const ACTIVITY_TIERS: { key: ActivityTier; label: string; blurb: string }[] = [
  { key: 'tier_1',      label: 'National / International', blurb: 'USAMO finalist, ISEF, national-ranked athlete, published research' },
  { key: 'tier_2',      label: 'State / Regional Recognition', blurb: 'State orchestra, student body president, all-state athlete' },
  { key: 'tier_3',      label: 'School Leadership', blurb: 'Team captain, club president, founded a school organization' },
  { key: 'tier_4',      label: 'Active Participant', blurb: 'Regular participation in clubs, teams, or volunteer roles' },
  { key: 'none_unsure', label: 'None yet / Not sure', blurb: "We'll help you build toward your first activity" },
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

// Label maps for the review screen
const CAREER_GOAL_LABEL: Record<string, string> = {
  medicine: 'Medicine', law: 'Law', engineering: 'Engineering',
  business: 'Business', technology: 'Technology', arts_humanities: 'Arts & Humanities',
};
const PATH_LABEL: Record<string, string> = {
  competitive: 'Competitive college', selective: 'Selective college',
  state_local: 'State / local college', trade_career: 'Trade / career',
};
const GRADE_LABEL: Record<string, string> = {
  freshman: 'Grade 9', sophomore: 'Grade 10', junior: 'Grade 11', senior: 'Grade 12',
};
const GPA_LABEL: Record<string, string> = {
  gpa_3_8_to_4_0: '3.8 – 4.0', gpa_3_5_to_3_79: '3.5 – 3.79',
  gpa_3_0_to_3_49: '3.0 – 3.49', gpa_below_3_0: 'Below 3.0',
};
const OFFERINGS_LABEL: Record<string, string> = {
  limited: '0–2 (limited)', moderate: '3–7 (moderate)',
  robust: '8–15 (robust)', extensive: '16+ (extensive)', unknown: "I don't know",
};
const TIER_LABEL: Record<string, string> = {
  tier_1: 'National / International', tier_2: 'State / Regional Recognition',
  tier_3: 'School Leadership', tier_4: 'Active Participant', none_unsure: 'None yet',
};
const COUNT_LABEL: Record<string, string> = {
  count_0: '0', count_1: '1', count_2_3: '2–3', count_4_5: '4–5', count_6_plus: '6+',
};
const YEARS_LABEL: Record<string, string> = {
  years_lt_1: 'Less than 1 year', years_1_2: '1–2 years',
  years_3: '3 years', years_4_plus: '4+ years',
};

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
    activityTheme: '',
  });

  const update = <K extends keyof FullProfileInput>(key: K, value: FullProfileInput[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const canAdvance = (() => {
    if (step === 1) return profile.careerGoal !== null;
    if (step === 2) return profile.path !== null;
    if (step === 3) return profile.gpaBucket !== null && profile.gradeLevel !== null;
    if (step === 4) {
      const noActivities = profile.activityCount === 'count_0' || profile.highestTier === 'none_unsure';
      return profile.highestTier !== null && profile.activityCount !== null && (noActivities || profile.yearsOnTop !== null);
    }
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
      <Sidebar
        currentStep={STEP_TO_KEY[step]}
        completedSteps={completedSteps}
        onNavigate={(key) => setStep(Number(Object.entries(STEP_TO_KEY).find(([, v]) => v === key)?.[0]))}
      />

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
  const noActivities = profile.activityCount === 'count_0' || profile.highestTier === 'none_unsure';
  return (
    <>
      <h1 className="font-display text-4xl md:text-5xl mb-4">
        Ready to see your score?
      </h1>
      <p className="text-navy/60 max-w-xl mb-10">
        Review what you've entered below. Go back to make any changes before we calculate your score.
      </p>
      <div className="card max-w-2xl text-sm">
        <p className="text-xs tracking-wider uppercase text-navy/40 font-semibold mb-4">Academic Profile</p>
        <div className="space-y-3 mb-6">
          <Row label="Career goal"       value={profile.careerGoal ? CAREER_GOAL_LABEL[profile.careerGoal] : '—'} />
          <Row label="Academic path"     value={profile.path ? PATH_LABEL[profile.path] : '—'} />
          <Row label="Current grade"     value={profile.gradeLevel ? GRADE_LABEL[profile.gradeLevel] : '—'} />
          <Row label="GPA range"         value={profile.gpaBucket ? GPA_LABEL[profile.gpaBucket] : '—'} />
          <Row label="AP / IB / Honors courses taken" value={`${profile.apIbHonorsCount} course${profile.apIbHonorsCount !== 1 ? 's' : ''}`} />
          <Row label="School's AP/IB offerings" value={OFFERINGS_LABEL[profile.courseOfferings]} />
          {profile.isIbDiplomaCandidate && <Row label="IB Diploma candidate" value="Yes" />}
          {profile.hasCteCredential && <Row label="CTE pathway" value="Yes" />}
        </div>

        <p className="text-xs tracking-wider uppercase text-navy/40 font-semibold mb-4 pt-4 border-t border-navy/5">Activities</p>
        <div className="space-y-3">
          <Row label="Most distinguished activity" value={profile.highestTier ? TIER_LABEL[profile.highestTier] : '—'} />
          <Row label="Number of activities"        value={profile.activityCount ? `${COUNT_LABEL[profile.activityCount]} activities` : '—'} />
          {!noActivities && profile.yearsOnTop && (
            <Row label="Years in top activity" value={YEARS_LABEL[profile.yearsOnTop]} />
          )}
          {profile.activityTheme.trim() && (
            <Row label="Activity theme" value={profile.activityTheme} />
          )}
        </div>
      </div>
    </>
  );
}

function StepActivities({
  profile, update,
}: { profile: FullProfileInput; update: <K extends keyof FullProfileInput>(k: K, v: FullProfileInput[K]) => void }) {
  const noActivities = profile.activityCount === 'count_0' || profile.highestTier === 'none_unsure';

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
          Admissions officers assess activities by level of distinction. Your highest achievement sets the ceiling for this score.
        </p>
      </div>

      <div className="mb-10">
        <h3 className="font-display text-xl mb-2">
          How many activities are you actively involved in?
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
          Count any club, sport, job, volunteer work, or personal project you're regularly involved in.
        </p>
      </div>

      {!noActivities && (
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
      )}

      {!noActivities && (
        <div>
          <h3 className="font-display text-xl mb-2">
            Do your activities share a common theme, role, or interest? <span className="text-navy/40 font-normal text-base">(optional)</span>
          </h3>
          <input
            type="text"
            value={profile.activityTheme}
            onChange={(e) => {
              const theme = e.target.value;
              update('activityTheme', theme);
              update('hasSpike', theme.trim().length > 0);
            }}
            placeholder="e.g., VP of Finance in 3 clubs, or debate + journalism + writing"
            className="w-full border-b-2 border-navy/15 focus:border-navy outline-none py-2 text-base bg-transparent"
          />
          <p className="text-xs text-navy/50 italic mt-2">
            A clear thread across your activities — even a shared role like leadership or finance — makes your application story stronger. Leave blank if not applicable.
          </p>
        </div>
      )}
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
