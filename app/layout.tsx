import { Figtree, Geist_Mono, Nunito_Sans } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import  AppSidebar  from "@/components/utils/appSidebar"
import { cn } from "@/lib/utils"
import "./globals.css"

const nunitoSansHeading = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
})

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        figtree.variable,
        nunitoSansHeading.variable
      )}
    >
      <body>
        <ThemeProvider>
          <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
               <nav className="fixed top-0 z-10 border-b bg-white dark:bg-background w-full h-12">
                <SidebarTrigger />
                </nav> 
             <div className="pt-12">{children} </div> 
            </main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
