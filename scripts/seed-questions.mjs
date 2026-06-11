import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const choice = (subject, question, hint, choices, answer) => ({ subject, type: "choice", question, hint, choices, answer });
const speaking = (subject, question, hint, speakingText, recordingName, pronunciation = null) => ({ subject, type: "speaking", question, hint, choices: [], answer: 0, speakingText, recordingName, pronunciation });

const questions = [
  choice("math", "2 + 3 เท่ากับเท่าไร?", "ลองนับต่อจากเลข 2 อีก 3 ครั้ง", ["4", "5", "6", "7"], 1),
  choice("math", "7 - 2 เท่ากับเท่าไร?", "มีเจ็ดชิ้น หยิบออกสองชิ้น", ["3", "4", "5", "6"], 2),
  choice("math", "6 + 7 เท่ากับเท่าไร?", "ลองนับต่อจากเลข 7 อีก 6 ครั้ง", ["11", "12", "13", "14"], 2),
  choice("math", "15 - 8 เท่ากับเท่าไร?", "นับถอยหลังจาก 15 อีก 8 ครั้ง", ["6", "7", "8", "9"], 1),
  choice("math", "24 + 15 เท่ากับเท่าไร?", "บวกหลักหน่วยก่อน แล้วจึงบวกหลักสิบ", ["39", "38", "49", "35"], 0),
  choice("math", "50 - 18 เท่ากับเท่าไร?", "ลบ 20 ก่อน แล้วบวกคืน 2", ["22", "28", "32", "38"], 2),
  choice("math", "67 + 28 เท่ากับเท่าไร?", "บวกหลักหน่วยก่อน แล้วทดไปหลักสิบ", ["85", "93", "95", "105"], 2),
  choice("math", "125 + 248 เท่ากับเท่าไร?", "บวกทีละหลักจากขวาไปซ้าย", ["363", "373", "383", "473"], 1),
  choice("math", "500 - 275 เท่ากับเท่าไร?", "ลบทีละหลักจากขวาไปซ้าย", ["215", "225", "235", "325"], 1),
  choice("math", "468 + 357 เท่ากับเท่าไร?", "บวกทีละหลักและอย่าลืมตัวทด", ["715", "815", "825", "835"], 2),
  speaking("thai", "อ่านคำง่าย ๆ", "กดไมค์ แล้วอ่านทีละคำ", "กา • ตา • มา • ยา • ปลา", "อ่านคำง่าย ๆ"),
  speaking("thai", "อ่านชื่อสัตว์", "กดไมค์ แล้วอ่านทีละคำ", "แมว • ไก่ • ปลา • ช้าง • ม้า", "อ่านชื่อสัตว์"),
  speaking("thai", "อ่านคำสองพยางค์", "กดไมค์ แล้วอ่านทีละคำ", "มะนาว • ทะเล • ภูเขา • กระเป๋า", "อ่านคำสองพยางค์"),
  speaking("thai", "อ่านประโยคสั้น", "กดไมค์ แล้วอ่านช้า ๆ", "แม่ ทำ อาหาร", "อ่านประโยค แม่ทำอาหาร"),
  speaking("thai", "อ่านประโยค", "กดไมค์ แล้วอ่านให้ชัดเจน", "ฉัน ชอบ อ่าน หนังสือ", "อ่านประโยค ฉันชอบอ่านหนังสือ"),
  speaking("thai", "อ่านเรื่องสั้น", "กดไมค์ แล้วอ่านให้จบ", "วันนี้ อากาศ ดี น้อง ไป เล่น ที่ สนาม", "อ่านเรื่องสั้น"),
  speaking("english", "พูด A ถึง Z", "กดไมค์ แล้วพูด A B C ไปจนถึง Z", "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z", "ท่อง A-Z"),
  speaking("english", "พูดชื่อสี", "กดไมค์ แล้วพูดชื่อสีตามลำดับ", "RED • BLUE • GREEN • YELLOW • PINK • ORANGE • PURPLE", "ท่องสี", "เรด • บลู • กรีน • เยลโล • พิงก์ • ออเรนจ์ • เพอร์เพิล"),
  choice("english", "คำว่า 'school' แปลว่าอะไร?", "สถานที่ที่เราไปเรียนหนังสือ", ["โรงเรียน", "โรงพยาบาล", "ตลาด", "บ้าน"], 0),
  choice("english", "ข้อใดเป็นชื่อผลไม้?", "เป็นผลไม้สีเหลืองและมีเปลือก", ["table", "banana", "pencil", "shirt"], 1),
  choice("english", "เลือกคำที่ถูกต้อง: She ___ to school.", "ประธาน She ใช้กริยาที่เติม s", ["go", "goes", "going", "gone"], 1),
  choice("english", "คำว่า 'beautiful' แปลว่าอะไร?", "เป็นคำที่ใช้ชมสิ่งที่งดงาม", ["รวดเร็ว", "สวยงาม", "แข็งแรง", "หิว"], 1),
];

const count = await sql`SELECT COUNT(*)::int AS count FROM quiz_questions`;
if (count[0].count > 0) {
  console.log("Questions already exist");
  process.exit(0);
}

const positions = { math: 0, thai: 0, english: 0 };
for (const item of questions) {
  positions[item.subject] += 1;
  await sql`
    INSERT INTO quiz_questions (subject, position, type, question, hint, choices, answer, speaking_text, pronunciation, recording_name)
    VALUES (${item.subject}, ${positions[item.subject]}, ${item.type}, ${item.question}, ${item.hint},
      ${JSON.stringify(item.choices)}::jsonb, ${item.answer}, ${item.speakingText || null}, ${item.pronunciation || null}, ${item.recordingName || null})
  `;
}
console.log(`Seeded ${questions.length} questions`);
