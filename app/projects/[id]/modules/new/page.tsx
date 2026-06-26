import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { ModuleForm } from "@/app/projects/[id]/modules/new/ModuleForm";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NewModulePage({ params }: Props) {
  const { id: projectId } = await params;

  // 1. Authenticate user session
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  if (!user) {
    redirect("/login");
  }

  // 2. Fetch role and verify permissions
  const profiles = await sql`
    SELECT role FROM users WHERE id = ${user.id} LIMIT 1
  `;
  const profile = profiles[0] as { role: string } | undefined;
  if (!profile || (profile.role !== "team_lead" && profile.role !== "project_manager")) {
    redirect(`/projects/${projectId}`);
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
  const project = dbProjects[0] as { id: string; name: string; start_date: string; end_date: string } | undefined;
  if (!project) {
    redirect("/dashboard");
  }

  // 5. Fetch team members associated with the project
  const dbMembers = await sql`
    SELECT u.id, u.name, u.email, u.role
    FROM users u
    JOIN project_members pm ON pm.user_id = u.id
    WHERE pm.project_id = ${projectId}
    ORDER BY u.name ASC
  `;

  return (
    <ModuleForm
      project={project}
      members={dbMembers as { id: string; name: string; email: string; role: string }[]}
    />
  );
}
