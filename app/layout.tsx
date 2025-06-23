import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { LanguageProvider } from "@/contexts/language-context"
import { ThemeProvider } from "@/components/theme-provider"
import { AnalyticsTracker } from "@/components/analytics-tracker"
import "./globals.css"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Template Store - Вебсайт template загвар",
  description: "Хамгийн хямд үнээр вебсайттай болоорой",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <AnalyticsTracker />
            <Suspense>{children}</Suspense>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
