import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let cached: NeonQueryFunction<false, false> | null = null;

// สร้าง connection แบบ lazy — ตรวจ env var ตอนเรียกใช้จริง (ไม่ใช่ตอน import)
// เพื่อไม่ให้ next build ล้มเหลวตอน "Collecting page data" ถ้ายังไม่ตั้ง DATABASE_URL
function getSql(): NeonQueryFunction<false, false> {
  if (!cached) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is not configured");
    }
    cached = neon(databaseUrl);
  }
  return cached;
}

export const sql = ((strings: TemplateStringsArray, ...values: unknown[]) =>
  getSql()(strings, ...values)) as NeonQueryFunction<false, false>;
