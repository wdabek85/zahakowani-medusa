import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

/**
 * Button atom — shadcn/ui style with CVA variants.
 *
 * Variants per brief #3 §1: jeden `<Button variant="..." size="..." />`, zero
 * `<RedButton>` / `<BlueButton>`. Asterisk `asChild` props pattern dodamy gdy
 * potrzebne (np. `<Button asChild><Link/></Button>`) — w iteracji 4 z Header.
 */
const buttonVariants = cva(
  // Base — applied always.
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800",
        secondary: "border border-secondary-300 bg-white text-secondary-900 shadow-sm hover:bg-secondary-50 active:bg-secondary-100",
        ghost: "text-secondary-700 hover:bg-secondary-100 active:bg-secondary-200",
        danger: "bg-error-600 text-white shadow-sm hover:bg-error-500",
        link: "text-primary-600 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
)

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
)
Button.displayName = "Button"

export { buttonVariants }
