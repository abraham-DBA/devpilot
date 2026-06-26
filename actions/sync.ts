"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { randomUUID } from "crypto";

type RequestSyncResult = {
  success: boolean;
  error?: string;
};

export async function requestSync(
  projectId: string,
  moduleId: string,
  blockerTitle: string
): Promise<RequestSyncResult> {
  try {
    const sessionRes = await auth.api.getSession({
      headers: await headers(),
    });
    const user = sessionRes?.user;
    if (!user) {
      return { success: false, error: "Unauthorized access" };
    }

    // Fetch module name
    const modules = await sql`
      SELECT name FROM modules WHERE id = ${moduleId} LIMIT 1
    `;
    const module = modules[0] as { name: string } | undefined;
    if (!module) {
      return { success: false, error: "Module not found" };
    }

    // Insert sync request activity
    await sql`
      INSERT INTO activities (id, project_id, user_id, message, created_at)
      VALUES (
        ${randomUUID()},
        ${projectId},
        ${user.id},
        ${`Requested a sync for critical blocker "${blockerTitle}" on module "${module.name}"`},
        ${new Date().toISOString()}
      )
    `;

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (err) {
    console.error("[actions/sync/requestSync]", err);
    return { success: false, error: "An unexpected error occurred while requesting a sync." };
  }
}
