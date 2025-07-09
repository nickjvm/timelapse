import { FFmpeg } from "@ffmpeg/ffmpeg";

export async function createVideoFromImages(
  images: { url: string; duration: number }[]
) {
  try {
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();

    // Write each image to FFmpeg's virtual filesystem
    for (let i = 0; i < images.length; i++) {
      const response = await fetch(images[i].url);
      const buffer = await response.arrayBuffer();
      await ffmpeg.writeFile(`frame-${i}.png`, new Uint8Array(buffer));
    }

    // Create a text file for the concat demuxer
    const concatFile = images
      .map(
        (_, i) => `file 'frame-${i}.png'\nduration ${images[i].duration / 1000}`
      )
      .join("\n");

    await ffmpeg.writeFile("input.txt", concatFile);

    // Run FFmpeg command
    await ffmpeg.exec([
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      "input.txt",
      "-framerate",
      "24", // Reduced from 30fps
      "-c:v",
      "libx264",
      "-crf",
      "25", // Slightly higher CRF for smaller files
      "-preset",
      "faster", // Faster encoding than 'slow'
      "-tune",
      "fastdecode", // Optimize for decoding speed
      "-profile:v",
      "main", // Slightly faster than 'high' profile
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart", // Enables streaming/partial playback
      "-vf",
      "scale=400:532:force_original_aspect_ratio=decrease,pad=400:532:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1",
      "-y",
      "output.mp4",
    ]);

    // Read the result
    const data = await ffmpeg.readFile("output.mp4");

    // Clean up
    for (let i = 0; i < images.length; i++) {
      await ffmpeg.deleteFile(`frame-${i}.png`);
    }
    await ffmpeg.deleteFile("input.txt");
    await ffmpeg.deleteFile("output.mp4");

    return new Blob([data], { type: "video/mp4" });
  } catch (error) {
    console.error("Error creating video:", error);
    throw error;
  }
}
