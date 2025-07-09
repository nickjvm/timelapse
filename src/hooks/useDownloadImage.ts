import { useEffect, useRef, useState } from "react";
import { useNotifications } from "@/providers/Notifications";
import { domToPng } from "modern-screenshot";

export default function useDownloadImage(
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const { addNotification } = useNotifications();
  const [isBuilding, setIsBuilding] = useState(false);
  const filenameRef = useRef("");

  useEffect(() => {
    if (!isBuilding || !containerRef.current) return;

    const buildAndDownload = async () => {
      try {
        const dataUrl = await domToPng(containerRef.current!);
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
