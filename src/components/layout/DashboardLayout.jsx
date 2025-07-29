import { Sidebar } from "./Sidebar"
import { DashboardHeader } from "./DashboardHeader"
import { Footer } from "./Footer"

export function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        <Footer />
      </div>
    </div>
  )
}
