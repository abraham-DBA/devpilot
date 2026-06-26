import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import {
  GitBranch,
  ArrowRight,
  ChevronRight,
  Code
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  let user = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    user = session?.user || null;
  } catch (e) {
    console.warn("Better Auth session load failed on homepage, using logged-out state", e);
  }

  const ctaLink = user ? "/dashboard" : "/login";
  const ctaText = user ? "Go to Dashboard" : "Sign in";

  return (
    <div className="flex flex-col min-h-screen bg-surface font-sans antialiased text-text-primary">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full h-16 bg-surface border-b border-border flex items-center justify-between px-6 md:px-12 backdrop-blur-md bg-opacity-95">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-accent-foreground font-bold shadow-md shadow-accent/15">
            <GitBranch className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-text-black">
            DevFlow
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-text-secondary">
          <a href="#features" className="hover:text-text-primary transition-colors">
            Product
          </a>
          <a href="#workflow" className="hover:text-text-primary transition-colors">
            Workflow
          </a>
          <a href="#teams" className="hover:text-text-primary transition-colors">
            For teams
          </a>
          <a href="#faq" className="hover:text-text-primary transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            href={ctaLink}
            className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-bold bg-accent hover:bg-accent-dark text-accent-foreground rounded-full transition-all"
          >
            {ctaText}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-success-lightest text-success-foreground border border-success-light/45 mb-6 uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
              DELIVERY TELEMETRY · v2.4
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-text-black tracking-tight leading-[1.08] mb-6">
              Stop shipping<br />
              software <span className="text-text-muted">on faith.</span>
            </h1>

            <p className="text-sm md:text-base text-text-secondary leading-relaxed mb-8 max-w-2xl">
              DevFlow turns a software project into a live readout. Modular ownership, progress telemetry, and integration risk — so engineering leads know what will ship, what will slip, and who is blocked, in real time.
            </p>

            <div className="flex flex-wrap items-center gap-5 mb-8">
              <Link
                href={ctaLink}
                className="inline-flex h-10 items-center justify-center bg-accent text-accent-foreground px-6 rounded-full text-xs font-bold hover:bg-accent-dark transition-all shadow-sm"
              >
                {ctaText}
              </Link>
              <Link
                href={ctaLink}
                className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:text-accent-dark transition-colors"
              >
                See the dashboard <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex items-center gap-4 text-[9px] tracking-widest font-bold text-text-muted">
              <span>NO CARD REQUIRED</span>
              <span className="h-1 w-1 rounded-full bg-border-muted"></span>
              <span>14-DAY PILOT</span>
              <span className="h-1 w-1 rounded-full bg-border-muted"></span>
              <span>SOC2 IN PROGRESS</span>
            </div>
          </div>

          {/* Hero Right Widget */}
          <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
            <div className="bg-surface border border-border rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-5">
              {/* Header */}
              <div className="flex items-center justify-between text-[10px] font-bold text-text-muted">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
                  <span>LIVE · SYSTEM ARCH v2</span>
                </div>
                <span>64% · D-14</span>
              </div>
              
              {/* Completion Block */}
              <div>
                <span className="text-[9px] font-bold text-text-muted tracking-wider uppercase">Overall Completion</span>
                <div className="flex items-baseline gap-2 mt-1 mb-2">
                  <span className="text-3xl font-semibold text-text-primary tracking-tight">64%</span>
                  <span className="text-xs font-semibold text-success font-medium">
                    +4% today
                  </span>
                </div>
                <div className="w-full h-2 bg-surface-secondary border border-border-light rounded-full overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: "64%" }}></div>
                </div>
              </div>
              
              {/* Module Progress Cards List */}
              <div className="flex flex-col gap-2.5 mt-1">
                {/* Auth Card */}
                <div className="bg-surface border border-border rounded-xl p-3 flex items-center justify-between shadow-sm">
                  <span className="text-xs font-semibold text-text-primary w-14 shrink-0">Auth</span>
                  <div className="flex-1 mx-3 h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full" style={{ width: "88%" }}></div>
                  </div>
                  <span className="text-[10px] font-semibold text-text-secondary w-8 text-right shrink-0">88%</span>
                </div>

                {/* Billing Card */}
                <div className="bg-surface border border-border rounded-xl p-3 flex items-center justify-between shadow-sm">
                  <span className="text-xs font-semibold text-text-primary w-14 shrink-0">Billing</span>
                  <div className="flex-1 mx-3 h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-warning rounded-full" style={{ width: "42%" }}></div>
                  </div>
                  <span className="text-[10px] font-semibold text-text-secondary w-8 text-right shrink-0">42%</span>
                </div>

                {/* Viz Card */}
                <div className="bg-surface border border-border rounded-xl p-3 flex items-center justify-between shadow-sm">
                  <span className="text-xs font-semibold text-text-primary w-14 shrink-0">Viz</span>
                  <div className="flex-1 mx-3 h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full" style={{ width: "75%" }}></div>
                  </div>
                  <span className="text-[10px] font-semibold text-text-secondary w-8 text-right shrink-0">75%</span>
                </div>

                {/* DB Card */}
                <div className="bg-surface border border-border rounded-xl p-3 flex items-center justify-between shadow-sm">
                  <span className="text-xs font-semibold text-text-primary w-14 shrink-0">DB v2.4</span>
                  <div className="flex-1 mx-3 h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-error rounded-full" style={{ width: "18%" }}></div>
                  </div>
                  <span className="text-[10px] font-semibold text-text-secondary w-8 text-right shrink-0">18%</span>
                </div>
              </div>
              
              {/* Blocker footer divider and row */}
              <div className="border-t border-border-light pt-4 mt-1 flex items-center justify-between text-[9px] text-text-muted">
                <div className="flex items-center gap-1.5 font-bold tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-error"></span>
                  <span>1 BLOCKER</span>
                </div>
                <span className="font-mono text-text-secondary font-medium tracking-tight">auth ↔ db drift</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="border-y border-border bg-surface-secondary/40 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-1 md:border-r border-border md:pr-8 last:border-none">
            <span className="text-3xl font-extrabold text-text-primary tracking-tight">-47%</span>
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Integration rework</span>
            <span className="text-xs text-text-secondary">across 200+ release cycles</span>
          </div>
          <div className="flex flex-col gap-1 md:border-r border-border md:px-8 last:border-none">
            <span className="text-3xl font-extrabold text-text-primary tracking-tight">3.2d</span>
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Avg. blocker resolution</span>
            <span className="text-xs text-text-secondary">down from 11 days</span>
          </div>
          <div className="flex flex-col gap-1 md:pl-8">
            <span className="text-3xl font-extrabold text-text-primary tracking-tight">94%</span>
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">On-time module delivery</span>
            <span className="text-xs text-text-secondary">vs. 61% industry baseline</span>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 flex flex-col gap-3">
          <span className="text-xs font-bold text-text-muted tracking-widest uppercase">The Problem</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight leading-tight">
            Every release slips for<br className="hidden sm:inline" /> the same three reasons.
          </h2>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xs font-bold text-text-muted">01</span>
            <h3 className="text-sm font-bold text-text-primary">Missed deadlines</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Slipping milestones get caught the week before launch — never the week before that. Burndown lives in someone's head.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xs font-bold text-text-muted">02</span>
            <h3 className="text-sm font-bold text-text-primary">Integration conflicts</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Backend ships an API. Frontend ships a different contract. Two weeks of rework, every release cycle.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xs font-bold text-text-muted">03</span>
            <h3 className="text-sm font-bold text-text-primary">No accountability</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Leads cannot answer 'who is blocked right now?' without a meeting. Status updates are async and out of date.
            </p>
          </div>
        </div>
      </section>

      {/* The System Section */}
      <section className="py-20 bg-surface-secondary/40 border-y border-border px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-6 flex flex-col gap-3">
              <span className="text-xs font-bold text-text-muted tracking-widest uppercase">The System</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
                Four primitives.<br />One source of truth.
              </h2>
            </div>
            <div className="lg:col-span-6">
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                Built for engineering teams that have outgrown ticket boards but refuse to run a release on gut feel.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primitives Card 1 */}
            <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-accent bg-accent-muted border border-accent-light px-2 py-0.5 rounded uppercase tracking-wide">
                  Modules
                </span>
              </div>
              <h3 className="text-base font-bold text-text-primary">Break work into owned components</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Every module has one owner, one deadline, and an integration contract. No ambiguous shared responsibility — no orphan tickets.
              </p>
              <ul className="flex flex-col gap-2 mt-2 pt-4 border-t border-border-light text-xs text-text-secondary">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent"></span>
                  Single-owner modules
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent"></span>
                  Integration tags per API surface
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent"></span>
                  Status: on-track · at-risk · blocked
                </li>
              </ul>
            </div>

            {/* Primitives Card 2 */}
            <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-info bg-info-lightest border border-info-light px-2 py-0.5 rounded uppercase tracking-wide">
                  Telemetry
                </span>
              </div>
              <h3 className="text-base font-bold text-text-primary">Progress you can trust at a glance</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                A live readout of completion %, burnup trend, and time-to-deadline. The dashboard is the source of truth — not the standup.
              </p>
              <ul className="flex flex-col gap-2 mt-2 pt-4 border-t border-border-light text-xs text-text-secondary">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-info"></span>
                  Daily burnup vs. target
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-info"></span>
                  Per-module progress bars
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-info"></span>
                  Deadline drift detection
                </li>
              </ul>
            </div>

            {/* Primitives Card 3 */}
            <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-warning bg-warning-light/30 border border-warning-light px-2 py-0.5 rounded uppercase tracking-wide">
                  Integration
                </span>
              </div>
              <h3 className="text-base font-bold text-text-primary">Catch contract drift before merge</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Every cross-module API is registered as a contract. DevFlow flags drift the moment two owners disagree on a schema.
              </p>
              <ul className="flex flex-col gap-2 mt-2 pt-4 border-t border-border-light text-xs text-text-secondary">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-warning"></span>
                  Contract registry
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-warning"></span>
                  Drift alerts on schema change
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-warning"></span>
                  Blocker chain visualization
                </li>
              </ul>
            </div>

            {/* Primitives Card 4 */}
            <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-success bg-success-lightest border border-success-light px-2 py-0.5 rounded uppercase tracking-wide">
                  Accountability
                </span>
              </div>
              <h3 className="text-base font-bold text-text-primary">See who is shipping, who is stuck</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Team velocity, current load, and active blockers in one view. Surface the people who need help — without asking them to raise their hand.
              </p>
              <ul className="flex flex-col gap-2 mt-2 pt-4 border-t border-border-light text-xs text-text-secondary">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
                  Per-engineer load %
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
                  Active blocker assignment
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
                  Critical path callouts
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-text-muted tracking-widest uppercase">The Workflow</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
            From kickoff to release in four moves.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-text-muted">01</span>
            <h3 className="text-sm font-bold text-text-primary">Define the modules</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Carve the project into 5–20 modules. Assign one owner, one deadline, one integration tag each.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-text-muted">02</span>
            <h3 className="text-sm font-bold text-text-primary">Log progress daily</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Owners post a one-line update. DevFlow rolls it into completion %, burnup, and risk scoring automatically.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-text-muted">03</span>
            <h3 className="text-sm font-bold text-text-primary">Resolve at the contract layer</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              When two modules disagree on an API, DevFlow flags the drift and routes a sync between the owners.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-text-muted">04</span>
            <h3 className="text-sm font-bold text-text-primary">Ship with telemetry, not faith</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Release readiness becomes a number. Either every module is at 100% — or you see exactly what's holding the line.
            </p>
          </div>
        </div>
      </section>

      {/* For Teams Section */}
      <section id="teams" className="py-20 bg-surface-secondary/40 border-y border-border px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 flex flex-col gap-4">
            <span className="text-xs font-bold text-text-muted tracking-widest uppercase">For Teams</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight leading-tight">
              Built for everyone<br className="hidden sm:inline" /> on the release.
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Every role gets the view they need — without context-switching into another tool.
            </p>
          </div>

          <div className="lg:col-span-8 border border-border rounded-2xl overflow-hidden shadow-sm bg-surface">
            <div className="grid grid-cols-1 divide-y divide-border text-xs">
              <div className="grid grid-cols-3 p-4 hover:bg-surface-secondary/40 transition-colors items-center">
                <span className="font-bold text-text-primary col-span-1">Engineering leads</span>
                <span className="text-text-secondary col-span-2">Daily readiness review without a status meeting</span>
              </div>
              <div className="grid grid-cols-3 p-4 hover:bg-surface-secondary/40 transition-colors items-center">
                <span className="font-bold text-text-primary col-span-1">Tech leads</span>
                <span className="text-text-secondary col-span-2">Detect schema drift before code review</span>
              </div>
              <div className="grid grid-cols-3 p-4 hover:bg-surface-secondary/40 transition-colors items-center">
                <span className="font-bold text-text-primary col-span-1">Product managers</span>
                <span className="text-text-secondary col-span-2">Honest deadlines backed by real burnup data</span>
              </div>
              <div className="grid grid-cols-3 p-4 hover:bg-surface-secondary/40 transition-colors items-center">
                <span className="font-bold text-text-primary col-span-1">IC engineers</span>
                <span className="text-text-secondary col-span-2">Know who depends on you and who you depend on</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Quote Section */}
      <section className="py-24 max-w-5xl mx-auto px-6 text-center flex flex-col items-center gap-8">
        <p className="text-lg md:text-2xl font-semibold text-text-primary leading-relaxed max-w-4xl italic">
          "We caught a schema collision between Auth and Billing on a Tuesday. Before DevFlow, we'd have found it the night before launch."
        </p>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-accent-muted border border-accent-light text-accent flex items-center justify-center font-bold text-xs">
            MC
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold text-text-primary">Marcus Chen</h4>
            <p className="text-[10px] text-text-secondary">Engineering Lead · Pivot Labs</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-border">
        <div className="lg:col-span-4 flex flex-col gap-3">
          <span className="text-xs font-bold text-text-muted tracking-widest uppercase">FAQ</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
            Common questions.
          </h2>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-4">
          <details className="group border-b border-border pb-4 cursor-pointer">
            <summary className="flex items-center justify-between text-sm font-semibold text-text-primary hover:text-accent transition-colors list-none [&::-webkit-details-marker]:hidden">
              <span>How is this different from Jira or Linear?</span>
              <span className="text-text-muted group-open:rotate-45 transition-transform text-lg select-none font-light">+</span>
            </summary>
            <p className="mt-3 text-xs text-text-secondary leading-relaxed">
              Jira and Linear focus on tracking generic tasks and backlog cards. DevFlow is engineered around system integration realities: breaking code structure into owned modules, mapping cross-team schema boundaries, telemetry tracking, and notifying on real integration risk thresholds.
            </p>
          </details>

          <details className="group border-b border-border pb-4 cursor-pointer">
            <summary className="flex items-center justify-between text-sm font-semibold text-text-primary hover:text-accent transition-colors list-none [&::-webkit-details-marker]:hidden">
              <span>Do we have to migrate off our existing tools?</span>
              <span className="text-text-muted group-open:rotate-45 transition-transform text-lg select-none font-light">+</span>
            </summary>
            <p className="mt-3 text-xs text-text-secondary leading-relaxed">
              No. DevFlow functions as a system overview context map that sits on top of your existing workflows. You can keep Jira/Linear for tasks, and use DevFlow to map architecture ownership and calculate actual integration progress.
            </p>
          </details>

          <details className="group border-b border-border pb-4 cursor-pointer">
            <summary className="flex items-center justify-between text-sm font-semibold text-text-primary hover:text-accent transition-colors list-none [&::-webkit-details-marker]:hidden">
              <span>How does drift detection work?</span>
              <span className="text-text-muted group-open:rotate-45 transition-transform text-lg select-none font-light">+</span>
            </summary>
            <p className="mt-3 text-xs text-text-secondary leading-relaxed">
              Every cross-module interface is registered as an integration contract. When owner schemas diverge, DevFlow automatically flags a blockers notice alerting the respective team members before conflicts reach your integration code reviewers.
            </p>
          </details>

          <details className="group border-b border-border pb-4 cursor-pointer">
            <summary className="flex items-center justify-between text-sm font-semibold text-text-primary hover:text-accent transition-colors list-none [&::-webkit-details-marker]:hidden">
              <span>Can it handle multiple concurrent projects?</span>
              <span className="text-text-muted group-open:rotate-45 transition-transform text-lg select-none font-light">+</span>
            </summary>
            <p className="mt-3 text-xs text-text-secondary leading-relaxed">
              Yes. You can manage multiple projects from the unified workspace dashboard, allowing leads to audit delivery risks and blockages across the entire engineering division simultaneously.
            </p>
          </details>
        </div>
      </section>

      {/* CTA Card Section */}
      <section className="py-12 max-w-7xl mx-auto px-6 md:px-12">
        <div className="bg-gradient-to-br from-accent to-accent-dark text-accent-foreground rounded-2xl p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden shadow-xl border border-accent-light/10">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-accent-light/10 blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col gap-3 max-w-2xl relative z-10">
            <span className="text-[10px] font-bold text-accent-light tracking-widest uppercase">Accepting pilot teams · Q4</span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Make your next release<br />a known quantity.
            </h2>
            <p className="text-xs text-accent-muted leading-relaxed max-w-lg mt-1">
              14-day pilot. Bring one project. We'll set up modules, owners, and integration contracts with your team in a single session.
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 shrink-0 relative z-10 w-full sm:w-56">
            <Link
              href={ctaLink}
              className="inline-flex h-10 items-center justify-center bg-surface hover:bg-slate-100 text-accent px-6 rounded-full text-xs font-bold transition-all shadow-sm w-full"
            >
              {ctaText}
            </Link>
            <Link
              href={ctaLink}
              className="inline-flex h-10 items-center justify-center border border-accent-light/30 hover:bg-surface/10 text-accent-foreground px-6 rounded-full text-xs font-bold transition-all w-full"
            >
              Tour the dashboard →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 max-w-7xl mx-auto w-full px-6 md:px-12 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-text-muted bg-surface">
        <div className="flex items-center gap-2 font-bold text-text-primary">
          <div className="h-5 w-5 rounded bg-accent flex items-center justify-center text-surface">
            <GitBranch className="h-3.5 w-3.5" />
          </div>
          <span>DevFlow · © 2026</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-text-primary transition-colors">Security</a>
          <a href="#" className="hover:text-text-primary transition-colors">Changelog</a>
          <a href="#" className="hover:text-text-primary transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}

