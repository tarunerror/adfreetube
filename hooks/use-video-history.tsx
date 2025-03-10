"use client"

import { useState, useEffect } from "react"

export function useVideoHistory() {
  const [history, setHistory] = useState<string[]>([])

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("video-history")
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error("Failed to parse history:", error)
      }
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("video-history", JSON.stringify(history))
  }, [history])

  const addToHistory = (videoId: string) => {
    setHistory((prev) => {
      // Remove the videoId if it already exists to avoid duplicates
      const filtered = prev.filter((id) => id !== videoId)
      // Add the videoId to the beginning of the array
      return [videoId, ...filtered]
    })
  }

  const removeFromHistory = (videoId: string) => {
    setHistory((prev) => prev.filter((id) => id !== videoId))
  }

  const clearHistory = () => {
    setHistory([])
  }

  return { history, addToHistory, removeFromHistory, clearHistory }
}

