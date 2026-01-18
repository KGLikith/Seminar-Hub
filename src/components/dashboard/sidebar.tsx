"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  BarChart3,
  LogOut,
  User,
  CheckSquare,
  Building2,
  Users,
  Check,
} from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { useProfile } from "@/hooks/react-query/useUser"
import { UserRole } from "@/generated/enums"
import { toast } from "sonner"

const menuItems = {
  [UserRole.teacher]: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Book Hall", href: "/dashboard/book", icon: CalendarDays },
    { label: "My Bookings", href: "/dashboard/teacher/bookings", icon: FileText },
    { label: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
    { label: "Profile", href: "/dashboard/profile", icon: User },
  ],
  [UserRole.hod]: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
    { label: "Pending Requests", href: "/dashboard/hod/approval", icon: CheckSquare },
    { label: "Maintenance Requests", href: "/dashboard/hod/maintenance-requests", icon: CheckSquare },
    { label: "Manage Halls", href: "/dashboard/hod/hall-management", icon: Building2 },
    { label: "Manage Department", href: "/dashboard/hod/department-management", icon: Users },
    { label: "Analytics", href: "/dashboard/hod/analytics", icon: BarChart3 },
    { label: "Profile", href: "/dashboard/profile", icon: User },
  ],
  [UserRole.tech_staff]: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
    { label: "Maintenance Requests", href: "/dashboard/tech-staff/maintenance-request", icon: CheckSquare },
    { label: "Complete Maintenance", href: "/dashboard/tech-staff/complete-maintenance", icon: Check },
    { label: "Profile", href: "/dashboard/profile", icon: User },
  ],
}

export default function Sidebar() {
  const { userId, signOut } = useAuth()
  const router = useRouter()
  const { data: profile, isLoading } = useProfile(userId ? userId : "")
  const pathname = usePathname()
  const userRole = profile?.roles[0].role

  const items = userRole ? menuItems[userRole as keyof typeof menuItems] || [] : []

  const handleLogout = () => {
    signOut({ redirectUrl: "/auth/sign-in" })
    toast.success("Logged out successfully")
    router.push("/auth/sign-in")
  }

  if (isLoading) {
    return (
      <aside className="w-64 bg-card border-r border-border/50 h-full overflow-y-auto flex flex-col shadow-sm">
        <div className="p-6 border-b border-border/50">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-32 bg-muted rounded-lg"></div>
            <div className="h-4 w-20 bg-muted rounded"></div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-11 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </nav>
      </aside>
    )
  }


  return (
    <aside className="w-64 bg-card border-r border-border/50 h-full overflow-y-auto flex flex-col shadow-sm">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 bg-linear-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <div>
            <h2 className="font-bold text-foreground text-base">Seminar Hub</h2>
            <p className="text-xs text-muted-foreground capitalize font-medium">{userRole?.replace("_", " ")}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1.5">
        {items.map((item, index) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              style={{
                animation: `slide-in-right 0.3s ease-out`,
                animationDelay: `${index * 0.04}s`,
              }}
            >
              <Icon
                className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "" : "opacity-70"}`}
              />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border/50 bg-muted/30">
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 font-medium text-sm group"
          onClick={() => handleLogout()}
        >
          <LogOut className="h-5 w-5 transition-transform group-hover:scale-110" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
