import * as htmlToImage from "html-to-image";
import { useNotifications } from "@/providers/Notifications";
import { useAppStore, useSettings } from "@/store";

export default function useDownloadImage(
  ref: React.RefObject<HTMLDivElement | null>
) {
  const { addNotification } = useNotifications();
  const settings = useSettings();
  const { updateSettings } = useAppStore();

  const downloadImage = (filename: string) => {
    if (!ref.current) {
      return;
    }

    const ghost = settings.ghost;

    if (settings.ghost) {
      updateSettings({
        ghost: false,
      });
    }

    setTimeout(() => {
      htmlToImage
        .toPng(ref.current as HTMLElement)
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `${filename || Date.now()}.png`;
          link.style.display = "none";

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          updateSettings({
            ghost,
          });
        })
        .catch((err) => {
          console.error("oops, something went wrong!", err);
          addNotification({
            message: "Something went wrong while downloading the image.",
            type: "error",
          });
        });
    }, 0);
  };

  return {
    downloadImage,
  };
}
