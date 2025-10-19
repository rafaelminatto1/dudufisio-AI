import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fisio-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:shadow-md",
  {
    variants: {
      variant: {
        default: "bg-fisio-primary-DEFAULT text-white hover:bg-fisio-primary-600 shadow-sm",
        destructive:
          "bg-fisio-error-DEFAULT text-white hover:bg-fisio-error-600 shadow-sm",
        outline:
          "border-2 border-fisio-primary-DEFAULT bg-white text-fisio-primary-DEFAULT hover:bg-fisio-primary-50",
        secondary:
          "bg-fisio-secondary-DEFAULT text-white hover:bg-fisio-secondary-600 shadow-sm",
        ghost: "hover:bg-fisio-neutral-100 text-fisio-neutral-700",
        link: "text-fisio-primary-DEFAULT underline-offset-4 hover:underline",
        // FisioFlow variants
        success: "bg-fisio-secondary-DEFAULT text-white hover:bg-fisio-secondary-600 shadow-sm",
        warning: "bg-fisio-warning-DEFAULT text-white hover:bg-fisio-warning-600 shadow-sm",
        info: "bg-fisio-primary-400 text-white hover:bg-fisio-primary-500 shadow-sm",
        danger: "bg-fisio-error-DEFAULT text-white hover:bg-fisio-error-600 shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
