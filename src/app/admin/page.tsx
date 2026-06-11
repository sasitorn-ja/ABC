"use client";

import { Activity, ArrowLeft, CalendarDays, Check, Headphones, LockKeyhole, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Answer = {
  question: string;
  answer: string;
  correctAnswer: string;
  correct: boolean;
};

type Result = {
  id: string;
  subject: "math" | "thai" | "english";
  score: number;
  total: number;
  answers: Answer[];
  recordings: { id: string; name: string; question_index: number }[];
  completed: boolean;
  created_at: string;
  updated_at: string;
};

const subjectNames = { math: "123", thai: "กข", english: "ABC" };

function AudioPlayer({ id, pin }: { id: string; pin: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    let objectUrl = "";
    fetch(`/api/admin/audio/${id}`, { headers: { "x-admin-pin": pin } })
      .then((response) => response.blob())
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      });
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id, pin]);

  return url ? <audio src={url} controls className="w-full" /> : <p>กำลังโหลดเสียง...</p>;
}

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isAuthenticated = results !== null;

  const loadResults = async () => {
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/results", { headers: { "x-admin-pin": pin } });
    if (!response.ok) {
      setError("รหัสไม่ถูกต้อง");
      setLoading(false);
      return;
    }
    setResults(await response.json());
    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated || !pin) return;
    const refresh = async () => {
      const response = await fetch("/api/admin/results", {
        headers: { "x-admin-pin": pin },
        cache: "no-store",
      });
      if (response.ok) {
        setResults(await response.json());
        setLastUpdated(new Date());
      }
    };
    const timer = window.setInterval(() => void refresh(), 2000);
    return () => window.clearInterval(timer);
  }, [isAuthenticated, pin]);

  if (results === null) {
    return (
      <main className="simple-home flex min-h-screen items-center justify-center px-5">
        <section className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-xl">
          <LockKeyhole className="mx-auto mb-4 text-[#8273e8]" size={48} />
          <h1 className="text-2xl font-black">ผู้ดูแล</h1>
          <input value={pin} onChange={(event) => setPin(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void loadResults()} type="password" inputMode="numeric" placeholder="รหัส" className="admin-input mt-6" />
          {error && <p className="mt-3 font-bold text-[#b94f34]">{error}</p>}
          <button onClick={loadResults} className="primary-button mt-5 w-full" disabled={!pin || loading}>{loading ? "กำลังเปิด..." : "เปิดดู"}</button>
          <Link href="/" className="mt-5 inline-flex items-center gap-2 font-bold text-[#7f8079]"><ArrowLeft size={18} /> กลับ</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f8f4] px-5 py-8">
      <section className="mx-auto max-w-5xl">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <p className="font-bold text-[#8273e8]">ผู้ดูแล</p>
            <h1 className="text-3xl font-black">คำตอบเรียลไทม์</h1>
            <p className="mt-2 flex items-center gap-2 text-xs font-bold text-[#35a27e]"><Activity size={15} /> ออนไลน์ • อัปเดตอัตโนมัติทุก 2 วินาที {lastUpdated && `• ${lastUpdated.toLocaleTimeString("th-TH")}`}</p>
          </div>
          <Link href="/" className="round-button"><ArrowLeft size={20} /></Link>
        </div>
        <div className="grid gap-5">
          {results.length === 0 && <div className="rounded-3xl bg-white p-8 text-center font-bold text-[#888a83]">ยังไม่มีคำตอบ</div>}
          {results.map((result) => (
            <article key={result.id} className="rounded-3xl bg-white p-5 shadow-sm md:p-7">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#eeeeE8] pb-4">
                <div className="flex items-center gap-3">
                  <strong className="rounded-xl bg-[#f1efff] px-3 py-2 text-[#6657cf]">{subjectNames[result.subject]}</strong>
                  <span className="font-black">{result.score}/{result.total}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${result.completed ? "bg-[#e9f8f1] text-[#19785b]" : "live-badge bg-[#fff4d8] text-[#b77a10]"}`}>{result.completed ? "เสร็จแล้ว" : `กำลังทำ ${result.answers.length}/${result.total}`}</span>
                </div>
                <span className="flex items-center gap-2 text-sm font-bold text-[#888a83]"><CalendarDays size={17} /> {new Date(result.updated_at).toLocaleString("th-TH")}</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {result.answers.map((answer, index) => (
                  <div key={`${result.id}-${index}`} className={`rounded-2xl p-4 ${answer.correct ? "bg-[#effbf7]" : "bg-[#fff2ee]"}`}>
                    <p className="mb-2 text-sm font-bold text-[#74766f]">{index + 1}. {answer.question}</p>
                    <p className="flex items-center gap-2 font-black">{answer.correct ? <Check size={18} className="text-[#35a27e]" /> : <X size={18} className="text-[#d8664a]" />} {answer.answer}</p>
                    {!answer.correct && <p className="mt-1 text-xs font-bold text-[#888a83]">เฉลย: {answer.correctAnswer}</p>}
                  </div>
                ))}
              </div>
              {result.recordings.length > 0 && <div className="mt-5 rounded-2xl bg-[#eef8fb] p-4">
                <p className="mb-3 flex items-center gap-2 font-black text-[#2a8299]"><Headphones size={20} /> เสียงที่อัด</p>
                <div className="grid gap-4 md:grid-cols-2">
                  {result.recordings.map((recording) => (
                    <div key={recording.id}><p className="mb-2 text-sm font-bold text-[#577985]">{recording.name}</p><AudioPlayer id={recording.id} pin={pin} /></div>
                  ))}
                </div>
              </div>}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
