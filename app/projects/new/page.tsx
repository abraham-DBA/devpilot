import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { ProjectForm } from "@/app/projects/new/ProjectForm";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  // 1. Authenticate session
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  if (!user) {
    redirect("/login");
  }

  // 2. Query workspace user role and restrict access to non-admin roles
  const profiles = await sql`
    SELECT role FROM users WHERE id = ${user.id} LIMIT 1
  `;
  const profile = profiles[0] as { role: string } | undefined;
  if (!profile || (profile.role !== "team_lead" && profile.role !== "project_manager")) {
    redirect("/dashboard");
  }

  // 3. Query all registered users to select as project team members
  const dbUsers = await sql`
    SELECT id, name, email, role FROM users WHERE id != ${user.id} ORDER BY name ASC
  `;
  const users = dbUsers as { id: string; name: string; email: string; role: string }[];

  return <ProjectForm users={users} />;
}
