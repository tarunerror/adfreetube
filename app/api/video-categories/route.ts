import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const regionCode = searchParams.get("regionCode") || "US"

    // Fetch video categories from YouTube API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=${regionCode}&key=${process.env.YOUTUBE_API_KEY}`,
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("YouTube API error:", errorData)
      throw new Error(`YouTube API error: ${errorData.error?.message || "Unknown error"}`)
    }

    const data = await response.json()

    // Filter out categories that are typically not useful for browsing
    const filteredCategories = data.items
      .filter((category: any) => {
        const title = category.snippet.title
        // Exclude categories like "Trailers", "Nonprofits & Activism", etc.
        return !["Trailers", "Nonprofits & Activism", "Movies"].includes(title)
      })
      .map((category: any) => ({
        id: category.id,
        title: category.snippet.title,
      }))

    return NextResponse.json({ items: filteredCategories })
  } catch (error: any) {
    console.error("Error fetching video categories:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch video categories" }, { status: 500 })
  }
}

