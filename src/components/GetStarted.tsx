import { PiPlus } from "react-icons/pi";

type Props = {
  onClick: () => void;
};
export default function GetStarted({ onClick }: Props) {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto shadow-lg rounded-xl py-12 px-4 mt-8 bg-neutral-50 space-y-8 border border-neutral-200">
      <div className="text-center w-full">
        <h1 className="text-xl font-bold mb-2">👋 Hey there!</h1>
        <p>
          Start by creating a new project. You&apos;ll be redirected to your
          project page where you can upload your images.
        </p>
      </div>
      <button
        key="new-project"
        className=" bg-blue-500 text-white hover:bg-blue-800 whitespace-nowrap"
        onClick={onClick}
      >
        <PiPlus /> New Project
      </button>
    </div>
  );
}
