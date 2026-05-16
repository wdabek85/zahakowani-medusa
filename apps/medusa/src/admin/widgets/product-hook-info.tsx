import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge, Button } from "@medusajs/ui"
import { ArrowUpRightOnBox } from "@medusajs/icons"
import { Link } from "react-router-dom"
import { useCatalogContext } from "./_use-catalog-context"

type DetailProductDTO = { id: string }

/**
 * Shows hook catalog info on the Medusa product detail page sidebar,
 * if the product is linked to a Hook. Brief #2 §11.
 *
 * Zone: product.details.side.after
 */
const ProductHookInfoWidget = ({ data }: { data: DetailProductDTO }) => {
  const { data: ctx, isLoading } = useCatalogContext(data.id)

  if (isLoading || !ctx || ctx.category !== "hook" || !ctx.hook) return null

  const h = ctx.hook

  return (
    <Container className="p-4">
      <div className="flex items-center justify-between">
        <Heading level="h3">Hak (katalog)</Heading>
        <Badge size="2xsmall">{h.catalog_number}</Badge>
      </div>
      <div className="mt-3 flex flex-col gap-y-1 text-sm">
        <Row label="Nazwa" value={h.name} />
        <Row label="Producent" value={h.manufacturer} />
        <Row label="Uciąg" value={`${h.pulling_capacity_kg} kg`} />
        <Row label="Nacisk" value={`${h.vertical_load_kg} kg`} />
        <Row label="Homologacja" value={h.homologation} />
        <Row label="Typ kuli" value={h.ball_type} />
        <Row label="Gwarancja" value={`${h.warranty_years} lat`} />
      </div>
      <Button asChild variant="secondary" size="small" className="mt-3 w-full">
        <Link to={`/hooks/${h.id}`}>
          Edytuj hak <ArrowUpRightOnBox className="ml-1" />
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
export default ProductHookInfoWidget
