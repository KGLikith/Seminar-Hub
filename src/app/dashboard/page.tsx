"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { AlertCircle, BookOpen, Users, Zap } from 'lucide-react';

interface UserProfile {
  role: string;
  name: string;
  department: { name: string } | null;
}

export default function DashboardHome() {
  const { userId } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError(null);
        const res = await fetch("/api/user/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        setProfile(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching profile");
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="shimmer-loading h-32 rounded-lg"></div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex gap-4 p-4 bg-red-50 border border-red-200 rounded-lg items-start">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900">Error</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  );

  const roleMessages = {
    teacher: "Book seminar halls for your classes and manage your reservations.",
    hod: "Review and approve booking requests from your department.",
    tech_staff: "Manage equipment status and maintenance for assigned halls.",
  };

  const featureCards = [
    {
      title: "Your Role",
      icon: Users,
      value: profile?.role.replace("_", " ").toUpperCase(),
      gradient: "from-blue-600 to-blue-400",
      bgGradient: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      textColor: "text-slate-900"
    },
    {
      title: "Department",
      icon: BookOpen,
      value: profile?.department?.name || "Not Assigned",
      gradient: "from-purple-600 to-purple-400",
      bgGradient: "from-purple-50 to-pink-50",
      borderColor: "border-purple-200",
      textColor: "text-slate-900"
    },
    {
      title: "Quick Access",
      icon: Zap,
      value: "Navigate Dashboard",
      gradient: "from-amber-600 to-amber-400",
      bgGradient: "from-amber-50 to-orange-50",
      borderColor: "border-amber-200",
      textColor: "text-slate-900"
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="heading-1 mb-2">Welcome back, {profile?.name}! 👋</h1>
        <p className="text-base md:text-lg text-slate-600">
          {roleMessages[profile?.role as keyof typeof roleMessages] ||
            "Welcome to the Hall Management System"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        {featureCards.map((card, idx) => {
          const IconComponent = card.icon;
          return (
            <div
              key={idx}
              className={`group relative overflow-hidden rounded-xl border-2 ${card.borderColor} bg-linear-to-br ${card.bgGradient} p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-opacity-100`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-linear-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">{card.title}</h3>
                  <div className={`p-2 rounded-lg bg-linear-to-br ${card.gradient} text-white`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                </div>
                <p className={`${card.textColor} font-bold text-lg truncate`}>{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative overflow-hidden rounded-xl border-2 border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50 p-6 md:p-8 animate-fade-in transition-all duration-300 hover:shadow-md">
        <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-indigo-600 opacity-0 hover:opacity-5 transition-opacity duration-300" />
        <div className="relative z-10">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">ℹ️</span>
            <h2 className="heading-3">Getting Started</h2>
          </div>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Use the sidebar navigation to access different sections based on your role. Each section provides role-specific tools and information tailored to your needs.
          </p>
        </div>
      </div>
    </div>
  );
}
