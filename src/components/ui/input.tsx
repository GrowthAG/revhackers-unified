import * as React from "react"
import { cn } from "@/lib/utils"

/*
 * Input - Design System RevHackers
 * Radius: 4px (rounded = --radius base)
 * Ring: revgreen no focus
 * Zero !important. Zero appearance overrides global.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded border border-zinc-200 bg-white",
          "px-3 py-2 text-sm text-zinc-900",
          "placeholder:text-zinc-400",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-revgreen focus-visible:ring-offset-0 focus-visible:border-revgreen",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-zinc-900",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
