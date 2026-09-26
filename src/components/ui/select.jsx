import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * @typedef {React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>} SelectProps
 * @typedef {React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>} SelectTriggerProps
 * @typedef {React.ComponentPropsWithoutRef<typeof SelectPrimitive.Group>} SelectGroupProps
 * @typedef {React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>} SelectValueProps
 * @typedef {React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>} SelectContentProps
 * @typedef {React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>} SelectLabelProps
 * @typedef {React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>} SelectItemProps
 * @typedef {React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>} SelectSeparatorProps
 * @typedef {React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>} SelectScrollButtonProps
 * @typedef {React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>} SelectScrollDownButtonProps
 */

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

/**
 * @type {React.ForwardRefExoticComponent<SelectTriggerProps & React.RefAttributes<HTMLButtonElement>>}
 */
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-input bg-card px-3 py-2.5 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground [&>span]:line-clamp-1 [&>span]:text-left",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown aria-hidden="true" className="h-4 w-4 flex-shrink-0 opacity-60" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

/** @type {React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton> & React.RefAttributes<HTMLDivElement>>} */
const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

/** @type {React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton> & React.RefAttributes<HTMLDivElement>>} */
const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

/** @type {React.ForwardRefExoticComponent<SelectContentProps & React.RefAttributes<HTMLDivElement>>} */
const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-80 min-w-[8rem] overflow-hidden rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

/**
 * @param {React.ComponentPropsWithoutRef<"div">} props
 */
const SelectLabel = ({ className, ...props }) => (
  <SelectPrimitive.Label
    className={cn("px-2 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground", className)}
    {...props}
  />
)
SelectLabel.displayName = SelectPrimitive.Label.displayName

/** @type {React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & React.RefAttributes<HTMLDivElement>>} */
const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-lg py-2 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-muted focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check aria-hidden="true" className="h-4 w-4 text-primary" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

/**
 * @param {React.ComponentPropsWithoutRef<"div">} props
 */
const SelectSeparator = ({ className, ...props }) => (
  <SelectPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
)
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
