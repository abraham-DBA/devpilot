import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { 
  GitBranch, 
  Users, 
  CheckSquare, 
  AlertTriangle, 
  FileText, 
  Clock, 
  ShieldAlert, 
  ArrowRight,
  Code
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  let user = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    user = session?.user || null;
  } catch (e) {
    // Graceful fallback if env vars are missing during build/first load
    console.warn("Better Auth session load failed on homepage, using logged-out state", e);
  }

  const ctaLink = user ? "/dashboard" : "/login";
  const ctaText = user ? "Go to Dashboard" : "Get Started Free";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full h-16 bg-surface border-b border-border flex items-center justify-between px-6 md:px-12 backdrop-blur-md bg-opacity-90">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-accent-foreground font-bold shadow-md shadow-accent/20">
            <GitBranch className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-text-black">
            DevFlow
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            Features
          </a>
          <a href="#workflow" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            How it Works
          </a>
          <a href="#health" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            Risk Management
          </a>
        </nav>
        <Link 
          href={ctaLink}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-accent hover:bg-accent-dark text-accent-foreground rounded-lg transition-all shadow-sm shadow-accent/10"
        >
          {ctaText}
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center py-20 md:py-32 px-6 overflow-hidden">
        {/* Subtle grid background decoration */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60"></div>
        
        <div className="max-w-4xl flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-accent-muted text-accent border border-accent-light rounded-full mb-2">
            <span>Specialized Coordination for Dev Teams</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-text-black tracking-tight leading-none">
            Eliminate Ownership Confusion.<br />
            <span className="text-accent">Deliver Software On Time.</span>
          </h1>
          <p className="max-w-2xl text-base md:text-lg text-text-secondary leading-relaxed">
            DevFlow is the developer-centric project management workspace that breaks projects into modules, enforces strict developer ownership, tracks real progress, and automatically flags scheduling risks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center max-w-md">
            <Link
              href={ctaLink}
              className="flex h-12 items-center justify-center gap-2 rounded-lg bg-accent text-accent-foreground px-6 text-sm font-medium hover:bg-accent-dark transition-all shadow-md shadow-accent/10"
            >
              {ctaText}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#workflow"
              className="flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-6 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-all"
            >
              See Workflow
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-surface border-y border-border px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
              Built Specifically for Software Engineers
            </h2>
            <p className="text-sm md:text-base text-text-secondary">
              Generic task managers focus on cards and lists. DevFlow focuses on components, ownership boundaries, and code delivery assurances.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4 p-6 bg-background rounded-xl border border-border hover:border-accent-light transition-all group">
              <div className="h-10 w-10 rounded-lg bg-accent-muted text-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">Accountability Mapping</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Assign clear module-level ownership to developers. Eliminate the duplicate work or grey areas common in multi-dev projects.
              </p>
            </div>

            <div className="flex flex-col gap-4 p-6 bg-background rounded-xl border border-border hover:border-accent-light transition-all group">
              <div className="h-10 w-10 rounded-lg bg-info-light text-info flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">Deadline & Health Tracking</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Visual deadline statuses (🟢 On Track, 🟡 Due Soon, 🔴 Overdue) paired with a schedule performance formula to spot delays instantly.
              </p>
            </div>

            <div className="flex flex-col gap-4 p-6 bg-background rounded-xl border border-border hover:border-accent-light transition-all group">
              <div className="h-10 w-10 rounded-lg bg-error-light text-error flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">Immediate Blocker Visibility</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Developers log blockers directly on their modules. The block immediately triggers project-wide visual flags for managers to resolve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 px-6 md:px-12 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1 flex flex-col gap-6">
            <div className="inline-flex w-fit px-3 py-1 text-xs font-semibold bg-success-lightest text-success border border-success-light rounded-full">
              <span>Structured Execution</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary leading-tight">
              Keep frontend, backend, and APIs aligned.
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Before writing code, divide the project into logical modules. Track implementation specifics directly on the module notes to avoid API conflicts and configuration mismatch.
            </p>

            <ul className="flex flex-col gap-4 mt-2">
              <li className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-accent-muted text-accent flex items-center justify-center mt-0.5">
                  <CheckSquare className="h-3 w-3" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">Modular Definition</h4>
                  <p className="text-xs text-text-secondary">Partition software structures into logical deliverables.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-accent-muted text-accent flex items-center justify-center mt-0.5">
                  <FileText className="h-3 w-3" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">Embedded Knowledge base</h4>
                  <p className="text-xs text-text-secondary">Store endpoints, SQL layouts, and logic variables directly in module contexts.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="flex-1 w-full bg-surface border border-border rounded-2xl p-6 shadow-xl relative">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-error"></div>
                <div className="h-3 w-3 rounded-full bg-warning"></div>
                <div className="h-3 w-3 rounded-full bg-success"></div>
              </div>
              <span className="text-xs text-text-muted font-mono">devflow_project_workspace</span>
            </div>

            {/* Mock Module Preview UI */}
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-background border border-border rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    <Code className="h-4 w-4 text-accent" />
                    Authentication Module
                  </h4>
                  <p className="text-xs text-text-muted">Assigned: John D.</p>
                </div>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-info-light text-info-foreground border border-info-light">
                  In Progress (75%)
                </span>
              </div>

              <div className="p-4 bg-background border border-border rounded-xl flex items-center justify-between border-l-4 border-l-error">
                <div>
                  <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    <Code className="h-4 w-4 text-error" />
                    Database Migrations
                  </h4>
                  <p className="text-xs text-text-muted">Assigned: Abraham A.</p>
                </div>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-error-light text-error-foreground border border-error-light animate-pulse">
                  🔴 Blocked
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Health / Risk Banner */}
      <section id="health" className="bg-gradient-to-br from-accent/5 via-background to-background py-20 px-6 border-t border-border text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
          <div className="h-12 w-12 rounded-full bg-error-light text-error flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
            Never Get Surprised by Deadlines Again
          </h2>
          <p className="text-sm md:text-base text-text-secondary leading-relaxed">
            DevFlow monitors elapsed timeline usage vs module completion levels. If a project is only 20% complete but has used 75% of its time, the system flags a 🔴 **High Risk** warning status automatically. Managers gain early warnings before releases fail.
          </p>
          <Link
            href={ctaLink}
            className="inline-flex h-11 items-center justify-center px-6 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent-dark transition-all mt-2"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-surface border-t border-border flex flex-col md:flex-row items-center justify-between px-6 md:px-12 text-xs text-text-muted">
        <span>© {new Date().getFullYear()} DevFlow. All rights reserved.</span>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Contact Support</a>
        </div>
      </footer>
    </div>
  );
}
