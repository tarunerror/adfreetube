import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Fetch recommended videos from YouTube API using the user's access token
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/activities?part=snippet,contentDetails&mine=true&maxResults=12&key=${process.env.YOUTUBE_API_KEY}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
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
    const recommendedVideos = data.items
      .filter((item: any) => item.snippet && item.contentDetails && item.contentDetails.upload)
      .map((item: any) => ({
        id: item.contentDetails.upload.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        thumbnails: item.snippet.thumbnails,
      }))

    return NextResponse.json({ items: recommendedVideos })
  } catch (error: any) {
    console.error("Error fetching recommended videos:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch recommended videos" }, { status: 500 })
  }
}

