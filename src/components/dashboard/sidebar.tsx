"use client";

import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, BookOpen, Calendar, BarChart3, Wrench, LogOut, Book, User } from 'lucide-react';
import { useAuth } from "@clerk/nextjs";
import { useProfile, useUserRole } from "@/hooks/react-query/useUser";
import { UserRole } from "@/generated/enums";
import { useEffect } from "react";
import { toast } from "sonner";

const menuItems = {
  [UserRole.teacher]: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Book Seminar", href: "/dashboard/teacher", icon: BookOpen },
    { label: "My Bookings", href: "/dashboard/teacher/bookings", icon: Book },
    { label: "Calendar", href: "/dashboard/teacher/calendar", icon: Calendar },
    { label: "Profile", href: "/dashboard/profile", icon: User },
  ],
  [UserRole.hod]: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Pending Requests", href: "/dashboard/hod", icon: BookOpen },
    { label: "Usage Statistics", href: "/dashboard/hod/usage", icon: BarChart3 },
    { label: "Calendar", href: "/dashboard/hod/calendar", icon: Calendar },
    { label: "Profile", href: "/dashboard/profile", icon: User },

  ],
  [UserRole.tech_staff]: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Schedule", href: "/dashboard/tech-staff", icon: Calendar },
    { label: "Equipment", href: "/dashboard/tech-staff/equipment", icon: Wrench },
    { label: "Maintenance", href: "/dashboard/tech-staff/maintenance", icon: BarChart3 },
    { label: "Calendar", href: "/dashboard/tech-staff/calendar", icon: Calendar },
    { label: "Profile", href: "/dashboard/profile", icon: User }, 
  ],
};

export default function Sidebar() {
  const { userId, signOut } = useAuth();
  const router = useRouter();
  const { data: profile, isLoading } = useProfile(userId ? userId : "");
  const { data: userRole } = useUserRole(profile?.id ? profile.id : "");
  const pathname = usePathname();
  const items = userRole ? menuItems[userRole as keyof typeof menuItems] || [] : [];

  
  const handleLogout = () => {
    signOut({ redirectUrl: "/auth/sign-in" });
    toast.success("Logged out successfully");
    router.push("/auth/sign-in");
  };

  if (isLoading) {
    return (
      <aside className="w-64 bg-white border-r border-slate-200 h-full overflow-y-auto flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-32 bg-slate-200 rounded"></div>
            <div className="h-4 w-20 bg-slate-200 rounded"></div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-10 bg-slate-200 rounded animate-pulse"></div>
          ))}
        </nav>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-full overflow-y-auto flex flex-col shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Seminar Hub</h2>
            <p className="text-xs text-slate-500 capitalize">{userRole?.replace("_", " ")}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {items.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              style={{
                animation: `slide-in-right 0.3s ease-out`,
                animationDelay: `${index * 0.05}s`,
              }}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <button 
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 font-medium text-sm"
          onClick={() => handleLogout()}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
