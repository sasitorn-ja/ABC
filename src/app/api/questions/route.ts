import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const questions = await sql`
    SELECT id, subject, position, type, question, hint, choices, answer,
      speaking_text AS "speakingText", pronunciation, recording_name AS "recordingName"
    FROM quiz_questions
    WHERE active = TRUE
    ORDER BY subject, position
  `;
  return NextResponse.json(questions, { headers: { "Cache-Control": "no-store" } });
}
