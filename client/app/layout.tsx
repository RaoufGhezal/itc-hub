import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { AuthProvider } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { EventsProvider } from "@/contexts/EventsContext";
import ChatWidget from "@/components/ChatWidget";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ITC Blida",
    template: "%s | ITC Blida",
  },
  description: "ITC Hub — Events & AI Chat",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Toaster theme="dark" richColors position="top-center" />

        <AuthProvider>
          <ChatProvider>
            <ChatWidget />

            <EventsProvider>{children}</EventsProvider>
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
