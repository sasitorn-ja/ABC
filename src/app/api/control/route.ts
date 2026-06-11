import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const rows = await sql`SELECT reload_version AS "reloadVersion" FROM app_control WHERE id = 'global' LIMIT 1`;
  return NextResponse.json(rows[0] || { reloadVersion: 0 }, {
    headers: { "Cache-Control": "no-store" },
  });
}
