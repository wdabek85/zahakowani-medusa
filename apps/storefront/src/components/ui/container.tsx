import * as React from "react"
import { cn } from "@/lib/utils/cn"

/**
 * Container atom — max-width wrapper z poziomym paddingiem. Używany
 * jako outer wrapper sekcji strony (Header content, Hero, listingi, etc.).
 *
 * Tailwind ma `.container` class skonfigurowaną w `tailwind.config.ts`
 * z `screens.2xl: 1280px`. Tu opakowanie semantyczne (`<div>` lub
 * `<section>`/`<main>` przez asElement prop w przyszłości).
 */
export type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Max-width preset. Default `default` matches Tailwind container (1280px). */
  size?: "narrow" | "default" | "wide" | "full"
}

const SIZE_CLASS: Record<NonNullable<ContainerProps["size"]>, string> = {
  narrow: "max-w-3xl",
  default: "max-w-screen-2xl",
  wide: "max-w-screen-2xl 2xl:max-w-[1440px]",
  full: "max-w-none",
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mx-auto w-full px-4 lg:px-8", SIZE_CLASS[size], className)}
      {...props}
    />
  ),
)
Container.displayName = "Container"
