import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "เด็กเก่ง | แบบฝึกหัด ป.1-3",
  description: "เว็บแบบฝึกหัดแสนสนุกสำหรับนักเรียนชั้นประถมศึกษาปีที่ 1-3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${notoSansThai.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-noto-thai)]">{children}</body>
    </html>
  );
}
