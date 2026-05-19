import * as React from "react"
import { cn } from "@/lib/utils/cn"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Renders error styles when true; pair with aria-invalid for screen readers. */
  invalid?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-secondary-900",
        "placeholder:text-secondary-400 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:bg-secondary-50 disabled:opacity-60",
        invalid
          ? "border-error-500 focus-visible:ring-error-500"
          : "border-secondary-300 focus-visible:ring-primary-500",
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = "Input"
