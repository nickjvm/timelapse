import { ChangeEvent } from "react";
import { Project, useAppStore } from "@/store";
import { useNotifications } from "@/providers/Notifications";

export default function useProjectImport({
  onSuccess,
  onError,
}: {
  onSuccess?: (id: string) => void;
  onError?: (error: Error) => void;
} = {}) {
  const { addNotification } = useNotifications();
  const { addProject } = useAppStore();

  const validateJson = (json: Project) => {
    const hasName = !!json.name;
    const hasFrames = Array.isArray(json.frames);

    const hasValidFrames = json.frames.every((frame) => {
      const hasImage = typeof frame.image === "string";
      const hasPosition =
        typeof frame.position?.x === "number" &&
        typeof frame.position?.y === "number";
      const hasRotation = typeof frame.rotation === "number";
      const hasScale = typeof frame.scale === "number";
      return hasImage && hasPosition && hasRotation && hasScale;
    });
    if (!hasName || !hasFrames || !hasValidFrames) {
      return false;
    }
    return json;
  };

  const onChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files as FileList;
    if (!files?.length) {
      return;
    }

    uploadFile(files);
  };

  const uploadFile = (files: File[] | FileList) => {
    const file = files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = validateJson(JSON.parse(e.target?.result as string));
        if (json) {
          const id = addProject({
            name: json.name,
            frames: json.frames.map((frame) => ({
              id: crypto.randomUUID(),
              image: frame.image,
              caption: frame.caption || "",
              hidden: !!frame.hidden,
              position: {
                x: frame.position?.x || 0,
                y: frame.position?.y || 0,
              },
              rotation: frame.rotation || 0,
              scale: frame.scale || 1,
            })),
          });

          addNotification({
            message: `Project ${json.name} imported.`,
            type: "success",
          });

          onSuccess?.(id);
        }
      } catch (e) {
        console.log("Error importing project", e);
        addNotification({
          message: "Unable to validate imported project file.",
          type: "error",
        });
        onError?.(e as Error);
      }
    };

    reader.readAsText(file);
  };

  return {
    onChange,
    upload: uploadFile,
  };
}
