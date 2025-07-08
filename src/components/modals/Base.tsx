import { Dialog, DialogTitle, DialogPanel } from "@headlessui/react";
import cn from "@/utils/cn";
import { RiCloseLargeLine } from "react-icons/ri";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  variant?: "dark" | "light";
} & React.PropsWithChildren;

export function BaseModal({
  open,
  onClose,
  children,
  title,
  className,
  variant = "light",
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <button
            onClick={onClose}
            className="z-10 absolute top-4 right-4 text-white !p-4 opacity-50 hover:opacity-100"
          >
            <RiCloseLargeLine className="w-5 h-5" />
          </button>
          <DialogPanel
            className={cn(
              `mx-auto w-full self-stretch rounded p-4 relative`,
              variant === "dark" && "bg-black/90 text-white",
              variant === "light" && "bg-white",
              className
            )}
          >
            {title && (
              <DialogTitle className="text-xl font-bold p-4">
                {title}
              </DialogTitle>
            )}
            {children}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
