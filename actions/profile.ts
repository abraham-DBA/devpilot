"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";

type SaveProfileResult = {
  success: boolean;
  error?: string;
};

export async function saveProfile(formData: {
  name: string;
  role: "developer" | "team_lead" | "project_manager";
}): Promise<SaveProfileResult> {
  try {
    // 1. Authenticate user session
    const sessionRes = await auth.api.getSession({
      headers: await headers(),
    });
    const user = sessionRes?.user;
    if (!user) {
      return { success: false, error: "Unauthorized access" };
    }

    // 2. Validate input constraints
    if (!formData.name.trim()) {
      return { success: false, error: "Display name cannot be empty" };
    }
    if (!formData.role || !["developer", "team_lead", "project_manager"].includes(formData.role)) {
      return { success: false, error: "Please select a valid role" };
    }

    // 3. Update record inside public.users
    await sql`
      UPDATE users 
      SET 
        name = ${formData.name.trim()}, 
        role = ${formData.role}
      WHERE id = ${user.id}
    `;

    // 4. Trigger router revalidation
    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return { success: true };
  } catch (err) {
    console.error("[actions/profile/saveProfile]", err);
    return { success: false, error: "An unexpected error occurred while saving profile" };
  }
}

