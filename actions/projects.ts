"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { randomUUID } from "crypto";

type CreateProjectResult = {
  success: boolean;
  error?: string;
  projectId?: string;
};

export async function createProject(formData: {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  memberIds: string[];
}): Promise<CreateProjectResult> {
  try {
    // 1. Authenticate user
    const sessionRes = await auth.api.getSession({
      headers: await headers(),
    });
    const user = sessionRes?.user;
    if (!user) {
      return { success: false, error: "Unauthorized access" };
    }

    // 2. Fetch role and verify permissions
    const profiles = await sql`
      SELECT role FROM users WHERE id = ${user.id} LIMIT 1
    `;
    const profile = profiles[0] as { role: string } | undefined;
    if (!profile || (profile.role !== "team_lead" && profile.role !== "project_manager")) {
      return { success: false, error: "Only Team Leads or Project Managers can create projects." };
    }

    // 3. Validation
    if (!formData.name.trim()) {
      return { success: false, error: "Project name is required" };
    }
    if (!formData.startDate || !formData.endDate) {
      return { success: false, error: "Start date and End date are required" };
    }
    const start = new Date(formData.startDate).getTime();
    const end = new Date(formData.endDate).getTime();
    if (isNaN(start) || isNaN(end)) {
      return { success: false, error: "Invalid date formats provided" };
    }
    if (start > end) {
      return { success: false, error: "Start date must be before or equal to End date" };
    }

    const projectId = randomUUID();

    // 4. Database operations
    // Create project
    await sql`
      INSERT INTO projects (id, name, description, start_date, end_date, status, created_by, created_at)
      VALUES (
        ${projectId}, 
        ${formData.name.trim()}, 
        ${formData.description || null}, 
        ${formData.startDate}, 
        ${formData.endDate}, 
        'active', 
        ${user.id}, 
        ${new Date().toISOString()}
      )
    `;

    // Add creator as project member
    await sql`
      INSERT INTO project_members (id, project_id, user_id, joined_at)
      VALUES (${randomUUID()}, ${projectId}, ${user.id}, ${new Date().toISOString()})
    `;

    // Add other selected members
    for (const memberId of formData.memberIds) {
      if (memberId !== user.id) {
        await sql`
          INSERT INTO project_members (id, project_id, user_id, joined_at)
          VALUES (${randomUUID()}, ${projectId}, ${memberId}, ${new Date().toISOString()})
          ON CONFLICT (project_id, user_id) DO NOTHING
        `;
      }
    }

    // Log Activity
    await sql`
      INSERT INTO activities (id, project_id, user_id, message, created_at)
      VALUES (
        ${randomUUID()},
        ${projectId},
        ${user.id},
        ${`Created project "${formData.name.trim()}"`},
        ${new Date().toISOString()}
      )
    `;

    revalidatePath("/dashboard");
    return { success: true, projectId };
  } catch (err) {
    console.error("[actions/projects/createProject]", err);
    return { success: false, error: "An unexpected error occurred while creating the project." };
  }
}
