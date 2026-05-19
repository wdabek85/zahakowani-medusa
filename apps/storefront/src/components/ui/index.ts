/**
 * Barrel re-export atomów UI. Import np:
 *   import { Button, Input, Badge } from "@/components/ui"
 *
 * Pliki per komponent zostawiają deep-import też możliwym
 * (`from "@/components/ui/button"` dla tree-shaking gdy by potrzebne).
 */
export { Button, buttonVariants, type ButtonProps } from "./button"
export { Input, type InputProps } from "./input"
export { Label, type LabelProps } from "./label"
export { Badge, badgeVariants, type BadgeProps } from "./badge"
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
} from "./card"
export { Container, type ContainerProps } from "./container"
