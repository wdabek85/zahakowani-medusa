import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Table, Badge, IconButton } from "@medusajs/ui"
import { PencilSquare } from "@medusajs/icons"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

type WiringEquipment = {
  id: string
  code: string
  type: "harness" | "module"
  pin_count: number
  name: string
  weight_kg: number
  homologation: string
}

const WiringEquipmentListingPage = () => {
  const navigate = useNavigate()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-wiring-equipment"],
    queryFn: async (): Promise<{ wiring_equipments: WiringEquipment[] }> => {
      const r = await fetch("/admin/wiring-equipment", { credentials: "include" })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    },
  })

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h1">Wiązki i moduły (warianty haka)</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          4 stałe rekordy używane jako warianty haka (BARE/W7/W13/M7/M13). Code, type i pin_count są niezmienne —
          zmiana rozwaliłaby istniejące produkty linkujące do tych rekordów przez metadata wariantu. Edytujesz tylko nazwę,
          wagę, opis, funkcje elektryczne, homologację i galerię.
        </Text>
      </div>

      <div className="px-6 py-4">
        {isLoading ? (
          <Text className="py-12 text-center text-ui-fg-subtle">Ładowanie...</Text>
        ) : isError ? (
          <Text className="py-12 text-center text-ui-fg-error">
            {error instanceof Error ? error.message : "Błąd"}
          </Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Code</Table.HeaderCell>
                <Table.HeaderCell>Typ</Table.HeaderCell>
                <Table.HeaderCell>Pin</Table.HeaderCell>
                <Table.HeaderCell>Nazwa</Table.HeaderCell>
                <Table.HeaderCell>Waga (kg)</Table.HeaderCell>
                <Table.HeaderCell>Homologacja</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Akcja</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data?.wiring_equipments.map((item) => (
                <Table.Row key={item.id} className="cursor-pointer" onClick={() => navigate(`/wiring-equipment/${item.id}`)}>
                  <Table.Cell><Badge size="2xsmall">{item.code}</Badge></Table.Cell>
                  <Table.Cell>{item.type === "module" ? "Moduł" : "Wiązka"}</Table.Cell>
                  <Table.Cell>{item.pin_count}-pin</Table.Cell>
                  <Table.Cell>{item.name}</Table.Cell>
                  <Table.Cell>{item.weight_kg}</Table.Cell>
                  <Table.Cell>{item.homologation}</Table.Cell>
                  <Table.Cell className="text-right">
                    <div onClick={(e) => e.stopPropagation()}>
                      <IconButton size="small" variant="transparent" onClick={() => navigate(`/wiring-equipment/${item.id}`)}>
                        <PencilSquare />
                      </IconButton>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({ label: "Wiązki/moduły" })
export default WiringEquipmentListingPage
