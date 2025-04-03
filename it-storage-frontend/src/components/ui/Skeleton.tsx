import * as React from "react"
import { cn } from "@/app/utils/cn"

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("animate-pulse rounded-md bg-gray-100", className)}
    {...props}
  />
))
Skeleton.displayName = "Skeleton"

export { Skeleton }