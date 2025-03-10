import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const videoId = params.id

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    // Fetch video details from YouTube API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`,
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("YouTube API error:", errorData)
      throw new Error(`YouTube API error: ${errorData.error?.message || "Unknown error"}`)
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const videoData = data.items[0]

    // Transform the data to a more convenient format
    const videoDetails = {
      id: videoData.id,
      title: videoData.snippet.title,
      channelTitle: videoData.snippet.channelTitle,
      channelId: videoData.snippet.channelId,
      description: videoData.snippet.description,
      publishedAt: videoData.snippet.publishedAt,
      thumbnails: videoData.snippet.thumbnails,
      viewCount: videoData.statistics.viewCount,
      likeCount: videoData.statistics.likeCount,
      commentCount: videoData.statistics.commentCount,
    }

    return NextResponse.json(videoDetails)
  } catch (error: any) {
    console.error("Error fetching video details:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch video details" }, { status: 500 })
  }
}

