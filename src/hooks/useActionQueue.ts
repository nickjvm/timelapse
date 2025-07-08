import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { queueAction, runQueuedActions } from "@/utils/queue";

export default function useActionQueue() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    runQueuedActions();
    return runQueuedActions;
  }, [pathname, searchParams]);

  return { queueAction };
}
