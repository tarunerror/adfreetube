import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.error("YouTube API key is missing in environment variables");
      return NextResponse.json({ error: "YouTube API key is not configured. Please check your environment variables." }, { status: 500 });
    }

    const url = new URL("https://www.googleapis.com/youtube/v3/activities");
    url.searchParams.append("part", "snippet,contentDetails");
    url.searchParams.append("mine", "true");
    url.searchParams.append("maxResults", "12");
    url.searchParams.append("key", apiKey);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("YouTube API error:", errorData);
      return NextResponse.json({ error: errorData.error?.message || "Failed to fetch data from YouTube" }, { status: response.status });
    }

    const data = await response.json();
    const recommendedVideos = data.items?.map((item) => {
      const { snippet, contentDetails } = item;
      if (!snippet || !contentDetails?.upload?.videoId) return null;
      return {
        id: contentDetails.upload.videoId,
        title: snippet.title,
        channelTitle: snippet.channelTitle,
        channelId: snippet.channelId,
        publishedAt: snippet.publishedAt,
        thumbnails: snippet.thumbnails,
      };
    }).filter(Boolean);

    return NextResponse.json({ items: recommendedVideos });
  } catch (error) {
    console.error("Error fetching recommended videos:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}