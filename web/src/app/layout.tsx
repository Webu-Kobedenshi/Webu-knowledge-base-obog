import { Toaster } from "@/components/atoms/toaster";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "We部 | ナレッジベース ver.就活",
  description: "先輩がどんな企業に内定をもらい、どんなスキルやガクチカを活かしたのか？",
  icons: {
    icon: [
      {
        url: "/webclub.png",
        sizes: "any",
      },
    ],
    apple: "/webclub.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <SpeedInsights />
        <Toaster />
      </body>
    </html>
  );
}
