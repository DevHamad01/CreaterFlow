import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-semibold leading-none tracking-tight text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

/**
 * @type {React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & React.RefAttributes<React.ElementRef<typeof LabelPrimitive.Root>>>}
 */
const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
