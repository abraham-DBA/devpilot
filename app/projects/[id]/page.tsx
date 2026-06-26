import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { Navbar } from "@/components/layout/Navbar";
import { ProjectDashboard } from "@/components/projects/ProjectDashboard";
import { AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type DbProject = {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
  created_by: string;
  created_at: string;
};

type DbMember = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type DbModule = {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  assigned_to: string | null;
  assigned_name: string | null;
  progress: number;
  status: "not_started" | "in_progress" | "review" | "completed" | "blocked";
  deadline: string;
};

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;

  // 1. Authenticate user session
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  if (!user) {
    redirect("/login");
  }

  try {
    // 2. Fetch public profile and role
    const profiles = await sql`
      SELECT * FROM users WHERE id = ${user.id} LIMIT 1
    `;
    const profile = (profiles[0] as { id: string; name: string; email: string; role: string } | undefined) || null;
    if (!profile || !profile.role) {
      redirect("/dashboard");
    }

    // 3. Verify user is a member of this project
    const memberships = await sql`
      SELECT 1 FROM project_members 
      WHERE project_id = ${id} AND user_id = ${user.id} 
      LIMIT 1
    `;
    if (memberships.length === 0) {
      redirect("/dashboard");
    }

    // 4. Fetch project metadata
    const dbProjects = await sql`
      SELECT * FROM projects WHERE id = ${id} LIMIT 1
    `;
    const project = dbProjects[0] as DbProject | undefined;
    if (!project) {
      redirect("/dashboard");
    }

    // 5. Fetch team members associated with the project
    const dbMembers = await sql`
      SELECT u.id, u.name, u.email, u.role
      FROM users u
      JOIN project_members pm ON pm.user_id = u.id
      WHERE pm.project_id = ${id}
      ORDER BY u.name ASC
    `;

    // 6. Fetch modules and resolve developer names
    const dbModules = await sql`
      SELECT m.*, u.name as assigned_name
      FROM modules m
      LEFT JOIN users u ON u.id = m.assigned_to
      WHERE m.project_id = ${id}
      ORDER BY m.deadline ASC
    `;

    // Calculate project progress percentage based on average module progress
    const modules = dbModules as DbModule[];
    const projectProgress = modules.length > 0
      ? modules.reduce((sum, m) => sum + m.progress, 0) / modules.length
      : 0;

    const projectWithProgress = {
      ...project,
      progress: projectProgress,
    };

    // 7. Fetch project activities feed logs
    const dbActivities = await sql`
      SELECT a.*, u.name as user_name
      FROM activities a
      JOIN users u ON u.id = a.user_id
      WHERE a.project_id = ${id}
      ORDER BY a.created_at DESC
      LIMIT 20
    `;
    const canManage = profile.role === "team_lead" || profile.role === "project_manager";

    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar userName={profile.name} userRole={profile.role} />

        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
          <ProjectDashboard
            project={projectWithProgress}
            members={dbMembers as DbMember[]}
            modules={modules}
            canManage={canManage}
            activities={dbActivities as any[]}
          />
        </main>
      </div>
    );
  } catch (error) {
    console.error("Project details database load error:", error);
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex items-center justify-center">
          <div className="bg-surface border border-error-light border-l-4 border-l-error rounded-2xl p-6 max-w-md w-full shadow-md flex flex-col gap-4">
            <div className="flex items-center gap-2 text-error">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Project Load Error
              </h2>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              We encountered a database connection issue while fetching project details. Please check your network or try again in a few moments.
            </p>
            <a
              href={`/projects/${id}`}
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
