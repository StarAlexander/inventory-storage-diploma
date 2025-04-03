"use client"

import { X } from "lucide-react";
import { useState } from "react";

type AlertType = "success" | "error" | "info" | "warning";

interface AlertProps {
  type: AlertType;
  message: string;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const alertStyles = {
  success: {
    bg: "bg-green-50",
    border: "border-green-400",
    text: "text-green-700",
    icon: "text-green-500",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-400",
    text: "text-red-700",
    icon: "text-red-500",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-400",
    text: "text-blue-700",
    icon: "text-blue-500",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-400",
    text: "text-yellow-700",
    icon: "text-yellow-500",
  },
};

export function Alert({
  type,
  message,
  className = "",
  dismissible = false,
  onDismiss,
}: AlertProps) {
  const [visible, setVisible] = useState(true);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  return (
    <div
      className={`${alertStyles[type].bg} ${alertStyles[type].border} border-l-4 p-4 rounded ${className}`}
      role="alert"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {type === "success" && (
            <svg
              className={`h-5 w-5 ${alertStyles[type].icon}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {type === "error" && (
            <svg
              className={`h-5 w-5 ${alertStyles[type].icon}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {type === "info" && (
            <svg
              className={`h-5 w-5 ${alertStyles[type].icon}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {type === "warning" && (
            <svg
              className={`h-5 w-5 ${alertStyles[type].icon}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <p className={`text-sm ${alertStyles[type].text}`}>{message}</p>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <button
              onClick={handleDismiss}
              className={`-mx-1.5 -my-1.5 inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${alertStyles[type].bg} ${alertStyles[type].text} p-1.5 hover:bg-opacity-80`}
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}