import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Horizon Auto PC | Spin Your PC. Find Your Build.",
  description:
    "สุ่มสเปกคอมที่เหมาะกับงบและสไตล์การใช้งานของคุณ ตรวจสอบความเข้ากันได้ คำนวณความคุ้มค่า และลุ้นรับ PC Luck พร้อม Rarity System",
  keywords: [
    "สุ่มสเปกคอม",
    "จัดสเปกคอม",
    "Auto PC Builder",
    "PC Randomizer",
    "Horizon Auto PC",
    "Horizon PC Builder",
    "จัดคอมเล่นเกม",
  ],
  authors: [{ name: "Horizon Team" }],
  openGraph: {
    title: "Horizon Auto PC | Spin Your PC. Find Your Build.",
    description:
      "สุ่มสเปกคอมแบบมีเงื่อนไขและชาญฉลาด วิเคราะห์ความคุ้มค่า เฟรมเรตเกม และความหายากของสเปก",
    siteName: "Horizon Auto PC",
    locale: "th_TH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('horizon_theme') || 'dark';
                document.documentElement.setAttribute('data-theme', savedTheme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen selection:bg-sky-500 selection:text-slate-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
