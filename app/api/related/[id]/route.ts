import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) return new Response("Unauthorized", { status: 401 })

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${params.id}&type=video&key=${process.env.YOUTUBE_API_KEY}`
    )
    
    const data = await response.json()
    return Response.json(data.items)
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch related videos" },
      { status: 500 }
    )
  }
}
