"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useFavorites } from "@/hooks/use-favorites"
import VideoPlayer from "@/components/video-player"
import VideoDetails from "@/components/video-details"
import RelatedVideos from "@/components/related-videos"
import { motion } from "framer-motion"
import { useVideoQueue } from "@/hooks/use-video-queue"
import { Heart } from "lucide-react"

export default function FavoritesSection() {
  const { favorites } = useFavorites()
  const { currentVideo, setCurrentVideo, addToQueue, playNext } = useVideoQueue()
  const [videoTitles, setVideoTitles] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Fetch video titles for favorites
  useEffect(() => {
    const fetchVideoTitles = async () => {
      if (favorites.length === 0) return

      setIsLoading(true)

      const titles: Record<string, string> = {}

      // Fetch titles in parallel
      await Promise.all(
        favorites.map(async (videoId) => {
          try {
            const response = await fetch(`/api/video/${videoId}`)
            if (response.ok) {
              const data = await response.json()
              titles[videoId] = data.title
            }
          } catch (err) {
            console.error(`Error fetching title for video ${videoId}:`, err)
          }
        }),
      )

      setVideoTitles(titles)
      setIsLoading(false)
    }

    fetchVideoTitles()
  }, [favorites])

  const handleVideoSelect = (videoId: string) => {
    setCurrentVideo(videoId)

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

  if (favorites.length === 0) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-2">Your Favorites</h2>
        <p className="text-muted-foreground">You haven't added any videos to your favorites yet.</p>
        <p className="text-muted-foreground mt-2">Click the heart icon on any video to add it to your favorites.</p>
      </motion.div>
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

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Favorites</h2>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {favorites.map((videoId) => (
          <motion.div key={videoId} variants={item}>
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow relative group transform hover:-translate-y-1 transition-transform duration-200"
              onClick={() => handleVideoSelect(videoId)}
            >
              <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground rounded-full p-1">
                <Heart className="h-4 w-4 fill-primary-foreground" />
              </div>
              <CardContent className="p-0">
                <div className="aspect-video relative">
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover rounded-t-lg"
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
                  <h3 className="font-medium line-clamp-2">{videoTitles[videoId] || "Loading title..."}</h3>
                  <p className="text-xs text-muted-foreground mt-2">Favorite video</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

