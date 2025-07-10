import React from "react";
import { Accept, useDropzone } from "react-dropzone";
import useFrameUpload from "@/hooks/useFrameUpload";
import cn from "@/utils/cn";
import { useNotifications } from "@/providers/Notifications";
import useProjectImport from "@/hooks/useProjectImport";

type Props = {
  projectId: string;
  className?: string;
  onSuccess?: (id: string) => void;
  onError?: (error: Error) => void;
} & React.PropsWithChildren;

export default function Dropzone({
  projectId,
  children,
  className,
  onSuccess,
  onError,
}: Props) {
  const { addNotification } = useNotifications();
  const { upload: uploadFrames } = useFrameUpload(projectId, {
    onSuccess,
    onError,
  });

  const { upload: uploadProject } = useProjectImport({
    onSuccess,
    onError,
  });

  const onDrop = (files: File[] | FileList) => {
    if (
      !projectId &&
      files.length === 1 &&
      files[0].type === "application/json"
    ) {
      uploadProject(files);
    } else {
      uploadFrames(files);
    }
  };

  const accept: Accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
  };

  if (!projectId) {
    accept["application/json"] = [".json"];
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    onDropRejected: (files) => {
      addNotification({
        message: `${files.length} file${
          files.length === 1 ? "" : "s"
        } could not be imported. Only image files are allowed.`,
        type: "error",
      });
    },
    accept,
  });

  return (
    <div {...getRootProps()} className={cn("grow", className)}>
      <input {...getInputProps()} />
      {children}
      {isDragActive && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-60 flex text-black font-bold text-xl p-8">
          <div className="border-2 border-dashed border-neutral-200 bg-white/85 rounded-lg p-4 w-full h-full flex items-center justify-center">
            Drop files here
          </div>
        </div>
      )}
    </div>
  );
}
