import { PiPlus } from "react-icons/pi";
import useFrameUpload from "@/hooks/useFrameUpload";

type Props = {
  projectId: string;
};
export default function EmptyProject({ projectId }: Props) {
  const { onChange } = useFrameUpload({ projectId });

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto shadow-lg rounded-xl py-12 px-4 mt-8 bg-neutral-50 space-y-8 border border-neutral-200">
      <div className="text-center w-full">
        <h1 className="text-xl font-bold mb-2">Your timeline is empty!</h1>
        <p>
          To get started, upload some images. You can drag images on to this
          screen or click the button below.
        </p>
      </div>
      <label
        key="new-project"
        className=" bg-blue-500 text-white hover:bg-blue-800 whitespace-nowrap px-4 py-2 rounded flex items-center gap-2 cursor-pointer"
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={onChange}
          className="absolute top-0 left-0 right-0 bottom-0 hidden opacity-0"
        />
        <PiPlus /> Upload
      </label>
    </div>
  );
}
