"use client"

import type React from "react"

import { useState } from "react"
import { Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import VideoPlayer from "@/components/video-player"
import VideoDetails from "@/components/video-details"
import RelatedVideos from "@/components/related-videos"
import { useVideoHistory } from "@/hooks/use-video-history"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import { useVideoQueue } from "@/hooks/use-video-queue"

interface SearchResult {
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

export default function VideoSearch() {
  const [url, setUrl] = useState("")
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const { addToHistory } = useVideoHistory()
  const { currentVideo, setCurrentVideo, addToQueue, playNext } = useVideoQueue()

  const extractVideoId = (url: string) => {
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!url.trim()) {
      setError("Please enter a YouTube URL")
      return
    }

    const id = extractVideoId(url)

    if (!id) {
      setError("Invalid YouTube URL. Please enter a valid YouTube video URL.")
      return
    }

    setIsLoading(true)

    // Load the video
    setCurrentVideo(id)
    setIsLoading(false)
    addToHistory(id)

    // Clear search results when loading a video from URL
    setSearchResults([])

    // Add related videos to queue
    fetch(`/api/related/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items && data.items.length > 0) {
          const relatedIds = data.items.map((video: any) => video.id)
          addToQueue(relatedIds)
        }
      })
      .catch((err) => console.error("Error fetching related videos for queue:", err))
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!query.trim()) {
      setError("Please enter a search term")
      return
    }

    try {
      setIsSearching(true)

      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to search videos")
      }

      const data = await response.json()

      if (!data.items || data.items.length === 0) {
        throw new Error("No videos found for your search")
      }

      setSearchResults(data.items)
    } catch (err: any) {
      console.error("Error searching videos:", err)
      setError(err.message || "Failed to search videos. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleVideoSelect = (id: string) => {
    setCurrentVideo(id)
    addToHistory(id)

    // Add related videos to queue
    fetch(`/api/related/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items && data.items.length > 0) {
          const relatedIds = data.items.map((video: any) => video.id)
          addToQueue(relatedIds)
        }
      })
      .catch((err) => console.error("Error fetching related videos for queue:", err))

    // Scroll to top
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

  return (
    <div className="w-full space-y-6">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* URL Input Form */}
        <form onSubmit={handleUrlSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Paste YouTube video URL here"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading
              </>
            ) : (
              "Watch"
            )}
          </Button>
        </form>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search for videos"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isSearching} variant="secondary">
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching
              </>
            ) : (
              "Search"
            )}
          </Button>
        </form>
      </motion.div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {currentVideo && (
        <>
          <VideoPlayer videoId={currentVideo} onEnded={playNext} />
          <VideoDetails videoId={currentVideo} />
          <RelatedVideos videoId={currentVideo} onVideoSelect={handleVideoSelect} />
        </>
      )}

      {searchResults.length > 0 && (
        <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <h2 className="text-xl font-bold mb-4">Search Results</h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {searchResults.map((video) => (
              <motion.div key={video.id} variants={item}>
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden transform hover:-translate-y-1 transition-transform duration-200"
                  onClick={() => handleVideoSelect(video.id)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-video relative">
                      <img
                        src={video.thumbnails.medium.url || "/placeholder.svg"}
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
      )}
    </div>
  )
}

