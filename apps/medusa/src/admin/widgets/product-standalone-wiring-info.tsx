import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge, Button } from "@medusajs/ui"
import { ArrowUpRightOnBox } from "@medusajs/icons"
import { Link } from "react-router-dom"
import { useCatalogContext } from "./_use-catalog-context"

type DetailProductDTO = { id: string }

/** Standalone wiring info widget. Brief #2 §11. Zone: product.details.side.after */
const ProductStandaloneWiringInfoWidget = ({ data }: { data: DetailProductDTO }) => {
  const { data: ctx, isLoading } = useCatalogContext(data.id)

  if (isLoading || !ctx || ctx.category !== "standalone_wiring" || !ctx.standalone_wiring) return null

  const sw = ctx.standalone_wiring
  const typeLabel = sw.type === "module" ? "Moduł" : "Wiązka"

  return (
    <Container className="p-4">
      <div className="flex items-center justify-between">
        <Heading level="h3">Wiązka (katalog)</Heading>
        <Badge size="2xsmall">{sw.catalog_number}</Badge>
      </div>
      <div className="mt-3 flex flex-col gap-y-1 text-sm">
        <Row label="Nazwa" value={sw.name} />
        <Row label="Producent" value={sw.manufacturer} />
        <Row label="Typ" value={`${typeLabel} ${sw.pin_count}-Pin`} />
        <Row label="Homologacja" value={sw.homologation} />
        <Row label="Uniwersalna" value={sw.fits_all_vehicles ? "Tak" : "Nie"} />
      </div>
      <Button asChild variant="secondary" size="small" className="mt-3 w-full">
        <Link to={`/standalone-wiring/${sw.id}`}>
          Edytuj wiązkę <ArrowUpRightOnBox className="ml-1" />
        </Link>
      </Button>
    </Container>
  )
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-x-2">
    <Text size="xsmall" className="text-ui-fg-muted">{label}</Text>
    <Text size="xsmall" className="text-ui-fg-base">{value}</Text>
  </div>
)

export const config = defineWidgetConfig({ zone: "product.details.side.after" })
export default ProductStandaloneWiringInfoWidget
