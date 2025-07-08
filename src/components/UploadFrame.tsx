import { ChangeEvent } from "react";
import { MdCloudUpload } from "react-icons/md";
import { useAppStore } from "@/store";
import useProject from "@/hooks/useProject";
import compressAndEncodeFile from "@/utils/compressFileUpload";

type Props = {
  projectId: string;
};
export default function UploadFrame({ projectId }: Props) {
  const project = useProject(projectId);
  const { updateProject } = useAppStore();

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }

    const frames = [];
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
    updateProject(projectId, {
      frames: [...(project?.frames || []), ...frames],
    });
  };

  return (
    <div className="block w-full relative shrink-0">
      <label className="relative block aspect-[calc(3/4)] w-full border border-dashed border-neutral-200 overflow-hidden bg-neutral-50 cursor-pointer">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-neutral-400 flex items-center flex-col gap-2">
          <MdCloudUpload className="w-8 h-8" />
          <span className="text-sm text-center">Upload an image</span>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="absolute top-0 left-0 right-0 bottom-0 hidden opacity-0"
        />
      </label>
    </div>
  );
}
