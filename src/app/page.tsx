"use client";

import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Zap, CheckCircle, Users, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  if (!isLoaded) return (
    <div className="flex items-center justify-center h-screen">
      <div className="shimmer-loading w-32 h-8 rounded-lg"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="heading-4">College Hall System</span>
          </div>
          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-200 hover:shadow-lg active:scale-95">
                Dashboard
              </Link>
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  console.log('Sign In clicked');
                  router.push('/auth/sign-in')
                }}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-slate-100 text-slate-900 font-semibold hover:bg-slate-200 transition-all duration-200 active:scale-95">
                Sign In
              </Button>
              <Button
                onClick={() => router.push('/auth/sign-up')}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-200 hover:shadow-lg active:scale-95">Sign Up</Button>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center slide-up">
          <h1 className="heading-1 mb-6">College Seminar Hall Management</h1>
          <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Streamline seminar hall bookings, manage equipment, and handle approvals with an intuitive platform built for educational institutions.
          </p>

          {!isSignedIn && (
            <div className="flex items-center gap-3 justify-center">
              <Button
                onClick={() => router.push('/auth/sign-in')}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-slate-100 text-slate-900 font-semibold hover:bg-slate-200 transition-all duration-200 active:scale-95">
                Sign In
              </Button>
              <Button
                onClick={() => router.push('/auth/sign-up')}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-200 hover:shadow-lg active:scale-95">Sign Up</Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          {[
            { icon: CheckCircle, title: "Easy Booking", desc: "Quickly reserve seminar halls" },
            { icon: Users, title: "Multi-Role Support", desc: "Teachers, HODs, and tech staff" },
            { icon: BarChart3, title: "Analytics", desc: "Track usage and approvals" },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 p-6 animate-[slide-up_0.5s_ease-out] fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <feature.icon className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="heading-4 mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
