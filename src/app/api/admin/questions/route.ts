import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

function authorized(request: Request) {
  return Boolean(process.env.ADMIN_PIN && request.headers.get("x-admin-pin") === process.env.ADMIN_PIN);
}

function validQuestion(body: Record<string, unknown>) {
  return ["math", "thai", "english"].includes(String(body.subject)) &&
    ["choice", "speaking"].includes(String(body.type)) &&
    Boolean(String(body.question || "").trim()) &&
    (body.type === "speaking" || (Array.isArray(body.choices) && body.choices.length === 4));
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const questions = await sql`
    SELECT id, subject, position, type, question, hint, choices, answer,
      speaking_text AS "speakingText", pronunciation, recording_name AS "recordingName"
    FROM quiz_questions
    WHERE active = TRUE
    ORDER BY subject, position
  `;
  return NextResponse.json(questions);
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!validQuestion(body)) return NextResponse.json({ error: "Invalid question" }, { status: 400 });
  const positionRows = await sql`SELECT COALESCE(MAX(position), 0) + 1 AS position FROM quiz_questions WHERE subject = ${body.subject}`;
  const rows = await sql`
    INSERT INTO quiz_questions (subject, position, type, question, hint, choices, answer, speaking_text, pronunciation, recording_name)
    VALUES (${body.subject}, ${Number(positionRows[0].position)}, ${body.type}, ${body.question}, ${body.hint || ""},
      ${JSON.stringify(body.choices || [])}::jsonb, ${Number(body.answer || 0)}, ${body.speakingText || null},
      ${body.pronunciation || null}, ${body.recordingName || null})
    RETURNING id
  `;
  return NextResponse.json(rows[0]);
}

export async function PUT(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!validQuestion(body) || !body.id) return NextResponse.json({ error: "Invalid question" }, { status: 400 });
  const oldRows = await sql`SELECT subject, position FROM quiz_questions WHERE id = ${body.id}::uuid LIMIT 1`;
  if (!oldRows[0]) return NextResponse.json({ error: "Question not found" }, { status: 404 });
  let position = Number(oldRows[0].position);
  if (oldRows[0].subject !== body.subject) {
    const positionRows = await sql`SELECT COALESCE(MAX(position), 0) + 1 AS position FROM quiz_questions WHERE subject = ${body.subject}`;
    position = Number(positionRows[0].position);
  }
  await sql`
    UPDATE quiz_questions SET subject = ${body.subject}, position = ${position}, type = ${body.type}, question = ${body.question},
      hint = ${body.hint || ""}, choices = ${JSON.stringify(body.choices || [])}::jsonb, answer = ${Number(body.answer || 0)},
      speaking_text = ${body.speakingText || null}, pronunciation = ${body.pronunciation || null},
      recording_name = ${body.recordingName || null}, updated_at = NOW()
    WHERE id = ${body.id}::uuid
  `;
  return NextResponse.json({ saved: true });
}

export async function DELETE(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await sql`UPDATE quiz_questions SET active = FALSE, updated_at = NOW() WHERE id = ${id}::uuid`;
  return NextResponse.json({ deleted: true });
}
