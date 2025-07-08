import React from "react";
import { useDropzone } from "react-dropzone";
import useFrameUpload from "@/hooks/useFrameUpload";
import cn from "@/utils/cn";

type Props = {
  projectId: string;
  className?: string;
} & React.PropsWithChildren;
export default function Dropzone({ projectId, children, className }: Props) {
  const { upload: onDrop } = useFrameUpload({ projectId });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div {...getRootProps()} className={cn("h-full", className)}>
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
