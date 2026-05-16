import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Badge, Text, IconButton, toast } from "@medusajs/ui"
import { RocketLaunch, Trash, ArrowLeft } from "@medusajs/icons"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { BikeRackForm } from "../_components/bike-rack-form"
import type { CreateBikeRackInput } from "../../../../validators/bike-rack"
import { PublishProductModal } from "../../../components/publish-product-modal"
import type { BikeRackCatalogItem } from "../../../components/publish-product-modal/types"

type LinkedProduct = {
  id: string; title: string; handle: string; status: string; thumbnail: string | null
}

type DetailResponse = {
  bike_rack: BikeRackCatalogItem & {
    catalog_number: string
    name: string
    manufacturer: string
    [k: string]: unknown
  }
  products: LinkedProduct[]
}

const EditBikeRackPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [publishOpen, setPublishOpen] = useState(false)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-bike-rack", id],
    queryFn: async (): Promise<DetailResponse> => {
      const r = await fetch(`/admin/bike-racks/${id}`, { credentials: "include" })
      if (r.status === 404) throw new Error("Bagażnik nie istnieje")
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    },
    enabled: Boolean(id),
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/admin/bike-racks/${id}`, { method: "DELETE", credentials: "include" })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
    },
    onSuccess: () => {
      toast.success("Bagażnik usunięty")
      queryClient.invalidateQueries({ queryKey: ["admin-bike-racks"] })
      navigate("/bike-racks")
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Błąd"),
  })

  if (isLoading) return <Container className="p-6"><Text>Ładowanie...</Text></Container>
  if (isError || !data) {
    return (
      <Container className="p-6">
        <Text className="text-ui-fg-error">{error instanceof Error ? error.message : "Błąd"}</Text>
        <Button asChild className="mt-4" variant="secondary">
          <Link to="/bike-racks"><ArrowLeft className="mr-2" /> Wróć</Link>
        </Button>
      </Container>
    )
  }

  const { bike_rack: bikeRack, products } = data

  const handleSubmit = async (values: CreateBikeRackInput) => {
    const r = await fetch(`/admin/bike-racks/${id}`, {
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
    queryClient.invalidateQueries({ queryKey: ["admin-bike-rack", id] })
    queryClient.invalidateQueries({ queryKey: ["admin-bike-racks"] })
  }

  const handleDelete = () => {
    if (window.confirm(`Usunąć bagażnik "${bikeRack.name}" (${bikeRack.catalog_number})?`)) {
      deleteMutation.mutate()
    }
  }

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between border-b border-ui-border-base px-6 py-4">
        <div className="flex items-center gap-x-3">
          <IconButton variant="transparent" asChild>
            <Link to="/bike-racks"><ArrowLeft /></Link>
          </IconButton>
          <div>
            <Heading level="h1">{bikeRack.name}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              <Badge size="2xsmall" className="mr-2">{bikeRack.catalog_number}</Badge>
              {bikeRack.manufacturer}
            </Text>
          </div>
        </div>
        <Button onClick={() => setPublishOpen(true)}>
          <RocketLaunch className="mr-2" /> Wystaw produkt
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BikeRackForm
            defaultValues={bikeRack as Partial<CreateBikeRackInput>}
            onSubmit={handleSubmit}
            submitLabel="Zapisz zmiany"
          />
        </div>

        <aside className="flex flex-col gap-y-4">
          <section className="rounded-lg border border-ui-border-base p-4">
            <Heading level="h3">Wystawione produkty</Heading>
            <Text size="small" className="mt-1 text-ui-fg-muted">
              Bagażnik jest uniwersalny — bez fitmentu do auta.
            </Text>
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
            <Text size="small" className="mt-2 text-ui-fg-subtle">
              Usunięcie nie usuwa wystawionych produktów.
            </Text>
            <Button variant="danger" className="mt-3 w-full" onClick={handleDelete} isLoading={deleteMutation.isPending}>
              <Trash className="mr-2" /> Usuń bagażnik
            </Button>
          </section>
        </aside>
      </div>

      <PublishProductModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        category="bike-rack"
        catalogItem={{ id: bikeRack.id, catalog_number: bikeRack.catalog_number, name: bikeRack.name }}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin-bike-rack", id] })}
      />
    </Container>
  )
}

export const config = defineRouteConfig({})
export default EditBikeRackPage
