import { ArrowRight, Check, Rocket } from "lucide-react"
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Container,
  Input,
  Label,
} from "@/components/ui"

/**
 * Iteracja 2 placeholder/showcase.
 *
 * Strona główna w realnym layoucie powstanie w iteracji 6 (Faza 3B).
 * Tu showcase atomów UI z iteracji 2 — szybka wizualna weryfikacja że
 * Button/Input/Label/Badge/Card/Container + ikony lucide-react renderują się
 * poprawnie z design tokenami z `tailwind.config.ts`.
 */
export default function HomePage() {
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

  return (
    <main className="py-12">
      <Container size="narrow" className="space-y-12">
        <header>
          <Badge variant="primary" className="mb-2">Faza 3 · Iteracja 2</Badge>
          <h1 className="text-display-md font-bold text-secondary-900">
            zahakowani — storefront
          </h1>
          <p className="mt-3 text-lg text-secondary-600">
            Atomy UI zainstalowane: <code className="rounded bg-secondary-100 px-1.5 py-0.5 text-sm">@/components/ui</code>.
            Strona główna w iteracji 6 (Faza 3B).
          </p>
        </header>

        {/* Showcase — Buttons */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-secondary-900">Buttons</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="link">Link</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">
              <Rocket className="h-4 w-4" /> Z ikoną
            </Button>
            <Button>
              Wystaw produkt <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Showcase — Form */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-secondary-900">Form atoms</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email" required>Email</Label>
              <Input id="email" type="email" placeholder="ty@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" type="tel" placeholder="+48 ..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bad">Pole z błędem</Label>
              <Input id="bad" invalid placeholder="invalid state" />
              <p className="text-xs text-error-600">Niepoprawna wartość</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="disabled">Disabled</Label>
              <Input id="disabled" disabled value="readonly" readOnly />
            </div>
          </div>
        </section>

        {/* Showcase — Badges */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-secondary-900">Badges</h2>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">
              <Check className="mr-1 h-3 w-3" /> Autoryzowany dystrybutor
            </Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Brak w magazynie</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge size="sm" variant="primary">Sam hak</Badge>
            <Badge size="md" variant="primary">Z modułem 13-Pin</Badge>
            <Badge size="lg" variant="primary">+3 warianty</Badge>
          </div>
        </section>

        {/* Showcase — Card */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-secondary-900">Card</h2>
          <Card>
            <CardHeader>
              <CardTitle>Hak Westfalia W/200</CardTitle>
              <CardDescription>VW Golf 7 (2012–2019) · uciąg 1500 kg</CardDescription>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-secondary-700">
                Przykładowa karta — w iteracji 7 ProductCard dostanie galerię,
                ikony parametrów, badge wariantów i AddToCart.
              </p>
            </CardBody>
            <CardFooter className="justify-between">
              <div>
                <p className="text-2xl font-semibold text-secondary-900">650,00 zł</p>
                <p className="text-xs text-secondary-500">cena zawiera 23% VAT</p>
              </div>
              <Button>Zobacz produkt</Button>
            </CardFooter>
          </Card>
        </section>

        <footer className="border-t border-secondary-200 pt-6 text-sm text-secondary-500">
          <p>
            Backend Medusy:{" "}
            <a href={`${backendUrl}/app`} className="text-primary-600 hover:underline" target="_blank" rel="noreferrer">
              {backendUrl}/app ↗
            </a>
          </p>
          <p className="mt-1">
            Następna iteracja: <span className="font-medium text-secondary-700">3 — Medusa client + constants + variant-wiring helper</span>.
          </p>
        </footer>
      </Container>
    </main>
  )
}
