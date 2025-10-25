/**
 * Continuously captures frames from a video element and sends them to the server via WebSocket.
 * 
 * This function draws the current frame of a video element onto an off-screen canvas,
 * encodes the frame as a JPEG image, converts it to a Base64 string, and sends it to the
 * server using the provided WebSocket at the specified interval.
 * 
 * @param video - The HTMLVideoElement to capture frames from.
 * @param ws - The WebSocket used for sending frame data.
 * @param intervalMs - The interval in milliseconds between each frame capture (default: 1500ms).
 * @returns An object with a `stop` method to halt frame sending.
 * 
 * Usage example:
 * ```
 * const sender = startSendingFrames(videoElement, websocket, 1000);
 * // ...later, to stop sending frames:
 * sender.stop();
 * ```
 */
export function startSendingFrames(
  video: HTMLVideoElement,
  ws: WebSocket,
  intervalMs = 1500
): { stop: () => void } {
  // Create an off-screen canvas sized to match the video
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext("2d")!;

  let stopped = false;

  /**
   * Converts a Blob object (image) to a Base64-encoded string.
   * @param blob - The Blob to convert.
   * @returns Promise<string> - Resolves to the Base64 string (without data prefix).
   */
  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // result format: 'data:image/jpeg;base64,...'
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  /**
   * Captures, encodes, and sends a single frame, then schedules the next send.
   */
  const sendFrame = async () => {
    if (stopped) return;

    // Ensure video is playing and WebSocket is open before capturing frame
    if (video.paused || video.ended || ws.readyState !== WebSocket.OPEN) {
      setTimeout(sendFrame, intervalMs);
      return;
    }

    // Draw current frame from video onto the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas content to JPEG Blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setTimeout(sendFrame, intervalMs);
        return;
      }

      // Convert Blob to Base64
      const base64 = await blobToBase64(blob);

      // Prepare payload for server
      const payload = {
        correlation_id: "229a73c8-84e4-4948-8831-4937cd8e2f79", // static session id (to be improved for multi-users)
        timestamp: new Date().toISOString(),
        frame: base64,
      };

      // Send the encoded frame via WebSocket
      ws.send(JSON.stringify(payload));
    }, "image/jpeg", 0.7);

    // Schedule next frame capture
    setTimeout(sendFrame, intervalMs);
  };

  // Start the frame sending process
  sendFrame();

  // Return an object exposing a stop method to halt execution
  return {
    /**
     * Stops the frame sending loop.
     */
    stop: () => {
      stopped = true;
    }
  };
}
