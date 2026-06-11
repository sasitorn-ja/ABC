import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL CHECK (subject IN ('math', 'thai', 'english')),
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    answers JSONB NOT NULL,
    audio_data BYTEA,
    audio_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

await sql`CREATE INDEX IF NOT EXISTS quiz_results_created_at_idx ON quiz_results (created_at DESC)`;
await sql`ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS session_id UUID`;
await sql`ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL DEFAULT TRUE`;
await sql`ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS quiz_results_session_id_idx ON quiz_results (session_id) WHERE session_id IS NOT NULL`;

await sql`
  CREATE TABLE IF NOT EXISTS quiz_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id UUID NOT NULL REFERENCES quiz_results(id) ON DELETE CASCADE,
    question_index INTEGER NOT NULL,
    recording_name TEXT NOT NULL,
    audio_data BYTEA NOT NULL,
    audio_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;
await sql`CREATE INDEX IF NOT EXISTS quiz_recordings_result_id_idx ON quiz_recordings (result_id)`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS quiz_recordings_result_question_idx ON quiz_recordings (result_id, question_index)`;
console.log("Database ready");
