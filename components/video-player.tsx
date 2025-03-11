"use client"

import { useEffect, useRef } from "react"

interface VideoPlayerProps {
  videoId: string
  onEnded?: () => void
}

export default function VideoPlayer({ videoId, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0&enablejsapi=1`
    }
  }, [videoId])

  return (
    <div className="w-full aspect-video">
      <iframe
        ref={videoRef}
        width="100%"
        height="100%"
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
      ></iframe>
    </div>
  )
}
