// components/ui/popover.tsx
import * as React from 'react'
import { cn } from '@/app/utils/cn'

const Popover = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("relative z-50", className)}
      {...props}
    >
      {children}
    </div>
  )
})
Popover.displayName = "Popover"

const PopoverTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { onOpenChange: React.Dispatch<React.SetStateAction<boolean>>}
>(({ onOpenChange, className, ...props }, ref) => (
  <div
    onClick={()=>onOpenChange(prev=>!prev)}
    ref={ref}
    className={cn("inline-block", className)}
    {...props}
  />
))
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {open: boolean;}
>(({ open,className, ...props }, ref) => {
  if (!open) return null
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 w-72 rounded-md border bg-white p-4 shadow-md outline-none",
        className
      )}
      {...props}
    />
  )
} )
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }