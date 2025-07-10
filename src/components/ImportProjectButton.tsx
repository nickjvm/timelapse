import { LiaFileImportSolid } from "react-icons/lia";

import cn from "@/utils/cn";
import useProjectImport from "@/hooks/useProjectImport";

type Props = {
  label: string;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLLabelElement>;

export default function ImportButton({ label, className, ...props }: Props) {
  const { onChange } = useProjectImport();

  return (
    <label
      className={cn("group", className)}
      {...props}
      onClick={(e) => e.stopPropagation()}
    >
      {label}
      <LiaFileImportSolid className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
      <input
        type="file"
        accept=".json"
        onChange={onChange}
        className="hidden"
      />
    </label>
  );
}
