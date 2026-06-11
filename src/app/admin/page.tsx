"use client";

import { Activity, ArrowLeft, CalendarDays, Check, Headphones, ListChecks, LockKeyhole, Pencil, Plus, Trash2, X } from "lucide-react";
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

type Subject = "math" | "thai" | "english";
type Question = {
  id: string;
  subject: Subject;
  position: number;
  type: "choice" | "speaking";
  question: string;
  hint: string;
  choices: string[];
  answer: number;
  speakingText?: string;
  pronunciation?: string;
  recordingName?: string;
};

type QuestionDraft = Omit<Question, "id" | "position"> & { id?: string };
const emptyDraft: QuestionDraft = { subject: "math", type: "choice", question: "", hint: "", choices: ["", "", "", ""], answer: 0 };
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tab, setTab] = useState<"results" | "questions">("results");
  const [draft, setDraft] = useState<QuestionDraft>(emptyDraft);
  const [questionMessage, setQuestionMessage] = useState("");
  const isAuthenticated = results !== null;

  const loadQuestions = async () => {
    const response = await fetch("/api/admin/questions", { headers: { "x-admin-pin": pin }, cache: "no-store" });
    if (response.ok) setQuestions(await response.json());
  };

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
    await loadQuestions();
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

  const saveQuestion = async () => {
    setQuestionMessage("กำลังบันทึก...");
    const response = await fetch("/api/admin/questions", {
      method: draft.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify(draft),
    });
    if (!response.ok) {
      setQuestionMessage("บันทึกไม่สำเร็จ");
      return;
    }
    setQuestionMessage("บันทึกแล้ว");
    setDraft(emptyDraft);
    await loadQuestions();
  };

  const deleteQuestion = async (id: string) => {
    if (!window.confirm("ลบข้อนี้ใช่ไหม?")) return;
    await fetch(`/api/admin/questions?id=${id}`, { method: "DELETE", headers: { "x-admin-pin": pin } });
    await loadQuestions();
  };

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
        <div className="mb-7 flex gap-3">
          <button onClick={() => setTab("results")} className={`admin-tab ${tab === "results" ? "admin-tab-active" : ""}`}><Activity size={18} /> คำตอบเรียลไทม์</button>
          <button onClick={() => setTab("questions")} className={`admin-tab ${tab === "questions" ? "admin-tab-active" : ""}`}><ListChecks size={18} /> จัดการข้อสอบ</button>
        </div>

        {tab === "questions" ? (
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <section className="h-fit rounded-3xl bg-white p-5 shadow-sm">
              <h2 className="mb-5 flex items-center gap-2 text-xl font-black"><Plus size={22} /> {draft.id ? "แก้ไขข้อสอบ" : "เพิ่มข้อสอบ"}</h2>
              <label className="admin-label">วิชา<select className="admin-field" value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value as Subject })}><option value="math">คณิตศาสตร์</option><option value="thai">ภาษาไทย</option><option value="english">ภาษาอังกฤษ</option></select></label>
              <label className="admin-label">ประเภท<select className="admin-field" value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as "choice" | "speaking" })}><option value="choice">มีตัวเลือก</option><option value="speaking">อัดเสียง</option></select></label>
              <label className="admin-label">คำถาม<input className="admin-field" value={draft.question} onChange={(event) => setDraft({ ...draft, question: event.target.value })} /></label>
              <label className="admin-label">คำแนะนำ<input className="admin-field" value={draft.hint} onChange={(event) => setDraft({ ...draft, hint: event.target.value })} /></label>
              {draft.type === "choice" ? (
                <>
                  <p className="admin-label">ตัวเลือกและคำตอบที่ถูก</p>
                  {draft.choices.map((choice, index) => (
                    <div key={index} className="mb-2 flex items-center gap-2">
                      <input type="radio" name="correct" checked={draft.answer === index} onChange={() => setDraft({ ...draft, answer: index })} />
                      <input className="admin-field !mb-0" value={choice} onChange={(event) => {
                        const choices = [...draft.choices];
                        choices[index] = event.target.value;
                        setDraft({ ...draft, choices });
                      }} placeholder={`ตัวเลือก ${index + 1}`} />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <label className="admin-label">ข้อความสำหรับอ่าน<textarea className="admin-field min-h-24" value={draft.speakingText || ""} onChange={(event) => setDraft({ ...draft, speakingText: event.target.value })} /></label>
                  <label className="admin-label">คำอ่านเพิ่มเติม<input className="admin-field" value={draft.pronunciation || ""} onChange={(event) => setDraft({ ...draft, pronunciation: event.target.value })} /></label>
                  <label className="admin-label">ชื่อเสียงที่บันทึก<input className="admin-field" value={draft.recordingName || ""} onChange={(event) => setDraft({ ...draft, recordingName: event.target.value })} /></label>
                </>
              )}
              <button onClick={saveQuestion} disabled={!draft.question || (draft.type === "choice" && draft.choices.some((choice) => !choice))} className="primary-button mt-5 w-full">{draft.id ? "บันทึกการแก้ไข" : "เพิ่มข้อสอบ"}</button>
              {draft.id && <button onClick={() => setDraft(emptyDraft)} className="secondary-button mt-3 w-full">ยกเลิก</button>}
              {questionMessage && <p className="mt-3 text-center text-sm font-bold text-[#68736f]">{questionMessage}</p>}
            </section>
            <div className="grid gap-4">
              {questions.map((question) => (
                <article key={question.id} className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div><span className="mb-2 inline-block rounded-lg bg-[#f1efff] px-2 py-1 text-xs font-black text-[#6657cf]">{subjectNames[question.subject]} • ข้อ {question.position} • {question.type === "speaking" ? "อัดเสียง" : "ตัวเลือก"}</span><h3 className="font-black">{question.question}</h3><p className="mt-1 text-sm font-bold text-[#888a83]">{question.type === "speaking" ? question.speakingText : question.choices.join(" • ")}</p></div>
                    <div className="flex gap-2"><button onClick={() => { setDraft({ ...question }); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="round-button"><Pencil size={17} /></button><button onClick={() => deleteQuestion(question.id)} className="round-button !text-[#d8664a]"><Trash2 size={17} /></button></div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : <div className="grid gap-5">
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
        </div>}
      </section>
    </main>
  );
}
