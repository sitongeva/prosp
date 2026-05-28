'use client';

import Link from 'next/link';

export type StepKey = 'identity' | 'path' | 'foundation' | 'activities' | 'review';

interface SidebarProps {
  currentStep: StepKey;
  completedSteps: StepKey[];
}

const STEPS: { key: StepKey; label: string }[] = [
  { key: 'identity',   label: 'Identity' },
  { key: 'path',       label: 'Academic Path' },
  { key: 'foundation', label: 'Foundation' },
  { key: 'activities', label: 'Activities' },
  { key: 'review',     label: 'Review' },
];

export default function Sidebar({ currentStep, completedSteps }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 p-6 border-r border-navy/10 bg-cream">
      <Link href="/" className="font-display font-semibold tracking-tight mb-12">
        Academic Architect
      </Link>
      <nav className="flex flex-col gap-1">
        {STEPS.map((step) => (
          <div
            key={step.key}
            className="nav-item"
            data-active={currentStep === step.key}
            data-complete={completedSteps.includes(step.key)}
          >
            <span>{step.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}
