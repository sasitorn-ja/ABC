import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const subject = String(form.get("subject") ?? "");
    const answers = JSON.parse(String(form.get("answers") ?? "[]"));
    const score = Number(form.get("score") ?? 0);
    const total = Number(form.get("total") ?? 0);

    if (!["math", "thai", "english"].includes(subject) || !Array.isArray(answers) || total < 1) {
      return NextResponse.json({ error: "Invalid result" }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO quiz_results (subject, score, total, answers, audio_data, audio_type)
      VALUES (${subject}, ${score}, ${total}, ${JSON.stringify(answers)}::jsonb, NULL, NULL)
      RETURNING id
    `;
    const resultId = String(rows[0].id);

    for (const [key, value] of form.entries()) {
      if (!key.startsWith("audio-") || !(value instanceof File) || value.size === 0) continue;
      const questionIndex = Number(key.replace("audio-", ""));
      const recordingName = String(answers[questionIndex]?.question ?? `ข้อ ${questionIndex + 1}`);
      const audioBytes = Buffer.from(await value.arrayBuffer());
      await sql`
        INSERT INTO quiz_recordings (result_id, question_index, recording_name, audio_data, audio_type)
        VALUES (${resultId}::uuid, ${questionIndex}, ${recordingName}, ${audioBytes}, ${value.type || "audio/webm"})
      `;
    }

    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("Unable to save quiz result", error);
    return NextResponse.json({ error: "Unable to save result" }, { status: 500 });
  }
}
