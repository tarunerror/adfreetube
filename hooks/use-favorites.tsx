"use client"

import { useState, useEffect } from "react"

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem("video-favorites")
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (error) {
        console.error("Failed to parse favorites:", error)
      }
    }
  }, [])

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("video-favorites", JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (videoId: string) => {
    setFavorites((prev) => {
      if (prev.includes(videoId)) {
        return prev.filter((id) => id !== videoId)
      } else {
        return [...prev, videoId]
      }
    })
  }

  return { favorites, toggleFavorite }
}

