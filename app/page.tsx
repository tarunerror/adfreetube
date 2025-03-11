import VideoSearch from "@/components/video-search"
import TrendingVideos from "@/components/trending-videos"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import VideoHistory from "@/components/video-history"
import Header from "@/components/header"
import FavoritesSection from "@/components/favorites-section"
import RecommendedVideos from "@/components/recommended-videos"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 flex-grow">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-5 mb-8">
            <TabsTrigger value="search" className="data-[state=active]:animate-pulse-once">
              Search
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:animate-pulse-once">
              Trending
            </TabsTrigger>
            <TabsTrigger value="recommended" className="data-[state=active]:animate-pulse-once">
              For You
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:animate-pulse-once">
              Favorites
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:animate-pulse-once">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="animate-in fade-in-50 duration-300">
            <VideoSearch />
          </TabsContent>

          <TabsContent value="trending" className="animate-in fade-in-50 duration-300">
            <TrendingVideos />
          </TabsContent>

          <TabsContent value="recommended" className="animate-in fade-in-50 duration-300">
            <RecommendedVideos />
          </TabsContent>

          <TabsContent value="favorites" className="animate-in fade-in-50 duration-300">
            <FavoritesSection />
          </TabsContent>

          <TabsContent value="history" className="animate-in fade-in-50 duration-300">
            <VideoHistory />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}