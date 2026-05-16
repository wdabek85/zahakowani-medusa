import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Text, Badge, IconButton, toast } from "@medusajs/ui"
import { ChevronDown, ChevronRight, PencilSquare, Trash, Plus } from "@medusajs/icons"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"

type GenerationNode = {
  id: string; code: string; name: string
  year_from: number; year_to: number | null; body_type: string | null
  years_label: string
  product_count: number
}
type ModelNode = {
  id: string; code: string; name: string
  generations: GenerationNode[]
  generation_count: number
  product_count: number
}
type BrandNode = {
  id: string; code: string; name: string; logo_url: string | null
  models: ModelNode[]
  model_count: number
  generation_count: number
  product_count: number
}

type TreeResponse = { brands: BrandNode[] }

const VehiclesTreePage = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set())
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set())

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-vehicles-tree"],
    queryFn: async (): Promise<TreeResponse> => {
      const r = await fetch("/admin/vehicle-fitment/tree", { credentials: "include" })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    },
  })

  const deleteBrand = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/admin/vehicle-fitment/brands/${id}`, { method: "DELETE", credentials: "include" })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
    },
    onSuccess: () => {
      toast.success("Marka usunięta")
      queryClient.invalidateQueries({ queryKey: ["admin-vehicles-tree"] })
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Błąd"),
  })

  const deleteModel = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/admin/vehicle-fitment/models/${id}`, { method: "DELETE", credentials: "include" })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
    },
    onSuccess: () => {
      toast.success("Model usunięty")
      queryClient.invalidateQueries({ queryKey: ["admin-vehicles-tree"] })
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Błąd"),
  })

  const deleteGen = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/admin/vehicle-fitment/generations/${id}`, { method: "DELETE", credentials: "include" })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
    },
    onSuccess: () => {
      toast.success("Generacja usunięta")
      queryClient.invalidateQueries({ queryKey: ["admin-vehicles-tree"] })
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Błąd"),
  })

  const toggleBrand = (id: string) => {
    setExpandedBrands((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  const toggleModel = (id: string) => {
    setExpandedModels((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Drzewo pojazdów</Heading>
        <Button asChild>
          <Link to="/vehicles/brands/create"><Plus className="mr-2" /> Dodaj markę</Link>
        </Button>
      </div>

      <div className="px-6 py-4">
        {isLoading ? (
          <Text className="py-12 text-center text-ui-fg-subtle">Ładowanie...</Text>
        ) : isError ? (
          <Text className="py-12 text-center text-ui-fg-error">
            {error instanceof Error ? error.message : "Błąd"}
          </Text>
        ) : !data || data.brands.length === 0 ? (
          <Text className="py-12 text-center text-ui-fg-subtle">
            Brak marek w bazie. Kliknij „Dodaj markę".
          </Text>
        ) : (
          <ul className="divide-y divide-ui-border-base">
            {data.brands.map((brand) => {
              const brandExpanded = expandedBrands.has(brand.id)
              return (
                <li key={brand.id} className="py-2">
                  <div className="flex items-center gap-x-2">
                    <button type="button" onClick={() => toggleBrand(brand.id)} className="flex-shrink-0">
                      {brandExpanded ? <ChevronDown /> : <ChevronRight />}
                    </button>
                    <div className="flex-1 flex items-center gap-x-2">
                      <Badge size="2xsmall">{brand.code}</Badge>
                      <span className="font-medium">{brand.name}</span>
                      <Text size="xsmall" className="text-ui-fg-muted">
                        ({brand.model_count} modeli, {brand.generation_count} generacji, {brand.product_count} produktów)
                      </Text>
                    </div>
                    <div className="inline-flex gap-x-1">
                      <Button size="small" variant="secondary" asChild>
                        <Link to={`/vehicles/models/create?brand_id=${brand.id}`}>
                          <Plus className="mr-1" /> Model
                        </Link>
                      </Button>
                      <IconButton size="small" variant="transparent" onClick={() => navigate(`/vehicles/brands/${brand.id}`)}>
                        <PencilSquare />
                      </IconButton>
                      <IconButton
                        size="small"
                        variant="transparent"
                        onClick={() => {
                          if (window.confirm(`Usunąć markę "${brand.name}"?`)) deleteBrand.mutate(brand.id)
                        }}
                        disabled={deleteBrand.isPending}
                      >
                        <Trash />
                      </IconButton>
                    </div>
                  </div>

                  {brandExpanded && brand.models.length > 0 && (
                    <ul className="ml-7 mt-2 space-y-1 border-l border-ui-border-base pl-4">
                      {brand.models.map((model) => {
                        const modelExpanded = expandedModels.has(model.id)
                        return (
                          <li key={model.id}>
                            <div className="flex items-center gap-x-2">
                              <button type="button" onClick={() => toggleModel(model.id)}>
                                {modelExpanded ? <ChevronDown /> : <ChevronRight />}
                              </button>
                              <div className="flex-1 flex items-center gap-x-2">
                                <Badge size="2xsmall">{model.code}</Badge>
                                <span className="text-sm">{model.name}</span>
                                <Text size="xsmall" className="text-ui-fg-muted">
                                  ({model.generation_count} generacji, {model.product_count} produktów)
                                </Text>
                              </div>
                              <div className="inline-flex gap-x-1">
                                <Button size="small" variant="secondary" asChild>
                                  <Link to={`/vehicles/generations/create?vehicle_model_id=${model.id}`}>
                                    <Plus className="mr-1" /> Generacja
                                  </Link>
                                </Button>
                                <IconButton size="small" variant="transparent" onClick={() => navigate(`/vehicles/models/${model.id}`)}>
                                  <PencilSquare />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  variant="transparent"
                                  onClick={() => {
                                    if (window.confirm(`Usunąć model "${model.name}"?`)) deleteModel.mutate(model.id)
                                  }}
                                  disabled={deleteModel.isPending}
                                >
                                  <Trash />
                                </IconButton>
                              </div>
                            </div>

                            {modelExpanded && model.generations.length > 0 && (
                              <ul className="ml-6 mt-1 space-y-1 border-l border-ui-border-base pl-4">
                                {model.generations.map((gen) => (
                                  <li key={gen.id} className="flex items-center gap-x-2 py-1">
                                    <div className="flex-1 flex items-center gap-x-2">
                                      <Badge size="2xsmall">{gen.code}</Badge>
                                      <span className="text-sm">{gen.name}</span>
                                      <Text size="xsmall" className="text-ui-fg-muted">
                                        ({gen.years_label}) — {gen.product_count} produktów
                                        {gen.body_type && <> · {gen.body_type}</>}
                                      </Text>
                                    </div>
                                    <div className="inline-flex gap-x-1">
                                      <IconButton size="small" variant="transparent" onClick={() => navigate(`/vehicles/generations/${gen.id}`)}>
                                        <PencilSquare />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        variant="transparent"
                                        onClick={() => {
                                          if (window.confirm(`Usunąć generację "${gen.name}"?`)) deleteGen.mutate(gen.id)
                                        }}
                                        disabled={deleteGen.isPending}
                                      >
                                        <Trash />
                                      </IconButton>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({ label: "Pojazdy" })
export default VehiclesTreePage
