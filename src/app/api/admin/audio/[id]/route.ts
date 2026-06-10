import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const pin = request.headers.get("x-admin-pin");
  if (!process.env.ADMIN_PIN || pin !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const rows = await sql`
    SELECT encode(audio_data, 'base64') AS audio_base64, audio_type
    FROM quiz_recordings
    WHERE id = ${id}::uuid
    LIMIT 1
  `;
  const row = rows[0];
  if (!row?.audio_base64) {
    return NextResponse.json({ error: "Audio not found" }, { status: 404 });
  }

  return new Response(Buffer.from(String(row.audio_base64), "base64"), {
    headers: {
      "Content-Type": String(row.audio_type || "audio/webm"),
      "Cache-Control": "private, no-store",
    },
  });
}
