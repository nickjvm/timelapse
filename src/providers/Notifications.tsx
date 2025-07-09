"use client";

import {
  useContext,
  createContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { IoCloseOutline } from "react-icons/io5";

import cn from "@/utils/cn";

type Notification = {
  title?: string;
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  timeout?: number;
  dismissable?: boolean;
};

type NotificationContext = {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
};

const NotificationContext = createContext<NotificationContext | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export default function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const id = crypto.randomUUID();
      setNotifications((prev) => [
        ...prev,
        { id, timeout: 5000, dismissable: true, ...notification },
      ]);

      return id;
    },
    []
  );

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
      }}
    >
      {children}
      <div className="fixed bottom-4 right-4 z-100 left-4 flex flex-col gap-2 justify-end items-end">
        {notifications.map((notification) => (
          <Notification key={notification.id} notification={notification} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

function Notification({ notification }: { notification: Notification }) {
  const { removeNotification } = useNotifications();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (notification.timeout) {
      timeoutRef.current = setTimeout(
        () => removeNotification(notification.id),
        notification.timeout
      );
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [notification.id, notification.timeout, removeNotification]);
  return (
    <div
      key={notification.id}
      className={cn(
        "bg-white  rounded p-4 shadow-lg text-white",
        "flex w-full min-w-xs sm:w-auto sm:max-w-md space-x-2 items-start",
        notification.type === "success" && "bg-green-600/90",
        notification.type === "error" && "bg-red-600/90",
        notification.type === "warning" && "bg-yellow-600/90",
        notification.type === "info" && "bg-blue-600/90"
      )}
    >
      <div className="w-full">
        {notification.title && (
          <p className="font-bold mb-1">{notification.title}</p>
        )}
        <p>{notification.message}</p>
      </div>
      {notification.dismissable && (
        <button
          type="button"
          onClick={() => removeNotification(notification.id)}
          className="!p-2 -my-2 -mr-2 hover:bg-black/20 rounded transition-colors"
        >
          <IoCloseOutline className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
