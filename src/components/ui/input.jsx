import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * @typedef {React.InputHTMLAttributes<HTMLInputElement>} InputProps
 */

/**
 * @type {React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>}
 */
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-foreground shadow-xs transition-[border-color,box-shadow] duration-200 ease-smooth",
        "placeholder:text-muted-foreground",
        "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
