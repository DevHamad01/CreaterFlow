import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * @typedef {React.ComponentPropsWithoutRef<"textarea">} TextareaProps
 */

/** @type {React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>} */
const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-24 w-full resize-y rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
))
Textarea.displayName = "Textarea"

export { Textarea }
export default Textarea
