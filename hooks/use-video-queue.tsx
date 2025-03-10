"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"

interface VideoQueueContextType {
  queue: string[]
  currentVideo: string | null
  addToQueue: (videoIds: string[]) => void
  removeFromQueue: (videoId: string) => void
  clearQueue: () => void
  playNext: () => void
  setCurrentVideo: (videoId: string) => void
}

const VideoQueueContext = createContext<VideoQueueContextType>({
  queue: [],
  currentVideo: null,
  addToQueue: () => {},
  removeFromQueue: () => {},
  clearQueue: () => {},
  playNext: () => {},
  setCurrentVideo: () => {},
})

export function VideoQueueProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<string[]>([])
  const [currentVideo, setCurrentVideo] = useState<string | null>(null)

  // Load queue from localStorage on component mount
  useEffect(() => {
    const savedQueue = localStorage.getItem("video-queue")
    const savedCurrentVideo = localStorage.getItem("current-video")

    if (savedQueue) {
      try {
        setQueue(JSON.parse(savedQueue))
      } catch (error) {
        console.error("Failed to parse queue:", error)
      }
    }

    if (savedCurrentVideo) {
      setCurrentVideo(savedCurrentVideo)
    }
  }, [])

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("video-queue", JSON.stringify(queue))
  }, [queue])

  // Save current video to localStorage whenever it changes
  useEffect(() => {
    if (currentVideo) {
      localStorage.setItem("current-video", currentVideo)
    } else {
      localStorage.removeItem("current-video")
    }
  }, [currentVideo])

  const addToQueue = (videoIds: string[]) => {
    setQueue((prev) => {
      // Filter out duplicates and the current video
      const newIds = videoIds.filter((id) => id !== currentVideo && !prev.includes(id))
      return [...prev, ...newIds]
    })
  }

  const removeFromQueue = (videoId: string) => {
    setQueue((prev) => prev.filter((id) => id !== videoId))
  }

  const clearQueue = () => {
    setQueue([])
  }

  const playNext = () => {
    if (queue.length > 0) {
      const nextVideo = queue[0]
      setCurrentVideo(nextVideo)
      setQueue((prev) => prev.slice(1))
    } else {
      // No more videos in queue
      setCurrentVideo(null)
    }
  }

  const setCurrentVideoWithHistory = (videoId: string) => {
    setCurrentVideo(videoId)
  }

  return (
    <VideoQueueContext.Provider
      value={{
        queue,
        currentVideo,
        addToQueue,
        removeFromQueue,
        clearQueue,
        playNext,
        setCurrentVideo: setCurrentVideoWithHistory,
      }}
    >
      {children}
    </VideoQueueContext.Provider>
  )
}

export function useVideoQueue() {
  const context = useContext(VideoQueueContext)

  if (context === undefined) {
    throw new Error("useVideoQueue must be used within a VideoQueueProvider")
  }

  return context
}

