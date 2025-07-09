import { createVideoFromImages } from "@/actions/video";

export async function generateVideo(
  images: { url: string; duration: number }[]
) {
  try {
    const blob = await createVideoFromImages(images);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timelapse.mp4";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
}
