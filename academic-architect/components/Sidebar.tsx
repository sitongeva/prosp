'use client';

import Link from 'next/link';

export type StepKey =
  | 'identity'
  | 'demographics'
  | 'path'
  | 'foundation'
  | 'activities'
  | 'testing'
  | 'leadership'
  | 'review';

interface SidebarProps {
  currentStep: StepKey;
  completedSteps: StepKey[];
  onNavigate?: (step: StepKey) => void;
}

const STEPS: { key: StepKey; label: string }[] = [
  { key: 'identity',     label: 'Identity' },
  { key: 'demographics', label: 'Demographics' },
  { key: 'path',         label: 'Academic Path' },
  { key: 'foundation',   label: 'Foundation' },
  { key: 'activities',   label: 'Activities' },
  { key: 'testing',      label: 'Testing' },
  { key: 'leadership',   label: 'Leadership' },
  { key: 'review',       label: 'Review' },
];

export default function Sidebar({ currentStep, completedSteps, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 p-6 border-r border-navy/10 bg-cream">
      <Link href="/" className="font-display font-semibold tracking-tight mb-12">
        Academic Architect
      </Link>
      <nav className="flex flex-col gap-1">
        {STEPS.map((step) => {
          const isComplete = completedSteps.includes(step.key);
          const isCurrent = currentStep === step.key;
          const clickable = isComplete && !isCurrent && onNavigate;
          return (
            <div
              key={step.key}
              className={`nav-item ${clickable ? 'cursor-pointer hover:bg-white/60' : ''}`}
              data-active={isCurrent}
              data-complete={isComplete}
              onClick={clickable ? () => onNavigate(step.key) : undefined}
            >
              <span>{step.label}</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
