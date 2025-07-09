import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { BsGear } from "react-icons/bs";
import ImportProjectButton from "./ImportProjectButton";
import { useParams, usePathname } from "next/navigation";
import ExportButton from "./ExportProjectButton";
import { MdDelete } from "react-icons/md";
import { useAppStore, useProjects } from "@/store";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/providers/Notifications";
import useActionQueue from "@/hooks/useActionQueue";

export default function SettingsMenu() {
  const pathname = usePathname();
  const { id } = useParams();
  const router = useRouter();
  const { queueAction } = useActionQueue();
  const { deleteProject } = useAppStore();
  const { addNotification } = useNotifications();
  const isHomePage = pathname === "/";

  const projects = useProjects();

  function handleDelete() {
    const project = projects.find((p) => p.id === id);

    if (!project) {
      return;
    }
    if (confirm("Are you sure you want to delete this project?")) {
      queueAction(() => {
        deleteProject(project.id);
        addNotification({
          message: `Project ${project.name} deleted.`,
          type: "success",
        });
      });
      router.push("/");
    }
  }

  return (
    <Menu>
      <MenuButton className="bg-neutral-200 !p-2.5">
        <BsGear className="w-5 h-5" />
      </MenuButton>

      <MenuItems
        transition
        anchor="bottom end"
        className="z-50 bg-neutral-200 rounded shadow mt-2 w-48 p-1"
      >
        {isHomePage && (
          <MenuItem>
            <ImportProjectButton
              label="Import Project"
              className="px-4 py-2 flex w-full justify-between items-center hover:bg-white/50 transition-colors"
            />
          </MenuItem>
        )}
        {id && (
          <MenuItem>
            <ExportButton
              label="Export Project"
              projectId={id as string}
              className="px-4 py-2 flex w-full justify-between items-center hover:bg-white/50 transition-colors"
            />
          </MenuItem>
        )}
        {id && (
          <MenuItem>
            <button
              className="group px-4 py-2 flex w-full justify-between items-center hover:bg-white/50 hover:text-red-700 transition-colors"
              onClick={handleDelete}
            >
              Delete Project
              <MdDelete className="w-5 h-5 group-hover:text-red-700 opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
          </MenuItem>
        )}
      </MenuItems>
    </Menu>
  );
}
