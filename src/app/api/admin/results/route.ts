import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const pin = request.headers.get("x-admin-pin");
  if (!process.env.ADMIN_PIN || pin !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await sql`
    SELECT r.id, r.subject, r.score, r.total, r.answers, r.created_at,
      COALESCE(
        json_agg(json_build_object('id', q.id, 'name', q.recording_name, 'question_index', q.question_index) ORDER BY q.question_index)
        FILTER (WHERE q.id IS NOT NULL), '[]'
      ) AS recordings
    FROM quiz_results r
    LEFT JOIN quiz_recordings q ON q.result_id = r.id
    GROUP BY r.id
    ORDER BY r.created_at DESC
    LIMIT 200
  `;

  return NextResponse.json(results);
}
