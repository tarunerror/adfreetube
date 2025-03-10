"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { VideoQueueProvider } from "@/hooks/use-video-queue"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <VideoQueueProvider>{children}</VideoQueueProvider>
    </ThemeProvider>
  )
}

