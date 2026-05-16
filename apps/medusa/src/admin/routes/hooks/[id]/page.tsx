import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Badge, Text, IconButton, toast } from "@medusajs/ui"
import { RocketLaunch, Trash, ArrowLeft } from "@medusajs/icons"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { HookForm } from "../_components/hook-form"
import type { CreateHookInput } from "../../../../validators/hook"
import { PublishProductModal } from "../../../components/publish-product-modal"
import type { HookCatalogItem } from "../../../components/publish-product-modal/types"

type LinkedGeneration = {
  id: string
  code: string
  name: string
  years_label: string
  vehicle_full_name: string
}

type LinkedProduct = {
  id: string
  title: string
  handle: string
  status: string
  thumbnail: string | null
}

type HookDetailResponse = {
  hook: HookCatalogItem & {
    catalog_number: string
    name: string
    manufacturer: string
    [k: string]: unknown
  }
  generations: LinkedGeneration[]
  products: LinkedProduct[]
}

const fetchHook = async (id: string): Promise<HookDetailResponse> => {
  const r = await fetch(`/admin/hooks/${id}`, { credentials: "include" })
  if (r.status === 404) throw new Error("Hak nie istnieje")
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json() as Promise<HookDetailResponse>
}

const updateHook = async (id: string, values: Partial<CreateHookInput>): Promise<void> => {
  const r = await fetch(`/admin/hooks/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(values),
  })
  if (!r.ok) {
    const body = (await r.json()) as { error?: string }
    throw new Error(body.error ?? `HTTP ${r.status}`)
  }
}

const deleteHook = async (id: string): Promise<void> => {
  const r = await fetch(`/admin/hooks/${id}`, { method: "DELETE", credentials: "include" })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
}

const EditHookPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [publishOpen, setPublishOpen] = useState(false)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-hook", id],
    queryFn: () => fetchHook(id!),
    enabled: Boolean(id),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteHook(id!),
    onSuccess: () => {
      toast.success("Hak usunięty")
      queryClient.invalidateQueries({ queryKey: ["admin-hooks"] })
      navigate("/hooks")
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Błąd usuwania"),
  })

  if (isLoading) {
    return <Container className="p-6"><Text>Ładowanie...</Text></Container>
  }
  if (isError || !data) {
    return (
      <Container className="p-6">
        <Text className="text-ui-fg-error">
          {error instanceof Error ? error.message : "Błąd"}
        </Text>
        <Button asChild className="mt-4" variant="secondary">
          <Link to="/hooks"><ArrowLeft className="mr-2" /> Wróć do listy</Link>
        </Button>
      </Container>
    )
  }

  const { hook, generations, products } = data

  const handleSubmit = async (values: CreateHookInput) => {
    await updateHook(id!, values)
    toast.success("Zapisano zmiany")
    queryClient.invalidateQueries({ queryKey: ["admin-hook", id] })
    queryClient.invalidateQueries({ queryKey: ["admin-hooks"] })
  }

  const handleDelete = () => {
    if (window.confirm(`Czy na pewno usunąć hak "${hook.name}" (${hook.catalog_number})?`)) {
      deleteMutation.mutate()
    }
  }

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between border-b border-ui-border-base px-6 py-4">
        <div className="flex items-center gap-x-3">
          <IconButton variant="transparent" asChild>
            <Link to="/hooks" aria-label="Wróć do listy"><ArrowLeft /></Link>
          </IconButton>
          <div>
            <Heading level="h1">{hook.name}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              <Badge size="2xsmall" className="mr-2">{hook.catalog_number}</Badge>
              {hook.manufacturer}
            </Text>
          </div>
        </div>
        <Button onClick={() => setPublishOpen(true)}>
          <RocketLaunch className="mr-2" /> Wystaw produkt
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HookForm
            defaultValues={hook as Partial<CreateHookInput>}
            onSubmit={handleSubmit}
            submitLabel="Zapisz zmiany"
          />
        </div>

        <aside className="flex flex-col gap-y-4">
          <section className="rounded-lg border border-ui-border-base p-4">
            <Heading level="h3">Pasujące pojazdy</Heading>
            {generations.length === 0 ? (
              <Text size="small" className="mt-2 text-ui-fg-subtle">
                Hak nie jest jeszcze wystawiony dla żadnej generacji. Kliknij „Wystaw produkt", aby utworzyć produkt dla wybranych aut.
              </Text>
            ) : (
              <ul className="mt-2 space-y-1">
                {generations.map((g) => (
                  <li key={g.id} className="text-sm text-ui-fg-base">• {g.vehicle_full_name}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-ui-border-base p-4">
            <Heading level="h3">Wystawione produkty</Heading>
            {products.length === 0 ? (
              <Text size="small" className="mt-2 text-ui-fg-subtle">
                Brak wystawionych produktów dla tego haka.
              </Text>
            ) : (
              <ul className="mt-2 space-y-2">
                {products.map((p) => (
                  <li key={p.id} className="rounded border border-ui-border-base p-2">
                    <Link
                      to={`/products/${p.id}`}
                      className="text-sm text-ui-fg-interactive hover:underline"
                    >
                      {p.title}
                    </Link>
                    <div className="mt-1">
                      <Badge size="2xsmall">{p.status}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-ui-border-error p-4">
            <Heading level="h3">Strefa niebezpieczna</Heading>
            <Text size="small" className="mt-2 text-ui-fg-subtle">
              Usunięcie haka nie usuwa wystawionych produktów. Te trzeba usunąć osobno z listy produktów.
            </Text>
            <Button
              variant="danger"
              className="mt-3 w-full"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              <Trash className="mr-2" /> Usuń hak
            </Button>
          </section>
        </aside>
      </div>

      <PublishProductModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        category="hook"
        catalogItem={{
          id: hook.id,
          catalog_number: hook.catalog_number,
          name: hook.name,
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["admin-hook", id] })
        }}
      />
    </Container>
  )
}

export const config = defineRouteConfig({})

export default EditHookPage
