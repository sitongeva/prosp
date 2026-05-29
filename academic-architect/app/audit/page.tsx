'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar, { StepKey } from '@/components/Sidebar';
import ProgressBar from '@/components/ProgressBar';
import type {
  AcademicPath,
  ActBucket,
  ActivityCount,
  ActivityTier,
  ActivityYears,
  ApExamEntry,
  ApExamScore,
  CareerCluster,
  CourseOfferings,
  FullProfileInput,
  GpaBucket,
  GradeLevel,
  IbExamEntry,
  IbSubjectScore,
  ImpactScope,
  LeadershipScope,
  PathConfidence,
  SatBucket,
  TestStatus,
} from '@/lib/types/scoring';

// ---------------------------------------------------------------------------
// Option data — what shows on each step's selection cards
// ---------------------------------------------------------------------------

const CAREER_CLUSTERS: { key: CareerCluster; label: string; blurb: string }[] = [
  { key: 'medicine_health',      label: 'Medicine & Health Sciences',         blurb: 'Physician, nurse, dentist, pharmacist, vet, PA, public health' },
  { key: 'science_research',     label: 'Science & Research',                 blurb: 'Biology, chemistry, physics, environmental science, academic research' },
  { key: 'engineering_tech',     label: 'Engineering & Technology',           blurb: 'Software, electrical, mechanical, civil, AI, cybersecurity, data' },
  { key: 'business_finance',     label: 'Business, Finance & Entrepreneurship', blurb: 'Management, finance, marketing, startups, consulting' },
  { key: 'law_public_service',   label: 'Law, Policy & Public Service',       blurb: 'Law, government, nonprofit, education, social work' },
  { key: 'arts_media_humanities',label: 'Arts, Media & Humanities',           blurb: 'Writing, journalism, design, film, music, performing arts' },
  { key: 'skilled_trades',       label: 'Skilled Trades & Technical Careers', blurb: 'Electrician, plumber, HVAC, welding, automotive, construction, manufacturing' },
  { key: 'service_hospitality',  label: 'Service & Hospitality Industries',   blurb: 'Real estate, cosmetology, culinary, hospitality, personal training, retail' },
  { key: 'exploring',            label: 'Still exploring',                    blurb: "I'm not sure yet — help me figure it out" },
];

const PATH_CONFIDENCE_OPTIONS: { key: PathConfidence; label: string; sub: string }[] = [
  { key: 'locked_in',        label: 'Locked in',         sub: "This is what I'm pursuing" },
  { key: 'strongly_leaning', label: 'Strongly leaning',  sub: 'Probably this, still confirming' },
  { key: 'one_of_several',   label: 'One of several',    sub: "It's on my list of options" },
  { key: 'just_guessing',    label: 'Just guessing',     sub: 'Honestly, I have no idea yet' },
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
  medicine_health:       'Medicine & Health Sciences',
  science_research:      'Science & Research',
  engineering_tech:      'Engineering & Technology',
  business_finance:      'Business, Finance & Entrepreneurship',
  law_public_service:    'Law, Policy & Public Service',
  arts_media_humanities: 'Arts, Media & Humanities',
  skilled_trades:        'Skilled Trades & Technical Careers',
  service_hospitality:   'Service & Hospitality Industries',
  exploring:             'Still exploring',
};
const PATH_CONFIDENCE_LABEL: Record<string, string> = {
  locked_in:        'Locked in',
  strongly_leaning: 'Strongly leaning',
  one_of_several:   'One of several options',
  just_guessing:    'Just guessing',
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

// AP course master list grouped by category
const AP_COURSE_GROUPS: { category: string; courses: string[] }[] = [
  { category: 'English', courses: [
    'English Language & Composition',
    'English Literature & Composition',
  ]},
  { category: 'History & Social Studies', courses: [
    'African American Studies',
    'Comparative Government & Politics',
    'European History',
    'Human Geography',
    'Macroeconomics',
    'Microeconomics',
    'Psychology',
    'US Government & Politics',
    'US History',
    'World History: Modern',
  ]},
  { category: 'Math & Computer Science', courses: [
    'Calculus AB',
    'Calculus BC',
    'Computer Science A',
    'Computer Science Principles',
    'Precalculus',
    'Statistics',
  ]},
  { category: 'Sciences', courses: [
    'Biology',
    'Chemistry',
    'Environmental Science',
    'Physics 1',
    'Physics 2',
    'Physics C: Electricity & Magnetism',
    'Physics C: Mechanics',
  ]},
  { category: 'Arts', courses: [
    'Art History',
    'Music Theory',
    'Research',
    'Seminar',
    'Studio Art: 2-D Design',
    'Studio Art: 3-D Design',
    'Studio Art: Drawing',
  ]},
  { category: 'World Languages', courses: [
    'Chinese Language & Culture',
    'French Language & Culture',
    'German Language & Culture',
    'Italian Language & Culture',
    'Japanese Language & Culture',
    'Latin',
    'Spanish Language & Culture',
    'Spanish Literature & Culture',
  ]},
];

// Testing option data
const TEST_STATUSES: { key: TestStatus; label: string; blurb: string }[] = [
  { key: 'sat',           label: 'Submitted SAT score',    blurb: 'I have an SAT score I plan to submit' },
  { key: 'act',           label: 'Submitted ACT score',    blurb: 'I have an ACT score I plan to submit' },
  { key: 'test_optional', label: 'Test-optional',          blurb: "I'm applying test-optional / not submitting scores" },
  { key: 'not_taken_yet', label: "Haven't taken yet",      blurb: "I plan to take a test but haven't yet" },
];
const SAT_BUCKETS: { key: SatBucket; label: string }[] = [
  { key: 'sat_1500_1600', label: '1500 – 1600' },
  { key: 'sat_1400_1490', label: '1400 – 1490' },
  { key: 'sat_1300_1390', label: '1300 – 1390' },
  { key: 'sat_1200_1290', label: '1200 – 1290' },
  { key: 'sat_below_1200', label: 'Below 1200' },
];
const ACT_BUCKETS: { key: ActBucket; label: string }[] = [
  { key: 'act_34_36',    label: '34 – 36' },
  { key: 'act_31_33',    label: '31 – 33' },
  { key: 'act_28_30',    label: '28 – 30' },
  { key: 'act_24_27',    label: '24 – 27' },
  { key: 'act_below_24', label: 'Below 24' },
];

// Leadership option data
const LEADERSHIP_SCOPES: { key: LeadershipScope; label: string; blurb: string }[] = [
  { key: 'founded',         label: 'Founded / built something',          blurb: 'Started a club, launched a nonprofit, built a product or publication' },
  { key: 'led_established', label: 'Led an established organization',    blurb: 'Elected president, captain, editor-in-chief' },
  { key: 'officer',         label: 'Officer / coordinator',              blurb: 'VP, treasurer, team lead, committee chair' },
  { key: 'informal',        label: 'Informal leader',                    blurb: 'Mentor, peer tutor, took initiative without a title' },
  { key: 'none_yet',        label: 'No formal leadership role yet',      blurb: "We'll help you identify where to start" },
];
const IMPACT_SCOPES: { key: ImpactScope; label: string }[] = [
  { key: 'impact_20_plus', label: 'Led 20+ people or significant budget' },
  { key: 'impact_5_19',    label: 'Led 5–19 people' },
  { key: 'impact_1_4',     label: 'Led 1–4 people / small team' },
  { key: 'impact_solo',    label: 'Solo / individual contributor' },
  { key: 'impact_unsure',  label: 'Not sure / N/A' },
];

// Testing + Leadership label maps for review screen
const TEST_STATUS_LABEL: Record<string, string> = {
  sat: 'SAT', act: 'ACT', test_optional: 'Test-optional', not_taken_yet: "Haven't taken yet",
};
const SAT_LABEL: Record<string, string> = {
  sat_1500_1600: '1500–1600', sat_1400_1490: '1400–1490', sat_1300_1390: '1300–1390',
  sat_1200_1290: '1200–1290', sat_below_1200: 'Below 1200',
};
const ACT_LABEL: Record<string, string> = {
  act_34_36: '34–36', act_31_33: '31–33', act_28_30: '28–30',
  act_24_27: '24–27', act_below_24: 'Below 24',
};
const LEADERSHIP_LABEL: Record<string, string> = {
  founded: 'Founded / built something', led_established: 'Led an established organization',
  officer: 'Officer / coordinator', informal: 'Informal leader', none_yet: 'No formal role yet',
};
const IMPACT_LABEL: Record<string, string> = {
  impact_20_plus: 'Led 20+ people', impact_5_19: 'Led 5–19 people',
  impact_1_4: 'Led 1–4 people', impact_solo: 'Solo / individual', impact_unsure: 'Not sure / N/A',
};

// ---------------------------------------------------------------------------
// The form
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 7;

const STEP_TO_KEY: Record<number, StepKey> = {
  1: 'identity',
  2: 'path',
  3: 'foundation',
  4: 'activities',
  5: 'testing',
  6: 'leadership',
  7: 'review',
};

export default function AuditPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [profile, setProfile] = useState<FullProfileInput>({
    careerGoal: null,
    pathConfidence: null,
    path: null,
    gradeLevel: null,
    intendedMajor: '',
    gpaBucket: null,
    apCoursesAtSchool: 0,
    apExams: [],
    ibExams: [],
    courseOfferings: 'unknown',
    isIbDiplomaCandidate: false,
    hasCteCredential: false,
    highestTier: null,
    activityCount: null,
    yearsOnTop: null,
    hasSpike: false,
    activityTheme: '',
    selectedApCourses: [],
    testStatus: null,
    satBucket: null,
    actBucket: null,
    leadershipScope: null,
    impactScope: null,
    hasMeasurableOutcome: false,
  });

  const update = <K extends keyof FullProfileInput>(key: K, value: FullProfileInput[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const updateBatch = (updates: Partial<FullProfileInput>) =>
    setProfile((p) => ({ ...p, ...updates }));

  const canAdvance = (() => {
    if (step === 1) return profile.careerGoal !== null && profile.pathConfidence !== null;
    if (step === 2) return profile.path !== null;
    if (step === 3) return profile.gpaBucket !== null && profile.gradeLevel !== null;
    if (step === 4) {
      const noActivities = profile.activityCount === 'count_0' || profile.highestTier === 'none_unsure';
      return profile.highestTier !== null && profile.activityCount !== null && (noActivities || profile.yearsOnTop !== null);
    }
    if (step === 5) {
      if (!profile.testStatus) return false;
      if (profile.testStatus === 'sat') return profile.satBucket !== null;
      if (profile.testStatus === 'act') return profile.actBucket !== null;
      return true;
    }
    if (step === 6) return profile.leadershipScope !== null && profile.impactScope !== null;
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
      if (k === 'apExams' || k === 'ibExams' || k === 'selectedApCourses') {
        params.set(k, JSON.stringify(v));
      } else if (v !== null && v !== '' && v !== false) {
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
        {step === 3 && <StepFoundation profile={profile} update={update} updateBatch={updateBatch} />}
        {step === 4 && <StepActivities profile={profile} update={update} />}
        {step === 5 && <StepTesting profile={profile} update={update} />}
        {step === 6 && <StepLeadership profile={profile} update={update} />}
        {step === 7 && <StepReview profile={profile} />}

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
        What is your career direction?
      </h1>
      <p className="text-navy/60 max-w-xl mb-8">
        Select the cluster that feels closest to where you're heading. We'll use
        this to calibrate your profile against the right benchmarks.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {CAREER_CLUSTERS.map((g) => (
          <div
            key={g.key}
            className="option-card"
            data-selected={profile.careerGoal === g.key}
            onClick={() => update('careerGoal', g.key as CareerCluster)}
          >
            <h3 className="font-display text-lg mb-2">{g.label}</h3>
            <p className="text-sm text-navy/60">{g.blurb}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-navy/10 pt-10 mb-10">
        <h3 className="font-display text-xl mb-2">
          How committed are you to this direction?
        </h3>
        <p className="text-navy/60 text-sm mb-6">
          This helps us calibrate how specifically to benchmark your profile.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {PATH_CONFIDENCE_OPTIONS.map((c) => (
            <button
              key={c.key}
              onClick={() => update('pathConfidence', c.key as PathConfidence)}
              className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all text-left ${
                profile.pathConfidence === c.key
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-navy border-navy/10 hover:border-navy/30'
              }`}
            >
              <div className="font-semibold">{c.label}</div>
              <div className={`text-xs mt-0.5 ${profile.pathConfidence === c.key ? 'text-white/70' : 'text-navy/50'}`}>{c.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs tracking-wider uppercase text-navy/60 block mb-2">
          Do you have a specific major in mind? <span className="normal-case">(Optional)</span>
        </label>
        <input
          type="text"
          value={profile.intendedMajor}
          onChange={(e) => update('intendedMajor', e.target.value)}
          placeholder="e.g., Biomedical Engineering, Game Design, Welding"
          className="w-full border-b-2 border-navy/15 focus:border-navy outline-none py-2 text-base bg-transparent"
        />
        <p className="text-xs text-navy/50 italic mt-2">
          We won't score against this yet, but it helps us understand where you're heading.
        </p>
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
  profile, update, updateBatch,
}: {
  profile: FullProfileInput;
  update: <K extends keyof FullProfileInput>(k: K, v: FullProfileInput[K]) => void;
  updateBatch: (u: Partial<FullProfileInput>) => void;
}) {
  const toggleCourse = (course: string) => {
    const selected = profile.selectedApCourses.includes(course);
    if (selected) {
      updateBatch({
        selectedApCourses: profile.selectedApCourses.filter(c => c !== course),
        apExams: profile.apExams.filter(e => e.subject !== course),
        apCoursesAtSchool: Math.max(0, profile.apCoursesAtSchool - 1),
      });
    } else {
      updateBatch({
        selectedApCourses: [...profile.selectedApCourses, course],
        apCoursesAtSchool: profile.apCoursesAtSchool + 1,
      });
    }
  };

  const setExamScore = (course: string, score: ApExamScore | 'no_exam') => {
    if (score === 'no_exam') {
      update('apExams', profile.apExams.filter(e => e.subject !== course));
    } else {
      const existing = profile.apExams.find(e => e.subject === course);
      if (existing) {
        // clicking the active score again clears it (toggle off = no exam)
        if (existing.score === score) {
          update('apExams', profile.apExams.filter(e => e.subject !== course));
        } else {
          update('apExams', profile.apExams.map(e => e.subject === course ? { ...e, score } : e));
        }
      } else {
        update('apExams', [...profile.apExams, {
          id: `ap-${Date.now()}-${Math.random()}`, subject: course, score, selfStudied: false,
        }]);
      }
    }
  };

  const toggleSelfStudied = (course: string) => {
    update('apExams', profile.apExams.map(e =>
      e.subject === course ? { ...e, selfStudied: !e.selfStudied } : e,
    ));
  };

  return (
    <>
      <h1 className="font-display text-4xl md:text-5xl mb-4">
        Academic Foundation
      </h1>
      <p className="text-navy/60 max-w-xl mb-10">
        Your academic history provides the bedrock for your profile. Accurate
        data ensures we map your potential against the right institutional standards.
      </p>

      <div className="card max-w-3xl">
        <h3 className="font-display text-xl mb-6">Performance Profile</h3>

        {/* GPA */}
        <label className="text-xs tracking-wider uppercase text-navy/60 block mb-3">
          Cumulative Unweighted GPA Range
        </label>
        <div className="grid grid-cols-2 gap-3 mb-2">
          {GPA_BUCKETS.map((b) => (
            <button key={b.key} onClick={() => update('gpaBucket', b.key)}
              className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                profile.gpaBucket === b.key ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-navy/10 hover:border-navy/30'
              }`}>
              {b.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-navy/50 italic mb-8">
          Unweighted 4.0 scale. Use your transcript figure if your school reports weighted only.
        </p>

        {/* AP course picker */}
        <div className="border-t border-navy/10 pt-6 mb-6">
          <div className="flex items-baseline justify-between mb-4">
            <h4 className="font-display text-lg">AP Courses &amp; Exam Scores</h4>
            {profile.selectedApCourses.length > 0 && (
              <span className="text-xs text-navy/50">{profile.selectedApCourses.length} selected</span>
            )}
          </div>
          <p className="text-sm text-navy/60 mb-5">
            Select every AP course on your transcript. Then set your exam score (or mark "No exam") for each one.
          </p>

          {AP_COURSE_GROUPS.map((group) => (
            <div key={group.category} className="mb-5">
              <p className="text-xs tracking-wider uppercase text-navy/40 font-semibold mb-2">{group.category}</p>
              <div className="flex flex-wrap gap-2">
                {group.courses.map((course) => {
                  const isSelected = profile.selectedApCourses.includes(course);
                  return (
                    <button
                      key={course}
                      onClick={() => toggleCourse(course)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-navy text-white border-navy'
                          : 'bg-white text-navy/70 border-navy/15 hover:border-navy/40'
                      }`}
                    >
                      {course}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Score table */}
          {profile.selectedApCourses.length > 0 && (
            <div className="mt-6 border border-navy/10 rounded-xl overflow-hidden">
              <div className="bg-navy/3 px-4 py-2 grid grid-cols-[1fr_auto_auto] gap-4 text-xs tracking-wider uppercase text-navy/40 font-semibold">
                <span>Course</span>
                <span className="text-center">Score / Status</span>
                <span>Self-studied</span>
              </div>
              {profile.selectedApCourses.map((course) => {
                const exam = profile.apExams.find(e => e.subject === course);
                const activeScore = exam?.score ?? null;
                return (
                  <div key={course} className="px-4 py-3 border-t border-navy/8 grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                    <span className="text-sm font-medium text-navy">AP {course}</span>
                    <div className="flex items-center gap-1">
                      {([5, 4, 3, 2, 1] as const).map((n) => (
                        <button
                          key={n}
                          onClick={() => setExamScore(course, n)}
                          className={`w-8 h-8 rounded-md text-xs font-bold border transition-all ${
                            activeScore === n
                              ? 'bg-navy text-white border-navy'
                              : 'bg-white text-navy/60 border-navy/15 hover:border-navy/40'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        onClick={() => setExamScore(course, 'pending')}
                        className={`px-2 h-8 rounded-md text-xs font-medium border transition-all ${
                          activeScore === 'pending'
                            ? 'bg-accent-deep text-white border-accent-deep'
                            : 'bg-white text-navy/60 border-navy/15 hover:border-navy/40'
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => setExamScore(course, 'no_exam')}
                        className={`px-2 h-8 rounded-md text-xs font-medium border transition-all ${
                          activeScore === null
                            ? 'bg-navy/10 text-navy/70 border-navy/20'
                            : 'bg-white text-navy/40 border-navy/10 hover:border-navy/30'
                        }`}
                      >
                        No exam
                      </button>
                    </div>
                    <div className="flex justify-center">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exam?.selfStudied ?? false}
                          onChange={() => toggleSelfStudied(course)}
                          className="w-4 h-4 accent-navy"
                          disabled={!exam || exam.score === 'pending'}
                        />
                        <span className="text-xs text-navy/50">Self-studied</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {profile.selectedApCourses.length === 0 && (
            <p className="text-sm text-navy/40 italic mt-2">
              No AP courses selected yet — click any subject above to add it.
            </p>
          )}
        </div>

        {/* IB exams (only if IB diploma candidate — checkbox is below) */}
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
            <input type="checkbox" checked={profile.isIbDiplomaCandidate}
              onChange={(e) => update('isIbDiplomaCandidate', e.target.checked)}
              className="w-5 h-5 accent-navy" />
            <span>I'm an IB Diploma candidate</span>
          </label>

          {profile.isIbDiplomaCandidate && (
            <div className="ml-8 mt-4 mb-2">
              <label className="text-xs tracking-wider uppercase text-navy/60 block mb-3">IB Subject Scores</label>
              {profile.ibExams.length === 0 && (
                <p className="text-sm text-navy/40 italic mb-3">Add your IB subject results below.</p>
              )}
              <div className="space-y-2 mb-3">
                {profile.ibExams.map((exam) => (
                  <div key={exam.id} className="flex items-center gap-2 bg-navy/3 border border-navy/8 rounded-lg px-3 py-2">
                    <input type="text" value={exam.subject}
                      onChange={(e) => update('ibExams', profile.ibExams.map(ex => ex.id === exam.id ? { ...ex, subject: e.target.value } : ex))}
                      placeholder="e.g., HL Biology"
                      className="flex-1 bg-transparent outline-none text-sm border-b border-navy/15 focus:border-navy py-1" />
                    <select value={exam.score}
                      onChange={(e) => update('ibExams', profile.ibExams.map(ex => ex.id === exam.id ? { ...ex, score: (e.target.value === 'pending' ? 'pending' : Number(e.target.value)) as IbSubjectScore } : ex))}
                      className="bg-transparent text-sm outline-none border-b border-navy/15 focus:border-navy py-1 cursor-pointer">
                      {([7,6,5,4,3,2,1] as const).map(n => <option key={n} value={n}>{n}</option>)}
                      <option value="pending">Pending</option>
                    </select>
                    <button onClick={() => update('ibExams', profile.ibExams.filter(ex => ex.id !== exam.id))}
                      className="text-navy/30 hover:text-navy/70 text-lg leading-none px-1">×</button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => update('ibExams', [...profile.ibExams, { id: `ib-${Date.now()}`, subject: '', score: 'pending' }])}
                className="text-sm text-navy/60 hover:text-navy border border-navy/15 hover:border-navy/30 rounded-lg px-4 py-2 transition-all">
                + Add IB subject
              </button>
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={profile.hasCteCredential}
              onChange={(e) => update('hasCteCredential', e.target.checked)}
              className="w-5 h-5 accent-navy" />
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
          <Row label="Career goal"          value={profile.careerGoal ? CAREER_GOAL_LABEL[profile.careerGoal] : '—'} />
          <Row label="Path confidence"      value={profile.pathConfidence ? PATH_CONFIDENCE_LABEL[profile.pathConfidence] : '—'} />
          <Row label="Intended major"       value={profile.intendedMajor.trim() || 'Not specified'} />
          <Row label="Academic path"        value={profile.path ? PATH_LABEL[profile.path] : '—'} />
          <Row label="Current grade"        value={profile.gradeLevel ? GRADE_LABEL[profile.gradeLevel] : '—'} />
          <Row label="GPA range"            value={profile.gpaBucket ? GPA_LABEL[profile.gpaBucket] : '—'} />
          <Row label="AP courses at school" value={`${profile.apCoursesAtSchool} course${profile.apCoursesAtSchool !== 1 ? 's' : ''}`} />
          <Row label="AP exams recorded"    value={`${profile.apExams.length} exam${profile.apExams.length !== 1 ? 's' : ''}`} />
          <Row label="School's AP/IB offerings" value={OFFERINGS_LABEL[profile.courseOfferings]} />
          {profile.isIbDiplomaCandidate && <Row label="IB Diploma candidate" value="Yes" />}
          {profile.hasCteCredential && <Row label="CTE pathway" value="Yes" />}
        </div>

        <p className="text-xs tracking-wider uppercase text-navy/40 font-semibold mb-4 pt-4 border-t border-navy/5">Activities</p>
        <div className="space-y-3 mb-6">
          <Row label="Most distinguished activity" value={profile.highestTier ? TIER_LABEL[profile.highestTier] : '—'} />
          <Row label="Number of activities"        value={profile.activityCount ? `${COUNT_LABEL[profile.activityCount]} activities` : '—'} />
          {!noActivities && profile.yearsOnTop && (
            <Row label="Years in top activity" value={YEARS_LABEL[profile.yearsOnTop]} />
          )}
          {profile.activityTheme.trim() && (
            <Row label="Activity theme" value={profile.activityTheme} />
          )}
        </div>

        <p className="text-xs tracking-wider uppercase text-navy/40 font-semibold mb-4 pt-4 border-t border-navy/5">Testing</p>
        <div className="space-y-3 mb-6">
          <Row label="Testing status" value={profile.testStatus ? TEST_STATUS_LABEL[profile.testStatus] : '—'} />
          {profile.testStatus === 'sat' && profile.satBucket && (
            <Row label="SAT score range" value={SAT_LABEL[profile.satBucket]} />
          )}
          {profile.testStatus === 'act' && profile.actBucket && (
            <Row label="ACT score range" value={ACT_LABEL[profile.actBucket]} />
          )}
        </div>

        <p className="text-xs tracking-wider uppercase text-navy/40 font-semibold mb-4 pt-4 border-t border-navy/5">Leadership</p>
        <div className="space-y-3">
          <Row label="Highest leadership role" value={profile.leadershipScope ? LEADERSHIP_LABEL[profile.leadershipScope] : '—'} />
          <Row label="Impact scope"            value={profile.impactScope ? IMPACT_LABEL[profile.impactScope] : '—'} />
          {profile.hasMeasurableOutcome && <Row label="Measurable outcome" value="Yes" />}
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

function StepTesting({
  profile, update,
}: { profile: FullProfileInput; update: <K extends keyof FullProfileInput>(k: K, v: FullProfileInput[K]) => void }) {
  return (
    <>
      <h1 className="font-display text-4xl md:text-5xl mb-4">
        Standardized Testing
      </h1>
      <p className="text-navy/60 max-w-xl mb-10">
        Test scores remain one of the clearest signals admissions officers use
        to compare candidates. Tell us where you stand.
      </p>

      <div className="mb-10">
        <h3 className="font-display text-xl mb-4">What's your testing status?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          {TEST_STATUSES.map((t) => (
            <div
              key={t.key}
              className="option-card"
              data-selected={profile.testStatus === t.key}
              onClick={() => update('testStatus', t.key)}
            >
              <h3 className="font-display text-lg mb-2">{t.label}</h3>
              <p className="text-sm text-navy/60">{t.blurb}</p>
            </div>
          ))}
        </div>
      </div>

      {profile.testStatus === 'sat' && (
        <div className="mb-10">
          <h3 className="font-display text-xl mb-4">What's your SAT score range?</h3>
          <div className="grid grid-cols-2 gap-3">
            {SAT_BUCKETS.map((b) => (
              <button
                key={b.key}
                onClick={() => update('satBucket', b.key)}
                className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                  profile.satBucket === b.key
                    ? 'bg-navy text-white border-navy'
                    : 'bg-white text-navy border-navy/10 hover:border-navy/30'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {profile.testStatus === 'act' && (
        <div className="mb-10">
          <h3 className="font-display text-xl mb-4">What's your ACT score range?</h3>
          <div className="grid grid-cols-2 gap-3">
            {ACT_BUCKETS.map((b) => (
              <button
                key={b.key}
                onClick={() => update('actBucket', b.key)}
                className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                  profile.actBucket === b.key
                    ? 'bg-navy text-white border-navy'
                    : 'bg-white text-navy border-navy/10 hover:border-navy/30'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs italic text-navy/50">
        Why we ask: Test scores are a comparison anchor admissions use to evaluate
        students across very different schools.
      </p>
    </>
  );
}

function StepLeadership({
  profile, update,
}: { profile: FullProfileInput; update: <K extends keyof FullProfileInput>(k: K, v: FullProfileInput[K]) => void }) {
  return (
    <>
      <h1 className="font-display text-4xl md:text-5xl mb-4">
        Leadership Footprint
      </h1>
      <p className="text-navy/60 max-w-xl mb-10">
        Leadership is evaluated separately from your activities. We measure
        positional scope and demonstrated impact.
      </p>

      <div className="mb-10">
        <h3 className="font-display text-xl mb-4">What's your highest leadership role?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LEADERSHIP_SCOPES.map((s) => (
            <div
              key={s.key}
              className="option-card"
              data-selected={profile.leadershipScope === s.key}
              onClick={() => update('leadershipScope', s.key)}
            >
              <h3 className="font-display text-lg mb-2">{s.label}</h3>
              <p className="text-sm text-navy/60">{s.blurb}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <h3 className="font-display text-xl mb-4">What was the scope of your impact?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {IMPACT_SCOPES.map((s) => (
            <button
              key={s.key}
              onClick={() => update('impactScope', s.key)}
              className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all text-left ${
                profile.impactScope === s.key
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-navy border-navy/10 hover:border-navy/30'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={profile.hasMeasurableOutcome}
            onChange={(e) => update('hasMeasurableOutcome', e.target.checked)}
            className="w-5 h-5 mt-0.5 accent-navy shrink-0"
          />
          <span className="font-medium">
            I have a concrete, measurable outcome from my leadership (revenue,
            members gained, funds raised, awards won, etc.)
          </span>
        </label>
      </div>

      <p className="text-xs italic text-navy/50">
        Why we ask: Admissions distinguish between holding a title and creating
        real impact. Both inputs sharpen this score.
      </p>
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
