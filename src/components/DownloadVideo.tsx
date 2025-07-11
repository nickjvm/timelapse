import { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoMdCloudDownload } from "react-icons/io";

import useFrames from "@/hooks/useFrames";
import { generateVideo } from "@/utils/video";
import Image from "@/components/Image";
import { PLAYBACK_SPEEDS } from "@/store";
import { useNotifications } from "@/providers/Notifications";
import cn from "@/utils/cn";
import buildPng from "@/utils/htmlToPng";

export default function DownloadVideo({
  projectId,
  speed,
}: {
  projectId: string;
  speed: keyof typeof PLAYBACK_SPEEDS;
}) {
  const { visibleFrames } = useFrames(projectId);
  const [isPending, setIsPending] = useState(false);
  const { addNotification, removeNotification } = useNotifications();

  const handleGenerateVideo = async () => {
    setIsPending(true);
    const id = addNotification({
      message: "Download started...",
      type: "info",
      timeout: 0,
    });
    try {
      const images = [];
      for (const frame of visibleFrames) {
        const dataUrl = await buildPng(
          document.querySelector(`#frame-${frame.id}`)!
        );
        images.push({
          url: dataUrl,
          duration: PLAYBACK_SPEEDS[speed],
        });
      }

      await generateVideo(images);
      removeNotification(id);
      addNotification({
        message: "Video downloaded!",
        type: "success",
      });
    } catch (error) {
      addNotification({
        message: "Error generating video. Try again later.",
        type: "error",
      });
      console.error("Error:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="overflow-hidden relative">
      <button
        className={cn(
          "relative border border-white hover:bg-white/50",
          isPending && "opacity-50 cursor-not-allowed bg-white/50"
        )}
        onClick={handleGenerateVideo}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <AiOutlineLoading3Quarters className="animate-spin w-5 h-5" />
            Saving...
          </>
        ) : (
          <>
            <IoMdCloudDownload className="w-5 h-5" />
            Save Video
          </>
        )}
      </button>
      <div className="absolute left-full top-full">
        {visibleFrames.map((frame) => (
          <div
            key={frame.id}
            id={`frame-${frame.id}`}
            className="top-0 left-0 w-96 absolute"
          >
            <Image
              id={frame.id}
              projectId={projectId}
              ratio="aspect-[calc(3/4)]"
              alt={frame.caption || ""}
            >
              <Image.Static />
              <Image.Caption className="left-2 right-2 bottom-2 text-center text-white text-base md:text-xl font-bold text-shadow-md text-shadow-black bg-transparent" />
            </Image>
          </div>
        ))}
      </div>
    </div>
  );
}
