"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useVideoHistory } from "@/hooks/use-video-history"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import { useVideoQueue } from "@/hooks/use-video-queue"
import { useAuth } from "@/hooks/use-auth"
import VideoPlayer from "@/components/video-player"
import VideoDetails from "@/components/video-details"
import RelatedVideos from "@/components/related-videos"

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
  const { user } = useAuth()

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
        console.error("Error fetching recommended videos:", err)
        setError(err.message || "Unable to load recommended videos")
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchRecommendedVideos()
    } else {
      setIsLoading(false)
      setError("Sign in to see your recommended videos")
    }
  }, [user])

  const handleVideoSelect = (videoId: string) => {
    setCurrentVideo(videoId)
    addToHistory(videoId)

    // Add related videos to queue
    fetch(`/api/related/${videoId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items && data.items.length > 0) {
          const relatedIds = data.items.map((video: any) => video.id)
          addToQueue(relatedIds)
        }
      })
      .catch((err) => console.error("Error fetching related videos for queue:", err))

    // Scroll to top when selecting a video
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Your Recommendations</h2>
        <p className="text-muted-foreground">Sign in to see personalized video recommendations.</p>
      </div>
    )
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
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

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recommended For You</h2>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {isLoading
          ? // Loading skeletons
            Array(6)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Skeleton className="aspect-video rounded-t-lg" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <div className="flex items-center gap-2 pt-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          : // Actual video cards
            recommendedVideos.map((video) => (
              <motion.div key={video.id} variants={item}>
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden transform hover:-translate-y-1 transition-transform duration-200"
                  onClick={() => handleVideoSelect(video.id)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-video relative">
                      <img
                        src={video.thumbnails.medium.url || `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="bg-white/90 text-black rounded-full p-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium line-clamp-2 mb-1">{video.title}</h3>
                      <p className="text-sm text-muted-foreground">{video.channelTitle}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </motion.div>
    </div>
  )
}

