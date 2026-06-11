import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!process.env.ADMIN_PIN || request.headers.get("x-admin-pin") !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await sql`
    UPDATE app_control SET reload_version = reload_version + 1, updated_at = NOW()
    WHERE id = 'global'
    RETURNING reload_version AS "reloadVersion"
  `;
  return NextResponse.json(rows[0]);
}
