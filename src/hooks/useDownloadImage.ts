import { useEffect, useRef, useState } from "react";
import { useNotifications } from "@/providers/Notifications";
import buildPng from "@/utils/htmlToPng";

export default function useDownloadImage(
  containerRef: React.RefObject<HTMLDivElement | HTMLImageElement | null>
) {
  const { addNotification } = useNotifications();
  const [isBuilding, setIsBuilding] = useState(false);
  const filenameRef = useRef("");

  useEffect(() => {
    if (!isBuilding || !containerRef.current) {
      setIsBuilding(false);
      return;
    }

    const buildAndDownload = async () => {
      try {
        const dataUrl = await buildPng(containerRef.current as HTMLElement);
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${filenameRef.current || Date.now()}.png`;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("oops, something went wrong!", err);
        addNotification({
          message: "Something went wrong while downloading the image.",
          type: "error",
        });
      } finally {
        setIsBuilding(false);
      }
    };

    buildAndDownload();
  }, [isBuilding, containerRef, addNotification]);

  const downloadImage = (filename: string) => {
    if (!containerRef.current) return;

    filenameRef.current = filename;
    setIsBuilding(true);
  };

  return {
    isPending: isBuilding,
    downloadImage,
  };
}
