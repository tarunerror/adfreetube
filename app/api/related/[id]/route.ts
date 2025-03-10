import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const videoId = params.id

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    // Fetch related videos from YouTube API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${videoId}&type=video&maxResults=10&key=${process.env.YOUTUBE_API_KEY}`,
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

    // Transform the data to a more convenient format
    const relatedVideos = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      thumbnails: item.snippet.thumbnails,
    }))

    return NextResponse.json({ items: relatedVideos })
  } catch (error: any) {
    console.error("Error fetching related videos:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch related videos" }, { status: 500 })
  }
}

