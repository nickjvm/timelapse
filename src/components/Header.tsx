import { useState } from "react";
import Link from "next/link";
import { FaArrowLeftLong } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import cn from "@/utils/cn";

type Props = {
  title: string;
  buttons: React.ReactNode[];
  prevUrl?: string;
  onEdit?: (value: string) => void;
  sticky?: boolean;
};

export default function Header({
  title,
  buttons,
  prevUrl,
  onEdit,
  sticky = true,
}: Props) {
  const [editing, setEditing] = useState<boolean>(false);

  return (
    <div
      className={cn("top-0 z-50 bg-white shadow w-full", sticky && "sticky")}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between p-4 gap-2">
        {prevUrl && (
          <Link href={prevUrl} className="inline-block mr-2">
            <FaArrowLeftLong />
          </Link>
        )}
        <h2 className="text-xl font-bold w-full">
          {!onEdit && title}
          {onEdit && (
            <>
              {!editing && (
                <button
                  onClick={() => setEditing(!editing)}
                  className="group !p-0"
                >
                  {title}
                  <MdEdit className="opacity-30 transition-opacity group-hover:opacity-100 w-5 h-5" />
                </button>
              )}
              {editing && (
                <input
                  autoFocus
                  type="text"
                  value={title}
                  onChange={(e) => onEdit(e.target.value)}
                  onBlur={() => setEditing(!editing)}
                  className="w-full p-2 block -my-2 -ml-2"
                />
              )}
            </>
          )}
        </h2>
        {buttons}
      </div>
    </div>
  );
}
