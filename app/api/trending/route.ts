import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId") || ""
    const regionCode = searchParams.get("regionCode") || "US"
    const maxResults = searchParams.get("maxResults") || "12"

    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
      console.error("YouTube API key is missing in environment variables")
      throw new Error("YouTube API key is not configured. Please check your environment variables.")
    }

    // Use the actual YouTube API with the provided API key
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${regionCode}${categoryId ? `&videoCategoryId=${categoryId}` : ""}&maxResults=${maxResults}&key=${apiKey}`,
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("YouTube API error:", errorData)
      throw new Error(`YouTube API error: ${errorData.error?.message || "Unknown error"}`)
    }

    const data = await response.json()

    // Transform the data to a more convenient format for our frontend
    const videos = data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnails: item.snippet.thumbnails,
      viewCount: item.statistics.viewCount,
      likeCount: item.statistics.likeCount,
    }))

    return NextResponse.json({ items: videos })
  } catch (error: any) {
    console.error("Error fetching trending videos:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch trending videos" }, { status: 500 })
  }
}

