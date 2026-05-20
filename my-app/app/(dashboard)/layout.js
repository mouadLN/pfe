import { Providers } from "@/components/providers"
import { AppSidebar } from "@/components/app-sidebar"
import { BreadcrumbHeader } from "@/components/breadcrumb-header"
import { SidebarInset } from "@/components/ui/sidebar"
import { AuthGuard } from "@/components/AuthGuard"
import { AutoLogoutProvider } from "@/components/AutoLogoutProvider"

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <AutoLogoutProvider>
        <Providers>
          <AppSidebar />
          <SidebarInset className="flex flex-col h-screen overflow-hidden">
            <main className="flex flex-col flex-1 min-h-0">
              <BreadcrumbHeader />
              <div className="p-4 overflow-auto flex-1 min-h-0">
                {children}
              </div>
            </main>
          </SidebarInset>
        </Providers>
      </AutoLogoutProvider>
    </AuthGuard>
  )
}