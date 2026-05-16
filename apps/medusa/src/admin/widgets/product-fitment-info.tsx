import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { useCatalogContext } from "./_use-catalog-context"

type DetailProductDTO = { id: string }

/**
 * Vehicle fitment widget — shows the generations a product is linked to.
 * Brief #2 §12.
 *
 * Three states:
 *  - bike rack (no fitment): "Brak fitmentu — produkt uniwersalny"
 *  - standalone_wiring fits_all_vehicles=true: badge "Uniwersalny — pasuje do wszystkich aut"
 *  - linked to generations: list "Skoda Octavia 3 (2013-2019)"
 */
const ProductFitmentInfoWidget = ({ data }: { data: DetailProductDTO }) => {
  const { data: ctx, isLoading } = useCatalogContext(data.id)

  if (isLoading || !ctx) return null

  const isBikeRack = ctx.category === "bike_rack"
  const isUniversalWiring = ctx.category === "standalone_wiring" && ctx.standalone_wiring?.fits_all_vehicles === true

  return (
    <Container className="p-4">
      <Heading level="h3">Pasujące pojazdy</Heading>

      {isBikeRack ? (
        <Text size="small" className="mt-2 text-ui-fg-subtle">
          Bagażnik — brak fitmentu do auta, produkt uniwersalny.
        </Text>
      ) : isUniversalWiring ? (
        <div className="mt-2 flex flex-col gap-y-2">
          <Badge color="green" size="small">Uniwersalny — pasuje do wszystkich aut</Badge>
          <Text size="xsmall" className="text-ui-fg-subtle">
            Wiązka z flagą `fits_all_vehicles=true` — bez linków do generacji.
          </Text>
        </div>
      ) : ctx.generations.length === 0 ? (
        <Text size="small" className="mt-2 text-ui-fg-subtle">
          Produkt nie jest jeszcze powiązany z żadną generacją pojazdu.
        </Text>
      ) : (
        <ul className="mt-2 space-y-1">
          {ctx.generations.map((g) => (
            <li key={g.id} className="text-sm">
              <span className="text-ui-fg-base">{g.vehicle_full_name}</span>
              {g.body_type && <span className="ml-1 text-ui-fg-muted">· {g.body_type}</span>}
            </li>
          ))}
        </ul>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({ zone: "product.details.side.after" })
export default ProductFitmentInfoWidget
