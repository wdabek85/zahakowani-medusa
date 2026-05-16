import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Table, Badge, IconButton, toast } from "@medusajs/ui"
import { PencilSquare, RocketLaunch, Trash, MagnifyingGlass } from "@medusajs/icons"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { PublishProductModal } from "../../components/publish-product-modal"
import type { BikeRackCatalogItem } from "../../components/publish-product-modal/types"

type BikeRackListItem = BikeRackCatalogItem & {
  manufacturer: string
  max_bikes: number
  max_total_load_kg: number
  power_socket: string
  has_tilt_function: boolean
}

type ListResponse = { bike_racks: BikeRackListItem[]; count: number }

const PAGE_SIZE = 20

const BikeRacksListingPage = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [publishTarget, setPublishTarget] = useState<BikeRackCatalogItem | null>(null)

  const params = new URLSearchParams()
  if (search.trim()) params.set("q", search.trim())
  params.set("limit", String(PAGE_SIZE))
  params.set("offset", String(page * PAGE_SIZE))

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-bike-racks", search, page],
    queryFn: async (): Promise<ListResponse> => {
      const r = await fetch(`/admin/bike-racks?${params.toString()}`, { credentials: "include" })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/admin/bike-racks/${id}`, { method: "DELETE", credentials: "include" })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
    },
    onSuccess: () => {
      toast.success("Bagażnik usunięty")
      queryClient.invalidateQueries({ queryKey: ["admin-bike-racks"] })
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Błąd usuwania"),
  })

  const handleDelete = (item: BikeRackListItem) => {
    if (window.confirm(`Usunąć bagażnik "${item.name}" (${item.catalog_number})?`)) {
      deleteMutation.mutate(item.id)
    }
  }

  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Katalog bagażników rowerowych</Heading>
        <Button asChild>
          <Link to="/bike-racks/create">Dodaj bagażnik</Link>
        </Button>
      </div>

      <div className="px-6 py-3">
        <div className="relative max-w-md">
          <MagnifyingGlass className="absolute left-2 top-1/2 -translate-y-1/2 text-ui-fg-muted" />
          <Input
            type="text"
            placeholder="Szukaj po nr katalogowym / nazwie / producencie..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="pl-8"
          />
        </div>
      </div>

      <div className="px-6 py-4">
        {isLoading ? (
          <div className="py-12 text-center text-ui-fg-subtle">Ładowanie...</div>
        ) : isError ? (
          <div className="py-12 text-center text-ui-fg-error">
            {error instanceof Error ? error.message : "Błąd"}
          </div>
        ) : !data || data.bike_racks.length === 0 ? (
          <div className="py-12 text-center text-ui-fg-subtle">
            Brak bagażników w katalogu.
          </div>
        ) : (
          <>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Nr katalogowy</Table.HeaderCell>
                  <Table.HeaderCell>Nazwa</Table.HeaderCell>
                  <Table.HeaderCell>Producent</Table.HeaderCell>
                  <Table.HeaderCell>Rowerów</Table.HeaderCell>
                  <Table.HeaderCell>Ładowność</Table.HeaderCell>
                  <Table.HeaderCell>Gniazdo</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Akcje</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {data.bike_racks.map((item) => (
                  <Table.Row key={item.id} className="cursor-pointer" onClick={() => navigate(`/bike-racks/${item.id}`)}>
                    <Table.Cell><Badge size="2xsmall">{item.catalog_number}</Badge></Table.Cell>
                    <Table.Cell>{item.name}</Table.Cell>
                    <Table.Cell>{item.manufacturer}</Table.Cell>
                    <Table.Cell>{item.max_bikes}</Table.Cell>
                    <Table.Cell>{item.max_total_load_kg} kg</Table.Cell>
                    <Table.Cell>{item.power_socket}</Table.Cell>
                    <Table.Cell className="text-right">
                      <div className="inline-flex gap-x-1" onClick={(e) => e.stopPropagation()}>
                        <IconButton size="small" variant="transparent" onClick={() => navigate(`/bike-racks/${item.id}`)}>
                          <PencilSquare />
                        </IconButton>
                        <IconButton size="small" variant="transparent" onClick={() => setPublishTarget(item)}>
                          <RocketLaunch />
                        </IconButton>
                        <IconButton size="small" variant="transparent" onClick={() => handleDelete(item)} disabled={deleteMutation.isPending}>
                          <Trash />
                        </IconButton>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm text-ui-fg-subtle">
                <span>Strona {page + 1} z {totalPages} ({data.count} bagażników)</span>
                <div className="flex gap-x-2">
                  <Button size="small" variant="secondary" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                    Poprzednia
                  </Button>
                  <Button size="small" variant="secondary" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>
                    Następna
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {publishTarget && (
        <PublishProductModal
          open={Boolean(publishTarget)}
          onClose={() => setPublishTarget(null)}
          category="bike-rack"
          catalogItem={publishTarget}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin-bike-racks"] })}
        />
      )}
    </Container>
  )
}

export const config = defineRouteConfig({ label: "Bagażniki" })
export default BikeRacksListingPage
