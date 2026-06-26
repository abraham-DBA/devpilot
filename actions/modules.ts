"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { randomUUID } from "crypto";

type CreateModuleResult = {
  success: boolean;
  error?: string;
  moduleId?: string;
};

export async function createModule(formData: {
  projectId: string;
  name: string;
  description?: string;
  assignedTo?: string; // Optional user assignment
  deadline: string;
}): Promise<CreateModuleResult> {
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
      return { success: false, error: "Only Team Leads or Project Managers can define modules." };
    }

    // 3. Query project timeline to check constraints
    const projects = await sql`
      SELECT start_date, end_date FROM projects WHERE id = ${formData.projectId} LIMIT 1
    `;
    const project = projects[0] as { start_date: string; end_date: string } | undefined;
    if (!project) {
      return { success: false, error: "Target project does not exist." };
    }

    const pStart = new Date(project.start_date).getTime();
    const pEnd = new Date(project.end_date).getTime();
    const mDeadline = new Date(formData.deadline).getTime();

    if (isNaN(mDeadline)) {
      return { success: false, error: "Invalid module deadline date." };
    }

    if (mDeadline < pStart || mDeadline > pEnd) {
      return {
        success: false,
        error: "Module deadline must fall within the project start and end dates.",
      };
    }

    // 4. Validate name
    if (!formData.name.trim()) {
      return { success: false, error: "Module name is required." };
    }

    const moduleId = randomUUID();

    // 5. Database operations
    await sql`
      INSERT INTO modules (
        id, 
        project_id, 
        name, 
        description, 
        assigned_to, 
        progress, 
        status, 
        deadline, 
        created_at, 
        updated_at
      )
      VALUES (
        ${moduleId}, 
        ${formData.projectId}, 
        ${formData.name.trim()}, 
        ${formData.description || null}, 
        ${formData.assignedTo || null}, 
        0, 
        'not_started', 
        ${formData.deadline}, 
        ${new Date().toISOString()}, 
        ${new Date().toISOString()}
      )
    `;

    // Log Activity
    await sql`
      INSERT INTO activities (id, project_id, user_id, message, created_at)
      VALUES (
        ${randomUUID()},
        ${formData.projectId},
        ${user.id},
        ${`Added module "${formData.name.trim()}"`},
        ${new Date().toISOString()}
      )
    `;

    revalidatePath(`/projects/${formData.projectId}`);
    return { success: true, moduleId };
  } catch (err) {
    console.error("[actions/modules/createModule]", err);
    return { success: false, error: "An unexpected error occurred while creating the module." };
  }
}

type UpdateModuleProgressAndStatusResult = {
  success: boolean;
  error?: string;
};

export async function updateModuleProgressAndStatus(formData: {
  projectId: string;
  moduleId: string;
  progress: number;
  status: "not_started" | "in_progress" | "review" | "completed" | "blocked";
  blockerDescription?: string;
}): Promise<UpdateModuleProgressAndStatusResult> {
  try {
    // 1. Authenticate user
    const sessionRes = await auth.api.getSession({
      headers: await headers(),
    });
    const user = sessionRes?.user;
    if (!user) {
      return { success: false, error: "Unauthorized access" };
    }

    // 2. Fetch user role
    const profiles = await sql`
      SELECT role FROM users WHERE id = ${user.id} LIMIT 1
    `;
    const profile = profiles[0] as { role: string } | undefined;
    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    // 3. Fetch module and verify permission (assigned developer or manager/lead)
    const modules = await sql`
      SELECT name, assigned_to FROM modules WHERE id = ${formData.moduleId} LIMIT 1
    `;
    const module = modules[0] as { name: string; assigned_to: string | null } | undefined;
    if (!module) {
      return { success: false, error: "Module not found" };
    }

    const isAssigned = module.assigned_to === user.id;
    const isManager = profile.role === "team_lead" || profile.role === "project_manager";

    if (!isAssigned && !isManager) {
      return {
        success: false,
        error: "Only the assigned developer or project leads can update this module.",
      };
    }

    // 4. Validate and normalise inputs
    let finalProgress = formData.progress;
    if (formData.status === "completed") {
      finalProgress = 100;
    } else if (finalProgress < 0) {
      finalProgress = 0;
    } else if (finalProgress > 100) {
      finalProgress = 100;
    }

    const blockerDesc = formData.status === "blocked" ? (formData.blockerDescription || "No description provided.") : null;

    // 5. Update Database
    await sql`
      UPDATE modules
      SET 
        progress = ${finalProgress},
        status = ${formData.status},
        blocker_description = ${blockerDesc},
        updated_at = ${new Date().toISOString()}
      WHERE id = ${formData.moduleId}
    `;

    // 6. Log Activity Feed
    let activityMsg = "";
    if (formData.status === "blocked") {
      activityMsg = `Logged blocker for module "${module.name}": "${blockerDesc}"`;
    } else if (formData.status === "completed") {
      activityMsg = `Completed module "${module.name}"`;
    } else {
      activityMsg = `Updated module "${module.name}" progress to ${finalProgress}% (${formData.status.replace("_", " ")})`;
    }

    await sql`
      INSERT INTO activities (id, project_id, user_id, message, created_at)
      VALUES (
        ${randomUUID()},
        ${formData.projectId},
        ${user.id},
        ${activityMsg},
        ${new Date().toISOString()}
      )
    `;

    revalidatePath(`/projects/${formData.projectId}`);
    revalidatePath(`/projects/${formData.projectId}/modules/${formData.moduleId}`);
    return { success: true };
  } catch (err) {
    console.error("[actions/modules/updateModuleProgressAndStatus]", err);
    return { success: false, error: "An unexpected error occurred while updating the module status." };
  }
}

type UpdateModuleNotesResult = {
  success: boolean;
  error?: string;
};

export async function updateModuleNotes(formData: {
  projectId: string;
  moduleId: string;
  technicalNotes?: string;
  implementationNotes?: string;
}): Promise<UpdateModuleNotesResult> {
  try {
    // 1. Authenticate user
    const sessionRes = await auth.api.getSession({
      headers: await headers(),
    });
    const user = sessionRes?.user;
    if (!user) {
      return { success: false, error: "Unauthorized access" };
    }

    // 2. Fetch user role
    const profiles = await sql`
      SELECT role FROM users WHERE id = ${user.id} LIMIT 1
    `;
    const profile = profiles[0] as { role: string } | undefined;
    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    // 3. Fetch module and check permissions
    const modules = await sql`
      SELECT name, assigned_to FROM modules WHERE id = ${formData.moduleId} LIMIT 1
    `;
    const module = modules[0] as { name: string; assigned_to: string | null } | undefined;
    if (!module) {
      return { success: false, error: "Module not found" };
    }

    const isAssigned = module.assigned_to === user.id;
    const isManager = profile.role === "team_lead" || profile.role === "project_manager";

    if (!isAssigned && !isManager) {
      return {
        success: false,
        error: "Only the assigned developer or project leads can edit notes.",
      };
    }

    // 4. Update Database
    if (formData.technicalNotes !== undefined && formData.implementationNotes !== undefined) {
      await sql`
        UPDATE modules
        SET 
          technical_notes = ${formData.technicalNotes},
          implementation_notes = ${formData.implementationNotes},
          updated_at = ${new Date().toISOString()}
        WHERE id = ${formData.moduleId}
      `;
    } else if (formData.technicalNotes !== undefined) {
      await sql`
        UPDATE modules
        SET 
          technical_notes = ${formData.technicalNotes},
          updated_at = ${new Date().toISOString()}
        WHERE id = ${formData.moduleId}
      `;
    } else if (formData.implementationNotes !== undefined) {
      await sql`
        UPDATE modules
        SET 
          implementation_notes = ${formData.implementationNotes},
          updated_at = ${new Date().toISOString()}
        WHERE id = ${formData.moduleId}
      `;
    }

    revalidatePath(`/projects/${formData.projectId}/modules/${formData.moduleId}`);
    return { success: true };
  } catch (err) {
    console.error("[actions/modules/updateModuleNotes]", err);
    return { success: false, error: "An unexpected error occurred while saving the notes." };
  }
}
