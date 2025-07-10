import useFrameUpload from "@/hooks/useFrameUpload";
import { PiPlus } from "react-icons/pi";

type Props = {
  onSuccess?: (id: string) => void;
};
export default function GetStarted({ onSuccess }: Props) {
  const { onChange } = useFrameUpload("", {
    onSuccess,
  });

  return (
    <div className="flex flex-col items-center justify-center w-[95vw] max-w-lg mx-auto shadow-lg rounded-xl py-12 px-4 mt-8 bg-neutral-50 space-y-8 border border-neutral-200 mb-8">
      <div className="text-center w-full">
        <h1 className="text-xl font-bold mb-2">👋 Hey there!</h1>
        <p>
          Either drag some photos here or click the button below to upload some
          photos and start your first timeline!
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
        <PiPlus /> Select Photos
      </label>
    </div>
  );
}
