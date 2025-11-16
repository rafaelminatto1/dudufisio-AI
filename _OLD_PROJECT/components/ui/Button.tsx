import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fisio-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-70 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:shadow-md dark:ring-offset-gray-900",
  {
    variants: {
      variant: {
        default: "bg-fisio-primary text-white hover:bg-fisio-primary-600 shadow-sm dark:bg-fisio-primary-400 dark:hover:bg-fisio-primary-500",
        destructive:
          "bg-fisio-error text-white hover:bg-fisio-error-600 shadow-sm dark:bg-red-600 dark:hover:bg-red-700",
        outline:
          "border-2 border-fisio-primary bg-white text-fisio-primary hover:bg-fisio-primary-50 dark:bg-gray-900 dark:border-fisio-primary-400 dark:text-fisio-primary-400 dark:hover:bg-gray-800",
        secondary:
          "bg-fisio-secondary text-white hover:bg-fisio-secondary-600 shadow-sm dark:bg-fisio-secondary-400 dark:hover:bg-fisio-secondary-500",
        ghost: "hover:bg-fisio-neutral-100 text-fisio-neutral-700 dark:hover:bg-gray-800 dark:text-gray-300",
        link: "text-fisio-primary underline-offset-4 hover:underline dark:text-fisio-primary-400",
        // FisioFlow variants
        success: "bg-fisio-secondary text-white hover:bg-fisio-secondary-600 shadow-sm dark:bg-green-600 dark:hover:bg-green-700",
        warning: "bg-fisio-warning text-white hover:bg-fisio-warning-600 shadow-sm dark:bg-yellow-600 dark:hover:bg-yellow-700",
        info: "bg-fisio-primary-400 text-white hover:bg-fisio-primary-500 shadow-sm dark:bg-blue-600 dark:hover:bg-blue-700",
        danger: "bg-fisio-error text-white hover:bg-fisio-error-600 shadow-sm dark:bg-red-600 dark:hover:bg-red-700",
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
