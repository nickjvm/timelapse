import { MdCloudUpload } from "react-icons/md";
import useFrameUpload from "@/hooks/useFrameUpload";

type Props = {
  projectId: string;
};
export default function UploadFrame({ projectId }: Props) {
  const { onChange } = useFrameUpload({ projectId });

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
          onChange={onChange}
          className="absolute top-0 left-0 right-0 bottom-0 hidden opacity-0"
        />
      </label>
    </div>
  );
}
