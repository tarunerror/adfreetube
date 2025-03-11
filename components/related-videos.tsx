"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"

interface RelatedVideosProps {
  videoId: string
  onVideoSelect: (videoId: string) => void
}

interface RelatedVideo {
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

export default function RelatedVideos({ videoId, onVideoSelect }: RelatedVideosProps) {
  const [relatedVideos, setRelatedVideos] = useState<RelatedVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!videoId) {
      setError("Invalid video ID.")
      setIsLoading(false)
      return
    }

    const fetchRelatedVideos = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log("Fetching related videos for:", videoId)

        const response = await fetch(`/api/related/${videoId}`)

        if (!response.ok) {
          const errorData = await response.json()
          console.error("API Error:", errorData)
          throw new Error(errorData.error || "Failed to fetch related videos")
        }

        const data = await response.json()

        if (!data.items || data.items.length === 0) {
          setError("No related videos found.")
          return
        }

        setRelatedVideos(data.items)
      } catch (err: any) {
        console.error("Error fetching related videos:", err.message || err)
        setError("Unable to load related videos. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelatedVideos()
  }, [videoId])


  if (isLoading) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Related Videos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex gap-2">
                <Skeleton className="w-40 h-24 rounded-md flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <p className="text-destructive mt-4">{error}</p>
  }

  if (relatedVideos.length === 0) {
    return <p className="mt-4">No related videos available.</p>
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  }

  return (
    <motion.div
      className="mt-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <h3 className="text-xl font-bold mb-4">Related Videos</h3>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {relatedVideos.map((video) => (
          <motion.div key={video.id} variants={item}>
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden transform hover:-translate-y-1 transition-transform duration-200"
              onClick={() => onVideoSelect(video.id)}
            >
              <CardContent className="p-3 flex gap-3">
                <div className="w-40 h-24 flex-shrink-0 relative rounded-md overflow-hidden">
                  <img
                    src={video.thumbnails.medium?.url || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{video.channelTitle}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
