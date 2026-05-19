import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

/**
 * Badge atom — kompaktowy tag/chip pod variant labels na ProductCard
 * ("Sam hak", "Z modułem 13-Pin"), status badges ("Uniwersalny"), countery,
 * etc. (brief #3 §7.4, §6.7, §9.1).
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      variant: {
        primary: "bg-primary-50 text-primary-700 ring-primary-200",
        secondary: "bg-secondary-100 text-secondary-700 ring-secondary-200",
        success: "bg-success-50 text-success-600 ring-success-500/30",
        warning: "bg-warning-50 text-warning-600 ring-warning-500/30",
        error: "bg-error-50 text-error-600 ring-error-500/30",
        outline: "bg-white text-secondary-700 ring-secondary-300",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
)

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { badgeVariants }
