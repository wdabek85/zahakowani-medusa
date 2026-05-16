import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Table, Badge, IconButton, toast, FocusModal } from "@medusajs/ui"
import { PencilSquare, RocketLaunch, Trash, MagnifyingGlass } from "@medusajs/icons"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { PublishProductModal } from "../../components/publish-product-modal"
import type { HookCatalogItem } from "../../components/publish-product-modal/types"

type HookListItem = HookCatalogItem & {
  pulling_capacity_kg: number
  vertical_load_kg: number
  homologation: string
  ball_type: string
  manufacturer: string
}

type ListResponse = {
  hooks: HookListItem[]
  count: number
  limit: number
  offset: number
}

const PAGE_SIZE = 20

const fetchHooks = async (params: URLSearchParams): Promise<ListResponse> => {
  const r = await fetch(`/admin/hooks?${params.toString()}`, { credentials: "include" })
  if (!r.ok) throw new Error(`Failed to load hooks: ${r.status}`)
  return r.json() as Promise<ListResponse>
}

const deleteHook = async (id: string): Promise<void> => {
  const r = await fetch(`/admin/hooks/${id}`, { method: "DELETE", credentials: "include" })
  if (!r.ok) throw new Error(`Failed to delete: ${r.status}`)
}

const HooksListingPage = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [publishTarget, setPublishTarget] = useState<HookCatalogItem | null>(null)

  const params = new URLSearchParams()
  if (search.trim()) params.set("q", search.trim())
  params.set("limit", String(PAGE_SIZE))
  params.set("offset", String(page * PAGE_SIZE))

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-hooks", search, page],
    queryFn: () => fetchHooks(params),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteHook,
    onSuccess: () => {
      toast.success("Hak usunięty")
      queryClient.invalidateQueries({ queryKey: ["admin-hooks"] })
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "Błąd usuwania")
    },
  })

  const handleDelete = (hook: HookListItem) => {
    if (window.confirm(`Czy na pewno usunąć hak "${hook.name}" (${hook.catalog_number})?`)) {
      deleteMutation.mutate(hook.id)
    }
  }

  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Katalog haków</Heading>
        </div>
        <Button asChild>
          <Link to="/hooks/create">Dodaj hak</Link>
        </Button>
      </div>

      <div className="px-6 py-3">
        <div className="relative max-w-md">
          <MagnifyingGlass className="absolute left-2 top-1/2 -translate-y-1/2 text-ui-fg-muted" />
          <Input
            type="text"
            placeholder="Szukaj po nr katalogowym, nazwie lub producencie..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            className="pl-8"
          />
        </div>
      </div>

      <div className="px-6 py-4">
        {isLoading ? (
          <div className="py-12 text-center text-ui-fg-subtle">Ładowanie...</div>
        ) : isError ? (
          <div className="py-12 text-center text-ui-fg-error">
            Błąd: {error instanceof Error ? error.message : "nieznany"}
          </div>
        ) : !data || data.hooks.length === 0 ? (
          <div className="py-12 text-center text-ui-fg-subtle">
            {search.trim() ? "Brak wyników dla zapytania." : "Brak haków w katalogu. Dodaj pierwszy."}
          </div>
        ) : (
          <>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Nr katalogowy</Table.HeaderCell>
                  <Table.HeaderCell>Nazwa</Table.HeaderCell>
                  <Table.HeaderCell>Producent</Table.HeaderCell>
                  <Table.HeaderCell>Uciąg</Table.HeaderCell>
                  <Table.HeaderCell>Nacisk</Table.HeaderCell>
                  <Table.HeaderCell>Homologacja</Table.HeaderCell>
                  <Table.HeaderCell>Typ kuli</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Akcje</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {data.hooks.map((hook) => (
                  <Table.Row
                    key={hook.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/hooks/${hook.id}`)}
                  >
                    <Table.Cell>
                      <Badge size="2xsmall">{hook.catalog_number}</Badge>
                    </Table.Cell>
                    <Table.Cell>{hook.name}</Table.Cell>
                    <Table.Cell>{hook.manufacturer}</Table.Cell>
                    <Table.Cell>{hook.pulling_capacity_kg} kg</Table.Cell>
                    <Table.Cell>{hook.vertical_load_kg} kg</Table.Cell>
                    <Table.Cell>{hook.homologation}</Table.Cell>
                    <Table.Cell>{hook.ball_type}</Table.Cell>
                    <Table.Cell className="text-right">
                      <div className="inline-flex gap-x-1" onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          size="small"
                          variant="transparent"
                          onClick={() => navigate(`/hooks/${hook.id}`)}
                          aria-label="Edytuj"
                        >
                          <PencilSquare />
                        </IconButton>
                        <IconButton
                          size="small"
                          variant="transparent"
                          onClick={() => setPublishTarget(hook)}
                          aria-label="Wystaw produkt"
                        >
                          <RocketLaunch />
                        </IconButton>
                        <IconButton
                          size="small"
                          variant="transparent"
                          onClick={() => handleDelete(hook)}
                          aria-label="Usuń"
                          disabled={deleteMutation.isPending}
                        >
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
                <span>
                  Strona {page + 1} z {totalPages} ({data.count} haków łącznie)
                </span>
                <div className="flex gap-x-2">
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    Poprzednia
                  </Button>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages - 1}
                  >
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
          category="hook"
          catalogItem={publishTarget}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["admin-hooks"] })
          }}
        />
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Haki",
})

export default HooksListingPage
