"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useVideoHistory } from "@/hooks/use-video-history"
import { useVideoQueue } from "@/hooks/use-video-queue"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import VideoPlayer from "@/components/video-player"
import VideoDetails from "@/components/video-details"
import RelatedVideos from "@/components/related-videos"
import { motion } from "framer-motion"

interface RecommendedVideo {
  id: string
  title: string
  channelTitle: string
  publishedAt: string
  thumbnails: {
    default: { url: string }
    medium: { url: string }
    high: { url: string }
  }
}

export default function RecommendedVideos() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recommendedVideos, setRecommendedVideos] = useState<RecommendedVideo[]>([])
  const { addToHistory } = useVideoHistory()
  const { currentVideo, setCurrentVideo, addToQueue, playNext } = useVideoQueue()

  useEffect(() => {
    const fetchRecommendedVideos = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/recommended")

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch recommended videos")
        }

        const data = await response.json()

        if (!data.items || data.items.length === 0) {
          throw new Error("No recommended videos found")
        }

        setRecommendedVideos(data.items)
      } catch (err: any) {
        console.error("Error fetching recommended videos:", err.message || err)
        setError(err.message || "Unable to load recommended videos")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendedVideos()
  }, [])

  const handleVideoSelect = (videoId: string) => {
    setCurrentVideo(videoId)
    addToHistory(videoId)

    fetch(`/api/related/${videoId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items && data.items.length > 0) {
          const relatedIds = data.items.map((video: any) => video.id)
          addToQueue(relatedIds)
        }
      })
      .catch((err) => console.error("Error fetching related videos:", err))

    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {currentVideo && (
        <>
          <VideoPlayer videoId={currentVideo} onEnded={playNext} />
          <VideoDetails videoId={currentVideo} />
          <RelatedVideos videoId={currentVideo} onVideoSelect={handleVideoSelect} />
        </>
      )}

      <h2 className="text-2xl font-bold">Recommended For You</h2>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {isLoading
          ? Array(6)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Skeleton className="aspect-video rounded-t-lg" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))
          : recommendedVideos.map((video) => (
              <Card
                key={video.id}
                className="cursor-pointer hover:shadow-md"
                onClick={() => handleVideoSelect(video.id)}
              >
                <CardContent className="p-0">
                  <img
                    src={video.thumbnails.medium.url}
                    alt={video.title}
                    className="w-full h-auto rounded-t-lg"
                    loading="lazy"
                  />
                  <div className="p-4">
                    <h3 className="font-medium line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-muted-foreground">{video.channelTitle}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
      </motion.div>
    </div>
  )
}
