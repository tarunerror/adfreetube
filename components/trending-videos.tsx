"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import VideoPlayer from "@/components/video-player"
import VideoDetails from "@/components/video-details"
import RelatedVideos from "@/components/related-videos"
import { useVideoHistory } from "@/hooks/use-video-history"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCompactNumber } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { useVideoQueue } from "@/hooks/use-video-queue"

interface TrendingVideo {
  id: string
  title: string
  channelTitle: string
  viewCount: string
  publishedAt: string
  description: string
  thumbnails: {
    default: { url: string; width: number; height: number }
    medium: { url: string; width: number; height: number }
    high: { url: string; width: number; height: number }
    standard?: { url: string; width: number; height: number }
    maxres?: { url: string; width: number; height: number }
  }
}

interface VideoCategory {
  id: string
  title: string
}

interface Country {
  code: string
  name: string
}

// List of countries supported by YouTube API
const COUNTRIES: Country[] = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "AU", name: "Australia" },
  { code: "RU", name: "Russia" },
  { code: "KR", name: "South Korea" },
  { code: "MX", name: "Mexico" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
]

export default function TrendingVideos() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trendingVideos, setTrendingVideos] = useState<TrendingVideo[]>([])
  const [categories, setCategories] = useState<VideoCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedCountry, setSelectedCountry] = useState<string>("US")
  const { addToHistory } = useVideoHistory()
  const { currentVideo, setCurrentVideo, addToQueue, queue, playNext } = useVideoQueue()

  // Fetch video categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/video-categories")

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch video categories")
        }

        const data = await response.json()
        setCategories(data.items)
      } catch (err) {
        console.error("Error fetching video categories:", err)
        // Don't show error for categories, just log it
      }
    }

    fetchCategories()
  }, [])

  // Fetch trending videos based on selected category and country
  useEffect(() => {
    const fetchTrendingVideos = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const url = `/api/trending?regionCode=${selectedCountry}${selectedCategory ? `&categoryId=${selectedCategory}` : ""}`

        const response = await fetch(url)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch trending videos")
        }

        const data = await response.json()

        if (!data.items || data.items.length === 0) {
          throw new Error("No trending videos found for this category/region")
        }

        setTrendingVideos(data.items)

        // Add trending videos to queue if no video is currently playing
        if (!currentVideo && data.items.length > 0) {
          const videoIds = data.items.map((video: TrendingVideo) => video.id)
          addToQueue(videoIds)
        }
      } catch (err: any) {
        console.error("Error fetching trending videos:", err)
        setError(err.message || "Unable to load trending videos. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrendingVideos()
  }, [selectedCategory, selectedCountry, addToQueue, currentVideo])

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

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode)
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Trending on YouTube</h2>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Select value={selectedCountry} onValueChange={handleCountryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="text-sm text-muted-foreground">Updated today</p>
        </div>
      </div>

      {categories.length > 0 && (
        <Tabs defaultValue="" value={selectedCategory} onValueChange={handleCategoryChange} className="w-full">
          <TabsList className="flex flex-nowrap overflow-x-auto pb-2 mb-4 bg-transparent h-auto">
            <TabsTrigger value="" className="rounded-full">
              All
            </TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="rounded-full whitespace-nowrap">
                {category.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {isLoading
          ? // Loading skeletons
            Array(12)
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
            trendingVideos.map((video, index) => (
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
                        <span>{formatCompactNumber(Number.parseInt(video.viewCount))} views</span>
                        <span>•</span>
                        <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
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

