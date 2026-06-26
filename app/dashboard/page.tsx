import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { OnboardingForm } from "./OnboardingForm";
import { Navbar } from "@/components/layout/Navbar";
import { WorkspaceStats } from "@/components/dashboard/WorkspaceStats";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { WorkspaceCharts } from "@/components/dashboard/WorkspaceCharts";
import { calculateProjectHealth } from "@/lib/utils";
import { FolderGit2, Plus, AlertCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

type DbProject = {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
  created_by: string;
  created_at: string;
  member_count: number;
};

type DbModule = {
  id: string;
  project_id: string;
  name: string;
  progress: number;
  status: "not_started" | "in_progress" | "review" | "completed" | "blocked";
  assigned_to: string | null;
  assigned_name: string | null;
  blocker_description: string | null;
};

export default async function DashboardPage() {
  // 1. Authenticate user
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  if (!user) {
    redirect("/login");
  }

  try {
    // 2. Fetch public profile
    const profiles = await sql`
      SELECT * FROM users WHERE id = ${user.id} LIMIT 1
    `;
    const profile = (profiles[0] as { id: string; name: string; email: string; role: string; created_at: string } | undefined) || null;

    // 3. Render Onboarding if role or profile metadata is missing
    if (!profile || !profile.role) {
      const defaultName = 
        user.name || 
        user.email?.split("@")[0] || 
        "";
      return <OnboardingForm defaultName={defaultName} />;
    }

    // 4. Fetch user's projects where they are a member
    const dbProjects = await sql`
      SELECT p.*, 
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id)::integer as member_count
      FROM projects p
      JOIN project_members pm ON pm.project_id = p.id
      WHERE pm.user_id = ${user.id}
      ORDER BY p.created_at DESC
    `;

    // 5. Fetch modules for the projects the user belongs to and resolve developer names
    const dbModules = await sql`
      SELECT m.*, u.name as assigned_name 
      FROM modules m
      JOIN project_members pm ON pm.project_id = m.project_id
      LEFT JOIN users u ON u.id = m.assigned_to
      WHERE pm.user_id = ${user.id}
    `;

    // 6. Compute average progress and construct UI project objects
    const projects = (dbProjects as DbProject[]).map(p => {
      const projectModules = (dbModules as DbModule[]).filter(m => m.project_id === p.id);
      const progress = projectModules.length > 0
        ? projectModules.reduce((sum, m) => sum + m.progress, 0) / projectModules.length
        : 0;
      return {
        ...p,
        progress,
      };
    });

    // 7. Calculate overall stats
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.progress >= 100).length;
    const activeBlockers = (dbModules as DbModule[]).filter(m => m.status === 'blocked').length;
    const highRiskProjects = projects.filter(p => calculateProjectHealth(p.start_date, p.end_date, p.progress) === 'high_risk').length;

    const canCreate = profile.role === "team_lead" || profile.role === "project_manager";

    // 8. Calculate module stats for charts
    const totalModules = dbModules.length;
    const completedModules = (dbModules as DbModule[]).filter(m => m.status === 'completed').length;

    // Developer workloads calculated in-memory
    const workloadsMap: Record<string, number> = {};
    (dbModules as DbModule[]).forEach(m => {
      if (m.assigned_name) {
        workloadsMap[m.assigned_name] = (workloadsMap[m.assigned_name] || 0) + 1;
      }
    });
    const developerWorkloads = Object.entries(workloadsMap)
      .map(([name, count]) => ({ name, module_count: count }))
      .sort((a, b) => b.module_count - a.module_count);

    // Active blockers list calculated in-memory
    const activeBlockersList = (dbModules as DbModule[])
      .filter(m => m.status === 'blocked')
      .map(m => {
        const proj = projects.find(p => p.id === m.project_id);
        return {
          id: m.id,
          name: m.name,
          blocker_description: m.blocker_description,
          project_id: m.project_id,
          project_name: proj ? proj.name : "",
          owner_name: m.assigned_name,
        };
      });

    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar userName={profile.name} userRole={profile.role} />

        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col gap-8">
          {/* Welcome & Stats Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary">
                Welcome back, {profile.name}!
              </h1>
              <p className="text-xs text-text-secondary">
                Role: <span className="font-semibold capitalize text-accent">{profile.role.replace("_", " ")}</span> • Workspace synced successfully.
              </p>
            </div>
            {canCreate && (
              <Link
                href="/projects/new"
                className="inline-flex h-10 items-center justify-center gap-2 px-4 rounded-lg bg-accent hover:bg-accent-dark text-accent-foreground text-sm font-medium shadow-sm transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Create Project
              </Link>
            )}
          </div>

          {totalProjects > 0 ? (
            <>
              {/* Workspace Stats Panel */}
              <WorkspaceStats
                totalProjects={totalProjects}
                completedProjects={completedProjects}
                activeBlockers={activeBlockers}
                highRiskProjects={highRiskProjects}
              />

              {/* Projects Grid Section */}
              <div className="flex flex-col gap-4">
                <h2 className="text-base font-bold text-text-primary uppercase tracking-wider text-xs">
                  Active Projects
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>

              {/* Workspace Charts Analytics */}
              <div className="flex flex-col gap-4 mt-2">
                <h2 className="text-base font-bold text-text-primary uppercase tracking-wider text-xs">
                  Workspace Analytics
                </h2>
                <WorkspaceCharts
                  completedModules={completedModules}
                  totalModules={totalModules}
                  developerWorkloads={developerWorkloads}
                  activeBlockersList={activeBlockersList}
                />
              </div>
            </>
          ) : (
            /* Empty State Layout */
            <div className="bg-surface border border-border rounded-2xl p-12 shadow-sm flex flex-col items-center text-center gap-6 mt-4">
              <div className="h-16 w-16 rounded-full bg-surface-secondary text-text-muted flex items-center justify-center border border-border">
                <FolderGit2 className="h-8 w-8" />
              </div>
              <div className="max-w-md flex flex-col gap-2">
                <h2 className="text-lg font-bold text-text-primary">No Projects Active</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Get started by creating your first workspace repository and mapping team responsibilities.
                </p>
              </div>
              {canCreate ? (
                <Link
                  href="/projects/new"
                  className="inline-flex h-10 items-center justify-center gap-2 px-5 rounded-lg bg-accent hover:bg-accent-dark text-accent-foreground text-sm font-semibold transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Create Project
                </Link>
              ) : (
                <p className="text-xs text-text-muted italic">
                  Ask a Team Lead or Project Manager to assign you to a project.
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    );
  } catch (error) {
    console.error("Dashboard database load error:", error);
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex items-center justify-center">
          <div className="bg-surface border border-error-light border-l-4 border-l-error rounded-2xl p-6 max-w-md w-full shadow-md flex flex-col gap-4">
            <div className="flex items-center gap-2 text-error">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Workspace Load Error
              </h2>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              We encountered a database connection issue while fetching your workspace details. Please check your network or try again in a few moments.
            </p>
            <a
              href="/dashboard"
              className="h-9 inline-flex items-center justify-center rounded-lg bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent-dark transition-colors text-center"
            >
              Retry Connection
            </a>
          </div>
        </div>
      </div>
    );
  }
}
