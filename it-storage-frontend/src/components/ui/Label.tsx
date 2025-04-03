// components/ui/label.tsx
import { cn } from "@/app/utils/cn"
import { ComponentPropsWithoutRef, ComponentRef, forwardRef } from "react"

export const Label = forwardRef<
  ComponentRef<"label">,
  ComponentPropsWithoutRef<"label">
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))
Label.displayName = "Label"