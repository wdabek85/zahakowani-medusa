import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Table, Badge, IconButton, toast } from "@medusajs/ui"
import { PencilSquare, RocketLaunch, Trash, MagnifyingGlass } from "@medusajs/icons"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { PublishProductModal } from "../../components/publish-product-modal"
import type { StandaloneWiringCatalogItem } from "../../components/publish-product-modal/types"

type SwListItem = StandaloneWiringCatalogItem & {
  manufacturer: string
  type: "harness" | "module"
  pin_count: number
  homologation: string
}

const PAGE_SIZE = 20

const StandaloneWiringListingPage = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [publishTarget, setPublishTarget] = useState<StandaloneWiringCatalogItem | null>(null)

  const params = new URLSearchParams()
  if (search.trim()) params.set("q", search.trim())
  params.set("limit", String(PAGE_SIZE))
  params.set("offset", String(page * PAGE_SIZE))

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-standalone-wiring", search, page],
    queryFn: async (): Promise<{ standalone_wirings: SwListItem[]; count: number }> => {
      const r = await fetch(`/admin/standalone-wiring?${params.toString()}`, { credentials: "include" })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/admin/standalone-wiring/${id}`, { method: "DELETE", credentials: "include" })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
    },
    onSuccess: () => {
      toast.success("Wiązka usunięta")
      queryClient.invalidateQueries({ queryKey: ["admin-standalone-wiring"] })
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Błąd"),
  })

  const handleDelete = (item: SwListItem) => {
    if (window.confirm(`Usunąć wiązkę "${item.name}" (${item.catalog_number})?`)) {
      deleteMutation.mutate(item.id)
    }
  }

  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Katalog wiązek i modułów (standalone)</Heading>
        <Button asChild>
          <Link to="/standalone-wiring/create">Dodaj wiązkę</Link>
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
          <div className="py-12 text-center text-ui-fg-error">{error instanceof Error ? error.message : "Błąd"}</div>
        ) : !data || data.standalone_wirings.length === 0 ? (
          <div className="py-12 text-center text-ui-fg-subtle">Brak wiązek w katalogu.</div>
        ) : (
          <>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Nr katalogowy</Table.HeaderCell>
                  <Table.HeaderCell>Nazwa</Table.HeaderCell>
                  <Table.HeaderCell>Producent</Table.HeaderCell>
                  <Table.HeaderCell>Typ</Table.HeaderCell>
                  <Table.HeaderCell>Pin</Table.HeaderCell>
                  <Table.HeaderCell>Uniwersalny</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Akcje</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {data.standalone_wirings.map((item) => (
                  <Table.Row key={item.id} className="cursor-pointer" onClick={() => navigate(`/standalone-wiring/${item.id}`)}>
                    <Table.Cell><Badge size="2xsmall">{item.catalog_number}</Badge></Table.Cell>
                    <Table.Cell>{item.name}</Table.Cell>
                    <Table.Cell>{item.manufacturer}</Table.Cell>
                    <Table.Cell>{item.type === "module" ? "Moduł" : "Wiązka"}</Table.Cell>
                    <Table.Cell>{item.pin_count}-pin</Table.Cell>
                    <Table.Cell>
                      {item.fits_all_vehicles ? <Badge color="green" size="2xsmall">TAK</Badge> : <Badge color="grey" size="2xsmall">NIE</Badge>}
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <div className="inline-flex gap-x-1" onClick={(e) => e.stopPropagation()}>
                        <IconButton size="small" variant="transparent" onClick={() => navigate(`/standalone-wiring/${item.id}`)}>
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
                <span>Strona {page + 1} z {totalPages} ({data.count} wiązek)</span>
                <div className="flex gap-x-2">
                  <Button size="small" variant="secondary" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>Poprzednia</Button>
                  <Button size="small" variant="secondary" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>Następna</Button>
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
          category="standalone-wiring"
          catalogItem={publishTarget}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin-standalone-wiring"] })}
        />
      )}
    </Container>
  )
}

export const config = defineRouteConfig({ label: "Wiązki standalone" })
export default StandaloneWiringListingPage
