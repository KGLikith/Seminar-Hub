import type { Metadata } from "next";
import { Poppins } from 'next/font/google';
import "./globals.css";
import Providers from "@/components/providers";
import { Toaster } from "sonner";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "College Seminar Hall Management",
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans`}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
