import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Record<string, string> }) {
  try {
    const videoId = params?.id

    if (!videoId) {
      console.error("Error: Missing video ID")
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      console.error("Error: YouTube API key is missing")
      return NextResponse.json({ error: "YouTube API key is not configured" }, { status: 500 })
    }

    const url = new URL("https://www.googleapis.com/youtube/v3/search")
    url.searchParams.append("part", "snippet")
    url.searchParams.append("relatedToVideoId", videoId)
    url.searchParams.append("type", "video")
    url.searchParams.append("maxResults", "10")
    url.searchParams.append("key", apiKey)

    console.log("Fetching related videos from:", url.toString())

    const response = await fetch(url.toString())

    if (!response.ok) {
      const errorData = await response.json()
      console.error("YouTube API error:", errorData)
      return NextResponse.json({ error: errorData.error?.message || "Failed to fetch related videos" }, { status: response.status })
    }

    const data = await response.json()
    const relatedVideos = data.items?.map((item: any) => ({
      id: item.id?.videoId,
      title: item.snippet?.title,
      channelTitle: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt,
      thumbnails: item.snippet?.thumbnails,
    })).filter((video) => video.id) || []

    return NextResponse.json({ items: relatedVideos })
  } catch (error: any) {
    console.error("Unexpected error fetching related videos:", error.message)
    return NextResponse.json({ error: error.message || "Unexpected error" }, { status: 500 })
  }
}
