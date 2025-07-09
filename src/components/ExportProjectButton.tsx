"use client";

import useProject from "@/hooks/useProject";
import { LiaFileExportSolid } from "react-icons/lia";
import cn from "@/utils/cn";

type Props = {
  label: string;
  projectId: string;
  className?: string;
};
export default function ExportProjectButton({
  projectId,
  label,
  className,
}: Props) {
  const project = useProject(projectId);

  const exportProject = () => {
    if (!project) {
      return;
    }
    const jsonStr = JSON.stringify(project);

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(jsonStr)
    );
    element.setAttribute("download", `${project.name}.json`);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  };
  return (
    <button onClick={exportProject} className={cn("group", className)}>
      {label}
      <LiaFileExportSolid className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
