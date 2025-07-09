import { ChangeEvent } from "react";
import { LiaFileImportSolid } from "react-icons/lia";

import { Project, useAppStore } from "@/store";
import { useNotifications } from "@/providers/Notifications";
import cn from "@/utils/cn";

type Props = {
  label: string;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLLabelElement>;

export default function ImportButton({ label, className, ...props }: Props) {
  const { addProject } = useAppStore();
  const { addNotification } = useNotifications();

  const validateJson = (json: Project) => {
    const hasName = !!json.name;
    const hasFrames = Array.isArray(json.frames);

    const hasValidFrames = json.frames.every((frame) => {
      const hasImage = typeof frame.image === "string";
      const hasPosition =
        typeof frame.position?.x === "number" &&
        typeof frame.position?.y === "number";
      const hasRotation = typeof frame.rotation === "number";
      const hasScale = typeof frame.scale === "number";
      return hasImage && hasPosition && hasRotation && hasScale;
    });
    if (!hasName || !hasFrames || !hasValidFrames) {
      return false;
    }
    return json;
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = validateJson(JSON.parse(e.target?.result as string));
        if (json) {
          addProject({
            name: json.name,
            frames: json.frames.map((frame) => ({
              id: crypto.randomUUID(),
              image: frame.image,
              caption: frame.caption || "",
              hidden: !!frame.hidden,
              position: {
                x: frame.position?.x || 0,
                y: frame.position?.y || 0,
              },
              rotation: frame.rotation || 0,
              scale: frame.scale || 1,
            })),
          });

          addNotification({
            message: `Project ${json.name} imported.`,
            type: "success",
          });
        }
      } catch (e) {
        console.log(e);
        addNotification({
          message: "Unable to validate imported project file.",
          type: "error",
        });
      }
    };

    reader.readAsText(file);
  };

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
