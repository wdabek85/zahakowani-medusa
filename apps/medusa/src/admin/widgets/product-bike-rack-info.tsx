import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge, Button } from "@medusajs/ui"
import { ArrowUpRightOnBox } from "@medusajs/icons"
import { Link } from "react-router-dom"
import { useCatalogContext } from "./_use-catalog-context"

type DetailProductDTO = { id: string }

/** Bike rack catalog info widget. Brief #2 §11. Zone: product.details.side.after */
const ProductBikeRackInfoWidget = ({ data }: { data: DetailProductDTO }) => {
  const { data: ctx, isLoading } = useCatalogContext(data.id)

  if (isLoading || !ctx || ctx.category !== "bike_rack" || !ctx.bike_rack) return null

  const b = ctx.bike_rack

  return (
    <Container className="p-4">
      <div className="flex items-center justify-between">
        <Heading level="h3">Bagażnik (katalog)</Heading>
        <Badge size="2xsmall">{b.catalog_number}</Badge>
      </div>
      <div className="mt-3 flex flex-col gap-y-1 text-sm">
        <Row label="Nazwa" value={b.name} />
        <Row label="Producent" value={b.manufacturer} />
        <Row label="Max rowerów" value={String(b.max_bikes)} />
        <Row label="Ładowność" value={`${b.max_total_load_kg} kg`} />
        <Row label="Gniazdo" value={b.power_socket} />
      </div>
      <Button asChild variant="secondary" size="small" className="mt-3 w-full">
        <Link to={`/bike-racks/${b.id}`}>
          Edytuj bagażnik <ArrowUpRightOnBox className="ml-1" />
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
export default ProductBikeRackInfoWidget
