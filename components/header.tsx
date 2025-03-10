"use client"

import { useState, useEffect } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { UserButton } from "@/components/user-button"
import { useAuth } from "@/hooks/use-auth"
import { LogIn, Youtube } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function Header() {
  const { user, signIn, isLoading } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)

  // Add scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <motion.header
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-sm transition-all duration-200 ${
        isScrolled ? "bg-background/80 shadow-sm" : "bg-background"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <motion.div whileHover={{ rotate: 10 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            <Youtube className="h-6 w-6 text-red-500" />
          </motion.div>
          <motion.span
            className="text-xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            AdFreeTube
          </motion.span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {user ? (
            <UserButton user={user} />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={signIn}
              disabled={isLoading}
              className="animate-in fade-in-50 duration-300"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  )
}

