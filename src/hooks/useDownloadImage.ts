import { toPng } from "html-to-image";
import { useNotifications } from "@/providers/Notifications";
import { useAppStore, useSettings } from "@/store";

export default function useDownloadImage(
  ref: React.RefObject<HTMLDivElement | null>
) {
  const { addNotification } = useNotifications();
  const settings = useSettings();
  const { updateSettings } = useAppStore();

  // https://github.com/bubkoo/html-to-image/issues/361#issuecomment-1506037670
  // TODO: replace with modern-screenshot? https://github.com/qq15725/modern-screenshot
  const buildPng = async () => {
    let dataUrl = "";
    const minDataLength = 2000000;
    let i = 0;
    const maxAttempts = 10;

    while (dataUrl.length < minDataLength && i < maxAttempts) {
      dataUrl = await toPng(ref.current as HTMLElement);
      i += 1;
    }

    return dataUrl;
  };

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
      buildPng()
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
