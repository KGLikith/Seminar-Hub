"use client";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import SeminarPreview from "@/components/landing/SeminarPreview";
import Footer from "@/components/landing/Footer";
import { useAuth } from "@clerk/nextjs";

export default function HomePage() {
  const { isLoaded } = useAuth();

  if (!isLoaded) return (
    <div className="flex items-center justify-center h-screen">
      <div className="shimmer-loading w-32 h-8 rounded-lg"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <SeminarPreview />
      <Footer />
    </main>
  );
}
