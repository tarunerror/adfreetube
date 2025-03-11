import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Record<string, string> }) {
  try {
    const videoId = params?.id

    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
      console.error("YouTube API key is missing in environment variables")
      return NextResponse.json({ error: "YouTube API key is not configured. Please check your environment variables." }, { status: 500 })
    }

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${videoId}&type=video&maxResults=10&key=${apiKey}`
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("YouTube API error:", errorData)
      return NextResponse.json({ error: errorData.error?.message || "Unknown error" }, { status: response.status })
    }

    const data = await response.json()

    const relatedVideos = data.items?.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      thumbnails: item.snippet.thumbnails,
    })) || []

    return NextResponse.json({ items: relatedVideos })
  } catch (error: any) {
    console.error("Error fetching related videos:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch related videos" }, { status: 500 })
  }
}
