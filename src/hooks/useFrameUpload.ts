import { ChangeEvent } from "react";
import compressAndEncodeFile from "@/utils/compressFileUpload";
import { useAppStore, Frame } from "@/store";
import useProject from "@/hooks/useProject";
import { useNotifications } from "@/providers/Notifications";

type Options = {
  onSuccess?: (id: string) => void;
  onError?: (error: Error) => void;
};

export default function useFrameUpload(
  projectId: string,
  options: Options = {}
) {
  const { updateProject, addProject } = useAppStore();
  const project = useProject(projectId, true);
  const { addNotification } = useNotifications();

  const onChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files as FileList;
    if (!files?.length) {
      return;
    }

    uploadFiles(files);
  };

  const prepareFiles = async (files: File[] | FileList) => {
    const frames: Frame[] = [];
    const filesArray = Array.from(files);

    filesArray.sort((a, b) => (a.lastModified < b.lastModified ? -1 : 1));

    for (const file of filesArray) {
      if (file.type.startsWith("image/")) {
        frames.push({
          id: crypto.randomUUID(),
          image: await compressAndEncodeFile(file, 1024),
          caption: new Intl.DateTimeFormat("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
          }).format(new Date(file.lastModified)),
          hidden: false,
          position: {
            x: 0,
            y: 0,
          },
          rotation: 0,
          scale: 1,
        });
      }
    }
    return frames;
  };

  const uploadFiles = async (files: File[] | FileList) => {
    if (!files.length) {
      return;
    }

    try {
      const frames = await prepareFiles(files);

      if (frames.length < files.length) {
        const skippedFileCount = files.length - frames.length;
        addNotification({
          message: `${skippedFileCount} file${
            skippedFileCount === 1 ? "" : "s"
          } could not be imported. Only image files are allowed.`,
          type: "error",
        });
      }
      let id = projectId;
      if (project) {
        updateProject(projectId, {
          frames: [...(project?.frames || []), ...frames],
        });
      } else {
        id = addProject({
          name: `My Timeline ${new Date().toLocaleDateString()}`,
          frames,
        });

        options.onSuccess?.(id);
      }
    } catch (error) {
      console.error("Error importing files", error);

      addNotification({
        message: "Error importing photos. Please try again",
        type: "error",
      });
      options.onError?.(error as Error);
    }
  };

  return { upload: uploadFiles, onChange };
}
