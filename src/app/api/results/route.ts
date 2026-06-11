import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const subject = String(form.get("subject") ?? "");
    const sessionId = String(form.get("sessionId") ?? "");
    const completed = String(form.get("completed") ?? "false") === "true";
    const answers = JSON.parse(String(form.get("answers") ?? "[]"));
    const score = Number(form.get("score") ?? 0);
    const total = Number(form.get("total") ?? 0);

    if (!["math", "thai", "english"].includes(subject) || !sessionId || !Array.isArray(answers) || total < 1) {
      return NextResponse.json({ error: "Invalid result" }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO quiz_results (session_id, subject, score, total, answers, completed, audio_data, audio_type)
      VALUES (${sessionId}::uuid, ${subject}, ${score}, ${total}, ${JSON.stringify(answers)}::jsonb, ${completed}, NULL, NULL)
      ON CONFLICT (session_id) WHERE session_id IS NOT NULL DO UPDATE SET
        score = EXCLUDED.score,
        total = EXCLUDED.total,
        answers = EXCLUDED.answers,
        completed = EXCLUDED.completed,
        updated_at = NOW()
      WHERE jsonb_array_length(EXCLUDED.answers) >= jsonb_array_length(quiz_results.answers)
      RETURNING id
    `;
    const resultId = rows[0]?.id
      ? String(rows[0].id)
      : String((await sql`SELECT id FROM quiz_results WHERE session_id = ${sessionId}::uuid LIMIT 1`)[0].id);

    for (const [key, value] of form.entries()) {
      if (!key.startsWith("audio-") || !(value instanceof File) || value.size === 0) continue;
      const questionIndex = Number(key.replace("audio-", ""));
      const recordingName = String(answers[questionIndex]?.question ?? `ข้อ ${questionIndex + 1}`);
      const audioBytes = Buffer.from(await value.arrayBuffer());
      await sql`
        INSERT INTO quiz_recordings (result_id, question_index, recording_name, audio_data, audio_type)
        VALUES (${resultId}::uuid, ${questionIndex}, ${recordingName}, ${audioBytes}, ${value.type || "audio/webm"})
        ON CONFLICT (result_id, question_index) DO UPDATE SET
          recording_name = EXCLUDED.recording_name,
          audio_data = EXCLUDED.audio_data,
          audio_type = EXCLUDED.audio_type
      `;
    }

    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("Unable to save quiz result", error);
    return NextResponse.json({ error: "Unable to save result" }, { status: 500 });
  }
}
