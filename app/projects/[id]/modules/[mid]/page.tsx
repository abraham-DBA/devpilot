import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { Navbar } from "@/components/layout/Navbar";
import { ModuleWorkstation } from "@/components/modules/ModuleWorkstation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    id: string;
    mid: string;
  }>;
};

type DbProject = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
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
  blocker_description: string | null;
  technical_notes: string | null;
  implementation_notes: string | null;
};

export default async function ModuleDetailPage({ params }: Props) {
  const { id: projectId, mid: moduleId } = await params;

  // 1. Authenticate user session
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  if (!user) {
    redirect("/login");
  }

  // 2. Fetch user profile
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
    WHERE project_id = ${projectId} AND user_id = ${user.id} 
    LIMIT 1
  `;
  if (memberships.length === 0) {
    redirect("/dashboard");
  }

  // 4. Fetch project dates & details
  const dbProjects = await sql`
    SELECT id, name, start_date, end_date FROM projects WHERE id = ${projectId} LIMIT 1
  `;
  const project = dbProjects[0] as DbProject | undefined;
  if (!project) {
    redirect("/dashboard");
  }

  // 5. Fetch module details and developer assigned name
  const dbModules = await sql`
    SELECT m.*, u.name as assigned_name
    FROM modules m
    LEFT JOIN users u ON u.id = m.assigned_to
    WHERE m.id = ${moduleId} AND m.project_id = ${projectId}
    LIMIT 1
  `;
  const module = dbModules[0] as DbModule | undefined;
  if (!module) {
    redirect(`/projects/${projectId}`);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar userName={profile.name} userRole={profile.role} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <ModuleWorkstation
          project={project}
          module={module}
          profile={profile}
        />
      </main>
    </div>
  );
}
