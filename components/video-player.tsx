"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2, Share2, Heart, Repeat, Repeat1, Volume2, Volume1, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useFavorites } from "@/hooks/use-favorites"
import { toast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface VideoPlayerProps {
  videoId: string
  onEnded?: () => void
}

export default function VideoPlayer({ videoId, onEnded }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [showVolumeControl, setShowVolumeControl] = useState(false)
  const [repeatMode, setRepeatMode] = useState<"none" | "all" | "one">("none")
  const { favorites, toggleFavorite } = useFavorites()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const isFavorite = favorites.includes(videoId)

  useEffect(() => {
    // Reset loading state when video ID changes
    setIsLoading(true)
  }, [videoId])

  const handleShare = async () => {
    try {
      const videoUrl = `https://youtube.com/watch?v=${videoId}`

      // Check if the Web Share API is supported and we're in a secure context
      if (navigator.share && window.isSecureContext) {
        try {
          await navigator.share({
            title: "Check out this video on AdFreeTube",
            url: videoUrl,
          })
          return // Exit if sharing was successful
        } catch (err) {
          console.log("Web Share API error:", err)
          // Fall back to clipboard if sharing fails
        }
      }

      // Fallback to clipboard copying
      await navigator.clipboard.writeText(videoUrl)
      toast({
        title: "Link copied!",
        description: "Video link copied to clipboard",
      })
    } catch (err) {
      console.error("Error in share functionality:", err)
      toast({
        title: "Sharing failed",
        description: "Could not share or copy the video link",
        variant: "destructive",
      })
    }
  }

  const handleFavorite = () => {
    toggleFavorite(videoId)
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite ? "Video removed from your favorites" : "Video added to your favorites",
    })
  }

  const toggleRepeatMode = () => {
    setRepeatMode((current) => {
      if (current === "none") return "all"
      if (current === "all") return "one"
      return "none"
    })
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    setIsMuted(value[0] === 0)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (isMuted) {
      setVolume(100) // Restore previous volume
    } else {
      setVolume(0)
    }
  }

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="h-4 w-4" />
    if (volume < 50) return <Volume1 className="h-4 w-4" />
    return <Volume2 className="h-4 w-4" />
  }

  const getRepeatIcon = () => {
    if (repeatMode === "one") return <Repeat1 className="h-4 w-4" />
    return <Repeat className="h-4 w-4" />
  }

  // Build the YouTube embed URL with parameters
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&loop=${repeatMode === "one" ? 1 : 0}&playlist=${repeatMode === "one" ? videoId : ""}`

  return (
    <motion.div
      className="w-full mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted shadow-lg transform-gpu perspective-1000">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 z-10 pointer-events-none" />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={embedUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0 z-0"
          onLoad={() => setIsLoading(false)}
          onEnded={() => {
            if (repeatMode === "none" && onEnded) {
              onEnded()
            }
          }}
        />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" size="sm" onClick={handleShare} className="transition-all">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant={isFavorite ? "default" : "outline"}
            size="sm"
            onClick={handleFavorite}
            className="transition-all"
          >
            {isFavorite ? (
              <Heart className="h-4 w-4 mr-2 fill-primary-foreground" />
            ) : (
              <Heart className="h-4 w-4 mr-2" />
            )}
            {isFavorite ? "Favorited" : "Favorite"}
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant={repeatMode !== "none" ? "default" : "outline"}
            size="sm"
            onClick={toggleRepeatMode}
            className="transition-all"
          >
            {getRepeatIcon()}
            <span className="ml-2">
              {repeatMode === "none" ? "Repeat" : repeatMode === "one" ? "Repeat One" : "Repeat All"}
            </span>
          </Button>
        </motion.div>

        <motion.div
          className="relative"
          onMouseEnter={() => setShowVolumeControl(true)}
          onMouseLeave={() => setShowVolumeControl(false)}
        >
          <Button variant="outline" size="sm" onClick={toggleMute} className="transition-all">
            {getVolumeIcon()}
            <span className="ml-2">Volume</span>
          </Button>

          <AnimatePresence>
            {showVolumeControl && (
              <motion.div
                className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg p-3 shadow-lg z-50 w-32"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <Slider value={[volume]} max={100} step={1} onValueChange={handleVolumeChange} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
}

