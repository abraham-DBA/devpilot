import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL || "postgres://placeholder:placeholder@localhost:5432/placeholder";

// Neon serverless query client
export const sql = neon(connectionString);
