import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
      console.error("YouTube API key is missing in environment variables")
      return NextResponse.json({ error: "YouTube API key is not configured" }, { status: 500 })
    }

    if (!session?.accessToken) {
      console.warn("Access token missing. User might not be logged in.")
    }

    const url = new URL("https://www.googleapis.com/youtube/v3/activities")
    url.searchParams.append("part", "snippet,contentDetails")
    url.searchParams.append("mine", "true")
    url.searchParams.append("maxResults", "12")
    url.searchParams.append("key", apiKey)

    const headers: Record<string, string> = {}
    if (session?.accessToken) {
      headers["Authorization"] = `Bearer ${session.accessToken}`
    }

    const response = await fetch(url.toString(), { headers })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("YouTube API error:", errorData)
      return NextResponse.json({ error: errorData.error?.message || "Failed to fetch data from YouTube" }, { status: response.status })
    }

    const data = await response.json()
    const recommendedVideos = data.items?.map((item: any) => ({
      id: item.contentDetails?.upload?.videoId,
      title: item.snippet?.title,
      channelTitle: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt,
      thumbnails: item.snippet?.thumbnails,
    })).filter(Boolean)

    return NextResponse.json({ items: recommendedVideos })
  } catch (error: any) {
    console.error("Error fetching recommended videos:", error.message)
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 })
  }
}
