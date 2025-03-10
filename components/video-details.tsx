"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { formatCompactNumber } from "@/lib/utils"
import { motion } from "framer-motion"

interface VideoDetailsProps {
  videoId: string
}

interface VideoInfo {
  id: string
  title: string
  channelTitle: string
  channelId: string
  description: string
  publishedAt: string
  viewCount: string
  likeCount: string
  commentCount?: string
  thumbnails: {
    default: { url: string }
    medium: { url: string }
    high: { url: string }
    standard?: { url: string }
    maxres?: { url: string }
  }
}

export default function VideoDetails({ videoId }: VideoDetailsProps) {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setExpanded(false)

        const response = await fetch(`/api/video/${videoId}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch video details")
        }

        const data = await response.json()
        setVideoInfo(data)
      } catch (err: any) {
        console.error("Error fetching video details:", err)
        setError(err.message || "Unable to load video details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVideoDetails()
  }, [videoId])

  if (error) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!videoInfo) {
    return null
  }

  // Format the published date
  const publishedDate = new Date(videoInfo.publishedAt)
  const timeAgo = formatDistanceToNow(publishedDate, { addSuffix: true })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="mt-6 overflow-hidden">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-2">{videoInfo.title}</h2>

          <div className="flex items-center gap-2 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
              <AvatarFallback>{videoInfo.channelTitle.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{videoInfo.channelTitle}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{formatCompactNumber(Number.parseInt(videoInfo.viewCount))} views</span>
                <span>•</span>
                <span>{timeAgo}</span>
                {videoInfo.likeCount && (
                  <>
                    <span>•</span>
                    <span>{formatCompactNumber(Number.parseInt(videoInfo.likeCount))} likes</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <motion.div
            className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg"
            initial={{ height: "auto" }}
            animate={{ height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <p className={expanded ? "" : "line-clamp-3"}>{videoInfo.description || "No description available."}</p>
            {videoInfo.description && videoInfo.description.length > 150 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-primary text-xs mt-2 font-medium hover:underline focus:outline-none"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

