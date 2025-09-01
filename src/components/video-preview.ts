import React, { useEffect, useRef } from "react";

type Props = {
  stream: MediaStream | null;
};

// TODO: estilizar o componente

export function VideoPreview({ stream }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return React.createElement("video", {
    ref: videoRef,
    autoPlay: true,
    playsInline: true,
    muted: true,
    style: {
      width: "100%",
      maxWidth: 640,
      borderRadius: 8,
      background: "#000",
    },
  });
}
