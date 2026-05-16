import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Badge, Text, IconButton, toast } from "@medusajs/ui"
import { RocketLaunch, Trash, ArrowLeft } from "@medusajs/icons"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { StandaloneWiringForm } from "../_components/standalone-wiring-form"
import type { CreateStandaloneWiringInput } from "../../../../validators/standalone-wiring"
import { PublishProductModal } from "../../../components/publish-product-modal"
import type { StandaloneWiringCatalogItem } from "../../../components/publish-product-modal/types"

type LinkedGen = { id: string; vehicle_full_name: string }
type LinkedProduct = { id: string; title: string; handle: string; status: string }

type DetailResponse = {
  standalone_wiring: StandaloneWiringCatalogItem & {
    catalog_number: string; name: string; manufacturer: string
    [k: string]: unknown
  }
  generations: LinkedGen[]
  products: LinkedProduct[]
}

const EditStandaloneWiringPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [publishOpen, setPublishOpen] = useState(false)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-standalone-wiring", id],
    queryFn: async (): Promise<DetailResponse> => {
      const r = await fetch(`/admin/standalone-wiring/${id}`, { credentials: "include" })
      if (r.status === 404) throw new Error("Wiązka nie istnieje")
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    },
    enabled: Boolean(id),
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/admin/standalone-wiring/${id}`, { method: "DELETE", credentials: "include" })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
    },
    onSuccess: () => {
      toast.success("Wiązka usunięta")
      queryClient.invalidateQueries({ queryKey: ["admin-standalone-wiring"] })
      navigate("/standalone-wiring")
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Błąd"),
  })

  if (isLoading) return <Container className="p-6"><Text>Ładowanie...</Text></Container>
  if (isError || !data) {
    return (
      <Container className="p-6">
        <Text className="text-ui-fg-error">{error instanceof Error ? error.message : "Błąd"}</Text>
        <Button asChild className="mt-4" variant="secondary">
          <Link to="/standalone-wiring"><ArrowLeft className="mr-2" /> Wróć</Link>
        </Button>
      </Container>
    )
  }

  const { standalone_wiring: wiring, generations, products } = data

  const handleSubmit = async (values: CreateStandaloneWiringInput) => {
    const r = await fetch(`/admin/standalone-wiring/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    })
    if (!r.ok) {
      const body = (await r.json()) as { error?: string }
      throw new Error(body.error ?? `HTTP ${r.status}`)
    }
    toast.success("Zapisano zmiany")
    queryClient.invalidateQueries({ queryKey: ["admin-standalone-wiring", id] })
    queryClient.invalidateQueries({ queryKey: ["admin-standalone-wiring"] })
  }

  const handleDelete = () => {
    if (window.confirm(`Usunąć wiązkę "${wiring.name}"?`)) {
      deleteMutation.mutate()
    }
  }

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between border-b border-ui-border-base px-6 py-4">
        <div className="flex items-center gap-x-3">
          <IconButton variant="transparent" asChild>
            <Link to="/standalone-wiring"><ArrowLeft /></Link>
          </IconButton>
          <div>
            <Heading level="h1">{wiring.name}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              <Badge size="2xsmall" className="mr-2">{wiring.catalog_number}</Badge>
              {wiring.manufacturer}
              {wiring.fits_all_vehicles && <Badge color="green" size="2xsmall" className="ml-2">UNIWERSALNA</Badge>}
            </Text>
          </div>
        </div>
        <Button onClick={() => setPublishOpen(true)}>
          <RocketLaunch className="mr-2" /> Wystaw produkt
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StandaloneWiringForm
            defaultValues={wiring as Partial<CreateStandaloneWiringInput>}
            onSubmit={handleSubmit}
            submitLabel="Zapisz zmiany"
          />
        </div>

        <aside className="flex flex-col gap-y-4">
          <section className="rounded-lg border border-ui-border-base p-4">
            <Heading level="h3">Pasujące pojazdy</Heading>
            {wiring.fits_all_vehicles ? (
              <Text size="small" className="mt-2 text-ui-fg-subtle">
                Produkt uniwersalny — pasuje do wszystkich aut. Brak fitmentu w bazie.
              </Text>
            ) : generations.length === 0 ? (
              <Text size="small" className="mt-2 text-ui-fg-subtle">
                Brak wystawionych produktów dla tej wiązki — wybierz generacje przy "Wystaw produkt".
              </Text>
            ) : (
              <ul className="mt-2 space-y-1">
                {generations.map((g) => (
                  <li key={g.id} className="text-sm">• {g.vehicle_full_name}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-ui-border-base p-4">
            <Heading level="h3">Wystawione produkty</Heading>
            {products.length === 0 ? (
              <Text size="small" className="mt-2 text-ui-fg-subtle">Brak wystawionych produktów.</Text>
            ) : (
              <ul className="mt-2 space-y-2">
                {products.map((p) => (
                  <li key={p.id} className="rounded border border-ui-border-base p-2">
                    <Link to={`/products/${p.id}`} className="text-sm text-ui-fg-interactive hover:underline">
                      {p.title}
                    </Link>
                    <div className="mt-1"><Badge size="2xsmall">{p.status}</Badge></div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-ui-border-error p-4">
            <Heading level="h3">Strefa niebezpieczna</Heading>
            <Button variant="danger" className="mt-3 w-full" onClick={handleDelete} isLoading={deleteMutation.isPending}>
              <Trash className="mr-2" /> Usuń wiązkę
            </Button>
          </section>
        </aside>
      </div>

      <PublishProductModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        category="standalone-wiring"
        catalogItem={{
          id: wiring.id,
          catalog_number: wiring.catalog_number,
          name: wiring.name,
          fits_all_vehicles: wiring.fits_all_vehicles,
        }}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin-standalone-wiring", id] })}
      />
    </Container>
  )
}

export const config = defineRouteConfig({})
export default EditStandaloneWiringPage
