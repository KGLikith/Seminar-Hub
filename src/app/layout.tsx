import type { Metadata } from "next";
import { Poppins } from 'next/font/google';
import "./globals.css";
import Providers from "@/components//provider/providers";
import { Toaster } from "sonner";
import FloatingAskBar from "@/components/chatbot/FloatingAskBar";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Seminar Hub",
  description:
    "Manage seminar hall bookings, equipment, and approvals efficiently",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV === "development") {
    console.log("Starting cron jobs (development mode)")
    import("@/actions/cronjob").then((mod) => {
      mod.startAutoRejectCron()
      mod.startAutoCompleteCron()
    })
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans`}>
        <Providers>
          {children}
          <FloatingAskBar />
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
