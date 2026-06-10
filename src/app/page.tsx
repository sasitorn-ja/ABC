"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Download,
  Home,
  Mic,
  PlayCircle,
  Play,
  RotateCcw,
  Square,
  Star,
  Trophy,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Grade = 1 | 2 | 3;
type Subject = "math" | "thai" | "english";
type Screen = "home" | "quiz" | "result";

type Question = {
  question: string;
  hint: string;
  choices: string[];
  answer: number;
  type?: "choice" | "speaking";
  speakingText?: string;
  pronunciation?: string;
  recordingName?: string;
};

const subjects: Record<
  Subject,
  { name: string; description: string; icon: string; color: string; soft: string }
> = {
  math: {
    name: "คณิตศาสตร์",
    description: "ฝึกคิดเลข สนุกกับตัวเลข",
    icon: "123",
    color: "#ff7757",
    soft: "#fff1ec",
  },
  thai: {
    name: "ภาษาไทย",
    description: "อ่านคล่อง เขียนเก่ง",
    icon: "กข",
    color: "#8273e8",
    soft: "#f1efff",
  },
  english: {
    name: "ภาษาอังกฤษ",
    description: "สนุกกับคำศัพท์ง่าย ๆ",
    icon: "ABC",
    color: "#2a9bb5",
    soft: "#e8f7fa",
  },
};

const questionBank: Record<Subject, Record<Grade, Question[]>> = {
  math: {
    1: [
      { question: "5 + 3 เท่ากับเท่าไร?", hint: "ลองนับต่อจากเลข 5 อีก 3 ครั้ง", choices: ["7", "8", "9", "10"], answer: 1 },
      { question: "จำนวนใดมีค่ามากที่สุด?", hint: "มองหาตัวเลขที่อยู่ไกลที่สุด", choices: ["4", "9", "6", "2"], answer: 1 },
      { question: "10 - 4 เท่ากับเท่าไร?", hint: "มีสิบชิ้น หยิบออกสี่ชิ้น", choices: ["5", "6", "7", "8"], answer: 1 },
      { question: "รูปสามเหลี่ยมมีกี่ด้าน?", hint: "ลองวาดแล้วนับด้านดูนะ", choices: ["2 ด้าน", "3 ด้าน", "4 ด้าน", "5 ด้าน"], answer: 1 },
      { question: "เลขใดอยู่ถัดจาก 14?", hint: "นับต่ออีกหนึ่ง", choices: ["13", "15", "16", "24"], answer: 1 },
    ],
    2: [
      { question: "24 + 15 เท่ากับเท่าไร?", hint: "บวกหลักหน่วยก่อน แล้วจึงบวกหลักสิบ", choices: ["39", "38", "49", "35"], answer: 0 },
      { question: "50 - 18 เท่ากับเท่าไร?", hint: "ลบ 20 ก่อน แล้วบวกคืน 2", choices: ["22", "28", "32", "38"], answer: 2 },
      { question: "3 กลุ่ม กลุ่มละ 4 ชิ้น มีทั้งหมดกี่ชิ้น?", hint: "ลองบวก 4 ซ้ำกัน 3 ครั้ง", choices: ["7", "10", "12", "14"], answer: 2 },
      { question: "ครึ่งหนึ่งของ 20 คือเท่าไร?", hint: "แบ่ง 20 เป็นสองกลุ่มเท่า ๆ กัน", choices: ["5", "10", "15", "20"], answer: 1 },
      { question: "ข้อใดเรียงจากน้อยไปมากถูกต้อง?", hint: "เริ่มจากตัวเลขที่มีค่าน้อยที่สุด", choices: ["8, 5, 2", "2, 5, 8", "5, 2, 8", "2, 8, 5"], answer: 1 },
    ],
    3: [
      { question: "125 + 248 เท่ากับเท่าไร?", hint: "บวกทีละหลักจากขวาไปซ้าย", choices: ["363", "373", "383", "473"], answer: 1 },
      { question: "7 × 8 เท่ากับเท่าไร?", hint: "ใช้แม่ 7 หรือแม่ 8 ที่เรารู้จัก", choices: ["48", "54", "56", "64"], answer: 2 },
      { question: "72 ÷ 9 เท่ากับเท่าไร?", hint: "เก้าคูณอะไรได้เจ็ดสิบสอง", choices: ["6", "7", "8", "9"], answer: 2 },
      { question: "หนึ่งในสี่ของ 20 คือเท่าไร?", hint: "แบ่ง 20 เป็น 4 กลุ่มเท่า ๆ กัน", choices: ["4", "5", "10", "15"], answer: 1 },
      { question: "1 เมตร เท่ากับกี่เซนติเมตร?", hint: "หนึ่งไม้บรรทัดยาว 30 เซนติเมตร", choices: ["10", "50", "100", "1,000"], answer: 2 },
    ],
  },
  thai: {
    1: [
      { question: "คำใดขึ้นต้นด้วยพยัญชนะ ก?", hint: "ลองออกเสียงคำทีละคำ", choices: ["ปลา", "ไก่", "แมว", "เรือ"], answer: 1 },
      { question: "ข้อใดเป็นสระ?", hint: "สระช่วยให้พยัญชนะออกเสียงได้", choices: ["ก", "ข", "า", "ง"], answer: 2 },
      { question: "คำใดมี 2 พยางค์?", hint: "ลองปรบมือตามจังหวะคำ", choices: ["บ้าน", "โรงเรียน", "นก", "ดาว"], answer: 1 },
      { question: "คำใดมีความหมายตรงข้ามกับ 'ร้อน'?", hint: "นึกถึงน้ำแข็ง", choices: ["อุ่น", "เย็น", "แห้ง", "สว่าง"], answer: 1 },
      { question: "ประโยคใดถูกต้อง?", hint: "ประโยคที่ดีต้องเล่าเรื่องได้ครบ", choices: ["แมว กิน ปลา", "ปลา แมว กิน", "กิน ปลา แมว", "แมว ปลา กิน"], answer: 0 },
    ],
    2: [
      { question: "คำใดเป็นคำนาม?", hint: "คำนามใช้เรียกชื่อคน สัตว์ สิ่งของ", choices: ["วิ่ง", "โต๊ะ", "เร็ว", "สวย"], answer: 1 },
      { question: "คำใดเป็นคำกริยา?", hint: "คำกริยาบอกการกระทำ", choices: ["น้อง", "หนังสือ", "อ่าน", "ใหญ่"], answer: 2 },
      { question: "ข้อใดสะกดถูกต้อง?", hint: "ลองอ่านออกเสียงช้า ๆ", choices: ["กะเพรา", "กระเพา", "กะเพา", "กระเพรา"], answer: 0 },
      { question: "คำใดคล้องจองกับ 'ดาว'?", hint: "ฟังเสียงท้ายของคำ", choices: ["เดือน", "ขาว", "ฟ้า", "ดิน"], answer: 1 },
      { question: "คำว่า 'คุณครู' ใช้เรียกใคร?", hint: "คนที่ช่วยสอนเราในโรงเรียน", choices: ["ผู้เรียน", "ผู้สอน", "ผู้ขาย", "ผู้ซื้อ"], answer: 1 },
    ],
    3: [
      { question: "ข้อใดเป็นประโยคคำถาม?", hint: "ประโยคคำถามต้องการคำตอบ", choices: ["ฉันชอบอ่านหนังสือ", "วันนี้อากาศดี", "เธอชื่ออะไร", "อย่าวิ่งในห้อง"], answer: 2 },
      { question: "คำใดเป็นคำวิเศษณ์?", hint: "คำวิเศษณ์ช่วยขยายให้ชัดเจนขึ้น", choices: ["แมว", "กิน", "เร็ว", "อาหาร"], answer: 2 },
      { question: "สำนวน 'น้ำขึ้นให้รีบตัก' สอนเรื่องใด?", hint: "เมื่อมีโอกาสดี เราควรทำอย่างไร", choices: ["ให้ประหยัดน้ำ", "ให้รีบคว้าโอกาส", "ให้ตื่นเช้า", "ให้ช่วยกันทำงาน"], answer: 1 },
      { question: "ข้อใดใช้ไม้ยมกได้ถูกต้อง?", hint: "ไม้ยมกใช้แทนคำที่กล่าวซ้ำ", choices: ["เด็กๆ", "กินๆข้าว", "บ้านๆฉัน", "ไปๆมา"], answer: 0 },
      { question: "คำใดมีความหมายเหมือนกับ 'งดงาม'?", hint: "ใช้ชมสิ่งที่มองแล้วชอบ", choices: ["รวดเร็ว", "สวยงาม", "แข็งแรง", "เงียบสงบ"], answer: 1 },
    ],
  },
  english: {
    1: [
      { question: "พูด A ถึง Z", hint: "กดไมค์ แล้วพูด A B C ไปจนถึง Z", choices: [], answer: 0, type: "speaking", speakingText: "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z", recordingName: "ท่อง A-Z" },
      { question: "พูดชื่อสี", hint: "กดไมค์ แล้วพูดชื่อสีตามลำดับ", choices: [], answer: 0, type: "speaking", speakingText: "RED • BLUE • GREEN • YELLOW • PINK • ORANGE • PURPLE", pronunciation: "เรด • บลู • กรีน • เยลโล • พิงก์ • ออเรนจ์ • เพอร์เพิล", recordingName: "ท่องสี" },
      { question: "ข้อใดคือสีแดง?", hint: "สีของแอปเปิลบางผล", choices: ["blue", "green", "red", "yellow"], answer: 2 },
      { question: "คำว่า 'one' คือตัวเลขใด?", hint: "เป็นจำนวนนับตัวแรก", choices: ["1", "2", "3", "4"], answer: 0 },
      { question: "เราใช้คำใดทักทายกัน?", hint: "เป็นคำทักทายภาษาอังกฤษที่ได้ยินบ่อย", choices: ["Goodbye", "Hello", "Sorry", "Thank you"], answer: 1 },
    ],
    2: [
      { question: "คำว่า 'school' แปลว่าอะไร?", hint: "สถานที่ที่เราไปเรียนหนังสือ", choices: ["โรงเรียน", "โรงพยาบาล", "ตลาด", "บ้าน"], answer: 0 },
      { question: "ข้อใดเป็นชื่อผลไม้?", hint: "เป็นผลไม้สีเหลืองและมีเปลือก", choices: ["table", "banana", "pencil", "shirt"], answer: 1 },
      { question: "ประโยคใดแปลว่า 'ฉันชอบแมว'?", hint: "I แปลว่า ฉัน และ like แปลว่า ชอบ", choices: ["I see a cat.", "I have a cat.", "I like cats.", "I am a cat."], answer: 2 },
      { question: "คำใดมีความหมายตรงข้ามกับ 'big'?", hint: "big แปลว่า ใหญ่", choices: ["small", "tall", "long", "fast"], answer: 0 },
      { question: "เติมคำ: This ___ a book.", hint: "ประธาน This ใช้กับคำกริยารูปเอกพจน์", choices: ["am", "is", "are", "be"], answer: 1 },
    ],
    3: [
      { question: "เลือกคำที่ถูกต้อง: She ___ to school.", hint: "ประธาน She ใช้กริยาที่เติม s", choices: ["go", "goes", "going", "gone"], answer: 1 },
      { question: "คำว่า 'beautiful' แปลว่าอะไร?", hint: "เป็นคำที่ใช้ชมสิ่งที่งดงาม", choices: ["รวดเร็ว", "สวยงาม", "แข็งแรง", "หิว"], answer: 1 },
      { question: "ข้อใดเป็นประโยคคำถาม?", hint: "ประโยคคำถามมักขึ้นต้นด้วยคำถามและมีเครื่องหมาย ?", choices: ["I am happy.", "Open the door.", "Where are you?", "She likes milk."], answer: 2 },
      { question: "เติมคำ: There are three ___ on the table.", hint: "มีจำนวนสามชิ้น จึงต้องใช้คำนามพหูพจน์", choices: ["book", "books", "a book", "booking"], answer: 1 },
      { question: "คำใดเป็นคำกริยา?", hint: "คำกริยาแสดงการกระทำ", choices: ["happy", "teacher", "quickly", "swim"], answer: 3 },
    ],
  },
};

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>("home");
  const [subject, setSubject] = useState<Subject>("math");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Record<number, { url: string; blob: Blob }>>({});
  const [micError, setMicError] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [adminTaps, setAdminTaps] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const currentRecording = recordings[questionIndex];

  const questions = useMemo<Question[]>(
    () => ([1, 2, 3] as Grade[]).flatMap((level) => questionBank[subject][level].slice(0, 2)),
    [subject],
  );
  const score = answers.reduce<number>(
    (total, answer, index) => total + (answer === questions[index]?.answer ? 1 : 0),
    0,
  );

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const resetRecording = (clearAll = false) => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
    setIsRecording(false);
    setRecordings((current) => {
      if (clearAll) return {};
      const next = { ...current };
      delete next[questionIndex];
      return next;
    });
    setMicError("");
  };

  const startRecording = async () => {
    try {
      setMicError("");
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        setMicError("อุปกรณ์นี้ยังอัดเสียงไม่ได้ กรุณาเปิดผ่าน Chrome หรือ Safari");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) =>
        MediaRecorder.isTypeSupported(type),
      );
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        if (chunks.length === 0) {
          setMicError("ไม่ได้ยินเสียง ลองพูดใหม่อีกครั้งนะ");
          return;
        }
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordings((current) => ({ ...current, [questionIndex]: { blob, url } }));
      };
      recorder.start();
      setIsRecording(true);
    } catch {
      setMicError("กรุณาอนุญาตให้ใช้ไมโครโฟน แล้วลองอีกครั้ง");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setIsRecording(false);
  };

  const startQuiz = (nextSubject: Subject = subject) => {
    setSubject(nextSubject);
    setQuestionIndex(0);
    setSelected(null);
    setAnswers([]);
    setSaveStatus("idle");
    resetRecording(true);
    setScreen("quiz");
  };

  const nextQuestion = () => {
    const isSpeakingQuestion = questions[questionIndex].type === "speaking";
    if (selected === null && !isSpeakingQuestion) return;
    if (isSpeakingQuestion && !currentRecording) return;
    const nextAnswers = [...answers, isSpeakingQuestion ? 0 : selected];
    setAnswers(nextAnswers);
    if (questionIndex === questions.length - 1) {
      void saveResult(nextAnswers);
      setScreen("result");
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelected(null);
  };

  const saveResult = async (finalAnswers: (number | null)[]) => {
    setSaveStatus("saving");
    const answerDetails = finalAnswers.map((answer, index) => {
      const question = questions[index];
      const speaking = question.type === "speaking";
      return {
        question: question.question,
        answer: speaking ? `อัดเสียง ${question.recordingName}` : question.choices[answer ?? -1] ?? "ไม่ได้ตอบ",
        correctAnswer: speaking ? `อัดเสียง ${question.recordingName}` : question.choices[question.answer],
        correct: speaking || answer === question.answer,
      };
    });
    const finalScore = finalAnswers.reduce<number>(
      (total, answer, index) => total + (answer === questions[index].answer ? 1 : 0),
      0,
    );
    const form = new FormData();
    form.append("subject", subject);
    form.append("score", String(finalScore));
    form.append("total", String(questions.length));
    form.append("answers", JSON.stringify(answerDetails));
    Object.entries(recordings).forEach(([index, recording]) => {
      form.append(`audio-${index}`, recording.blob, `recording-${index}.webm`);
    });

    try {
      const response = await fetch("/api/results", { method: "POST", body: form });
      if (!response.ok) throw new Error("Save failed");
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  };

  const goHome = () => {
    setScreen("home");
    setSelected(null);
    resetRecording(true);
  };

  if (screen === "quiz") {
    const current = questions[questionIndex];
    const isSpeaking = current.type === "speaking";
    const isCorrect = selected === current.answer;
    return (
      <main className="min-h-screen bg-[#f8f8f4]">
        <header className="border-b border-[#e8e7df] bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <button className="round-button" onClick={goHome} aria-label="กลับหน้าหลัก"><ArrowLeft size={22} /></button>
            <div className="text-center">
              <p className="text-2xl font-black" style={{ color: subjects[subject].color }}>{subjects[subject].icon}</p>
            </div>
            <div className="flex h-10 min-w-16 items-center justify-center gap-1 rounded-full bg-[#fff4d8] px-3 font-extrabold text-[#d58a13]">
              <Star size={17} fill="currentColor" /> {score}
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-3xl px-5 py-7 md:py-10">
          <div className="mb-8 flex items-center gap-4">
            <span className="shrink-0 text-sm font-bold text-[#75766f]">ข้อ {questionIndex + 1} / {questions.length}</span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#e9e9e2]">
              <div className="h-full rounded-full bg-[#ffc94a] transition-all duration-500" style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} />
            </div>
          </div>

          <div className="question-card">
            <h1 className="mb-8 text-2xl font-extrabold leading-relaxed text-[#252827] md:text-3xl">{current.question}</h1>
            {isSpeaking ? (
              <div className="text-center">
                <div className="alphabet-strip mb-4">{current.speakingText}</div>
                {current.pronunciation && <div className="pronunciation-strip mb-8">{current.pronunciation}</div>}
                {!currentRecording ? (
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`record-button ${isRecording ? "recording" : ""}`}
                  >
                    {isRecording ? <Square size={38} fill="currentColor" /> : <Mic size={48} />}
                    <span>{isRecording ? "หยุด" : "พูด"}</span>
                  </button>
                ) : (
                  <div className="mx-auto max-w-sm rounded-3xl bg-[#effbf7] p-5">
                    <div className="mb-4 flex items-center justify-center gap-2 text-xl font-black text-[#19785b]"><Check size={25} /> บันทึกแล้ว</div>
                    <audio src={currentRecording.url} controls className="w-full" />
                    <button onClick={() => resetRecording()} className="mt-4 inline-flex items-center gap-2 font-extrabold text-[#68736f]"><RotateCcw size={18} /> พูดใหม่</button>
                  </div>
                )}
                {micError && <p className="mt-5 font-bold text-[#b94f34]">{micError}</p>}
                {!currentRecording && !isRecording && <p className="mt-5 font-bold text-[#8b8d86]"><PlayCircle className="mr-1 inline" size={19} /> กดไมค์ แล้วพูดตาม</p>}
              </div>
            ) : <div className="grid gap-3 sm:grid-cols-2">
              {current.choices.map((choice, index) => {
                const chosen = selected === index;
                const revealCorrect = selected !== null && index === current.answer;
                const revealWrong = chosen && !isCorrect;
                return (
                  <button
                    key={choice}
                    onClick={() => selected === null && setSelected(index)}
                    className={`choice ${revealCorrect ? "choice-correct" : ""} ${revealWrong ? "choice-wrong" : ""} ${chosen && selected !== null ? "choice-chosen" : ""}`}
                  >
                    <span className="choice-letter">{String.fromCharCode(65 + index)}</span>
                    <span>{choice}</span>
                    {revealCorrect && <Check className="ml-auto" size={20} />}
                    {revealWrong && <X className="ml-auto" size={20} />}
                  </button>
                );
              })}
            </div>}

            {!isSpeaking && selected !== null && (
              <div className={`mt-6 rounded-2xl p-4 ${isCorrect ? "bg-[#e9f8f1] text-[#19785b]" : "bg-[#fff0ec] text-[#b94f34]"}`}>
                <p className="font-extrabold">{isCorrect ? "เก่งมาก คำตอบถูกต้อง!" : "เกือบถูกแล้ว ลองจำคำตอบนี้ไว้นะ"}</p>
                <p className="mt-1 text-sm font-medium opacity-80">{current.hint}</p>
              </div>
            )}
          </div>

          <button disabled={isSpeaking ? !currentRecording : selected === null} onClick={nextQuestion} className="primary-button mt-6 ml-auto">
            {questionIndex === questions.length - 1 ? "ดูผลคะแนน" : "ข้อต่อไป"} <ArrowRight size={20} />
          </button>
        </section>
      </main>
    );
  }

  if (screen === "result") {
    const percent = Math.round((score / questions.length) * 100);
    return (
      <main className="result-bg flex min-h-screen items-center justify-center px-5 py-10">
        <section className="w-full max-w-xl rounded-[2rem] bg-white p-7 text-center shadow-[0_24px_70px_rgba(57,66,61,.14)] md:p-12">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-[#fff2be] text-[#e9a719]">
            <Trophy size={52} strokeWidth={2.2} />
          </div>
          <p className="mb-2 text-sm font-extrabold tracking-[.18em] text-[#e99150]">ทำแบบฝึกหัดสำเร็จ</p>
          <h1 className="text-3xl font-black text-[#252827] md:text-4xl">{percent >= 80 ? "ยอดเยี่ยมมาก!" : percent >= 60 ? "ทำได้ดีมาก!" : "พยายามได้ดี!"}</h1>
          <p className="mt-3 font-medium text-[#7f8079]">{subjects[subject].icon}</p>

          <div className="my-8 grid grid-cols-3 gap-3">
            <div className="score-box"><strong>{score}/{questions.length}</strong><span>ตอบถูก</span></div>
            <div className="score-box"><strong>{percent}%</strong><span>คะแนน</span></div>
            <div className="score-box"><strong>+{score * 10}</strong><span>ดาวที่ได้</span></div>
          </div>

          {Object.keys(recordings).length > 0 && subject === "english" && (
            <div className="mb-7 rounded-2xl bg-[#effbf7] p-5 text-left">
              <p className="mb-3 text-center font-black text-[#19785b]">เสียงของฉัน</p>
              {Object.entries(recordings).map(([index, recording]) => (
                <div key={index} className="mb-4 last:mb-0">
                  <p className="mb-2 font-bold text-[#55756b]">{questions[Number(index)].recordingName}</p>
                  <audio src={recording.url} controls className="w-full" />
                  <a href={recording.url} download={`recording-${index}.webm`} className="download-button mt-2">
                    <Download size={19} /> ดาวน์โหลดเสียง
                  </a>
                </div>
              ))}
            </div>
          )}

          <p className={`mb-5 text-sm font-bold ${saveStatus === "error" ? "text-[#b94f34]" : "text-[#7f8079]"}`}>
            {saveStatus === "saving" && "กำลังบันทึก..."}
            {saveStatus === "saved" && "บันทึกเรียบร้อย"}
            {saveStatus === "error" && "บันทึกไม่สำเร็จ"}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={() => startQuiz()} className="secondary-button flex-1"><RotateCcw size={19} /> ลองอีกครั้ง</button>
            <button onClick={goHome} className="primary-button flex-1"><Home size={19} /> กลับหน้าหลัก</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="simple-home flex min-h-screen items-center justify-center px-5 py-8">
      <section className="w-full max-w-4xl text-center">
        <button
          onClick={() => {
            const nextTaps = adminTaps + 1;
            setAdminTaps(nextTaps);
            if (nextTaps >= 7) window.location.href = "/admin";
          }}
          className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white text-[#ed9a5a] shadow-[0_16px_40px_rgba(60,105,90,.12)]"
          aria-label="หนังสือ"
        >
          <BookOpen size={66} strokeWidth={1.8} />
        </button>
        <h1 className="text-4xl font-black text-[#29332f] md:text-5xl">เลือกวิชา</h1>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {(Object.keys(subjects) as Subject[]).map((item, index) => (
            <button
              key={item}
              onClick={() => startQuiz(item)}
              className={`grade-card subject-choice grade-card-${index + 1}`}
              aria-label={`เริ่มข้อสอบ ${subjects[item].name}`}
            >
              <strong>{subjects[item].icon}</strong>
              <span className="grade-play"><Play size={26} fill="currentColor" /></span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
