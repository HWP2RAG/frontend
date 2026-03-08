import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_KR, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { MSWProvider } from "@/components/msw-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { GoogleOAuthWrapper } from "@/components/google-oauth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HWPtoRAG",
  description: "HWP 문서를 RAG 파이프라인에 적합한 형태로 변환",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSerifKr.variable} ${notoSansKr.variable} antialiased flex flex-col min-h-screen`}
      >
        <ThemeProvider>
          <GoogleOAuthWrapper>
            <MSWProvider>
              <Header />
              <div className="flex-1">{children}</div>
              <Footer />
            </MSWProvider>
          </GoogleOAuthWrapper>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
