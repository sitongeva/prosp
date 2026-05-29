import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Top nav */}
      <nav className="px-6 md:px-12 py-5 flex items-center justify-between">
        <div className="font-display font-semibold tracking-tight text-lg">
          Academic Architect
        </div>
        <Link href="/audit" className="btn-primary text-sm py-2 px-4">
          Start Audit
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-12 md:pt-20 pb-24 max-w-6xl mx-auto">
        <h1 className="font-display text-5xl md:text-7xl leading-[1.05] tracking-tight max-w-3xl">
          Know exactly what your profile is missing
          <span className="block italic font-normal text-navy/70 mt-2">
            and how to fix it.
          </span>
        </h1>
        <p className="mt-8 text-lg text-navy/70 max-w-xl">
          Based on your goals and your school, get a personalized score,
          identify your gaps, and see exactly what to do next.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <Link href="/audit" className="btn-primary">
            Start Audit →
          </Link>
        </div>
      </section>
    </main>
  );
}
