import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Micro-interaction baseline. Three things matter here for 60fps:
  //
  // 1. `transition-[...]` lists properties explicitly instead of using
  //    `transition-all`. `transition-all` also transitions layout-affecting
  //    properties (margin, width, padding, font-size), so any state that
  //    changes one of those forces a synchronous reflow mid-interaction. The
  //    list below is transform + paint only, which stays on the compositor.
  // 2. Only `transform` moves. No `top`/`margin` shifting, so a hover never
  //    reflows the button's siblings.
  // 3. `touch-action: manipulation` (see index.css `.btn-micro`) removes the
  //    legacy 300ms double-tap wait on touch devices, and `hover:` in Tailwind
  //    v3.4+ is already scoped behind `@media (hover: hover)` so hover states
  //    don't stick after a tap.
  "btn-micro inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-[transform,box-shadow,background-color,border-color,color,opacity] duration-200 ease-smooth disabled:pointer-events-none disabled:opacity-50 disabled:saturate-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-iris text-primary-foreground shadow-glow hover:brightness-[1.07] hover:shadow-glow-lg hover:-translate-y-px active:translate-y-0 active:scale-[0.98] active:brightness-100",
        secondary:
          "bg-secondary text-secondary-foreground border border-border/70 hover:bg-muted hover:-translate-y-px active:translate-y-0",
        outline:
          "border border-input bg-card text-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-[0.98]",
        ghost:
          "text-muted-foreground hover:bg-primary/10 hover:text-primary active:bg-primary/15",
        destructive:
          "bg-danger text-danger-foreground shadow-xs hover:bg-danger/90 hover:-translate-y-px active:translate-y-0",
        link:
          "text-primary underline-offset-4 hover:underline hover:text-iris",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-9 rounded-lg px-3.5 text-[13px]",
        lg: "h-12 rounded-xl px-7 text-[15px]",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * @typedef {import("class-variance-authority").VariantProps<typeof buttonVariants>} ButtonVariants
 * @typedef {React.ComponentPropsWithoutRef<"button"> & ButtonVariants & { asChild?: boolean }} ButtonProps
 */

/** @type {React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>} */
const Button = React.forwardRef((props, ref) => {
  const { className, variant, size, asChild = false, ...rest } = props
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...rest}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
