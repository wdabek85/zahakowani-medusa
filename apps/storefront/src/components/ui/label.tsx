import * as React from "react"
import { cn } from "@/lib/utils/cn"

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  /** Shows red asterisk after the label text. */
  required?: boolean
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium text-secondary-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="ml-0.5 text-error-600" aria-hidden="true">*</span>}
    </label>
  ),
)
Label.displayName = "Label"
