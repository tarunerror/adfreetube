import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const maxResults = searchParams.get("maxResults") || "10"

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    // Use the YouTube API to search for videos
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${process.env.YOUTUBE_API_KEY}`,
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("YouTube API error:", errorData)
      throw new Error(`YouTube API error: ${errorData.error?.message || "Unknown error"}`)
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ items: [] })
    }

    // Transform the data to a more convenient format for our frontend
    const videos = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnails: item.snippet.thumbnails,
    }))

    return NextResponse.json({ items: videos })
  } catch (error: any) {
    console.error("Error searching videos:", error)
    return NextResponse.json({ error: error.message || "Failed to search videos" }, { status: 500 })
  }
}

