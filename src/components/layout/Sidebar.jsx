"use client"
import { Link, useLocation } from "react-router-dom"
import {
  Home,
  BarChart2,
  FileText,
  Settings,
  User,
  CreditCard,
  Users,
  LayoutTemplate,
  DollarSign,
  Mic,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

export function Sidebar() {
  const location = useLocation()
  const { user } = useAuth()

  const navItems = [
    {
      name: "Dashboard",
      icon: Home,
      path: "/dashboard",
      roles: ["user", "admin"],
    },
    {
      name: "New Interview",
      icon: Mic,
      path: "/interview/setup",
      roles: ["user", "admin"],
    },
    {
      name: "Reports",
      icon: FileText,
      path: "/reports",
      roles: ["user", "admin"],
    },
    {
      name: "Analytics",
      icon: BarChart2,
      path: "/analytics",
      roles: ["user", "admin"],
    },
    {
      name: "Subscription",
      icon: CreditCard,
      path: "/subscription",
      roles: ["user", "admin"],
    },
    {
      name: "Profile",
      icon: User,
      path: "/profile",
      roles: ["user", "admin"],
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
      roles: ["user", "admin"],
    },
  ]

  const adminNavItems = [
    {
      name: "Admin Dashboard",
      icon: Home,
      path: "/admin/dashboard",
      roles: ["admin"],
    },
    {
      name: "Manage Users",
      icon: Users,
      path: "/admin/users",
      roles: ["admin"],
    },
    {
      name: "Manage Payments",
      icon: DollarSign,
      path: "/admin/payments",
      roles: ["admin"],
    },
    {
      name: "Interview Templates",
      icon: LayoutTemplate,
      path: "/admin/templates",
      roles: ["admin"],
    },
  ]

  const filteredNavItems = navItems.filter((item) => user && item.roles.includes(user.role))
  const filteredAdminNavItems = adminNavItems.filter((item) => user && item.roles.includes(user.role))

  return (
    <aside className="w-64 bg-card border-r p-4 flex flex-col">
      <div className="flex items-center justify-center h-16 mb-6">
        <Link to="/dashboard" className="text-2xl font-bold text-primary">
          InterviewMate
        </Link>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  {
                    "bg-muted text-primary": location.pathname === item.path,
                  },
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        {filteredAdminNavItems.length > 0 && (
          <>
            <div className="mt-6 mb-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Admin</div>
            <ul className="space-y-2">
              {filteredAdminNavItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                      {
                        "bg-muted text-primary": location.pathname === item.path,
                      },
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>
    </aside>
  )
}
