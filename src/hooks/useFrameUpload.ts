import compressAndEncodeFile from "@/utils/compressFileUpload";
import { useAppStore, Frame } from "@/store";
import useProject from "@/hooks/useProject";
import { ChangeEvent } from "react";

export default function useFrameUpload({ projectId }: { projectId: string }) {
  const { updateProject } = useAppStore();
  const project = useProject(projectId);

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
      frames.push({
        id: crypto.randomUUID(),
        image: await compressAndEncodeFile(file, 1024),
        order: project?.frames.length || 0,
        caption: new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
        }).format(new Date(file.lastModified)),
        description: "",
        hidden: false,
        position: {
          x: 0,
          y: 0,
        },
        rotation: 0,
        scale: 1,
      });
    }
    return frames;
  };

  const uploadFiles = async (files: File[] | FileList) => {
    if (!files.length) {
      return;
    }
    const frames = await prepareFiles(files);

    updateProject(projectId, {
      frames: [...(project?.frames || []), ...frames],
    });
  };

  return { upload: uploadFiles, onChange };
}
