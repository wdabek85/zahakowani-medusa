import { Button, Checkbox, IconButton, Input, Label, Text, clx } from "@medusajs/ui"
import { ChevronDown, ChevronRight, MagnifyingGlass, XMark } from "@medusajs/icons"
import { useEffect, useMemo, useState } from "react"
import type { VehicleBrand, VehicleGeneration, VehicleModel } from "./types"

export type VehiclePickerProps = {
  selectedGenerationIds: string[]
  onSelectionChange: (ids: string[]) => void
  showSelectAll?: boolean
  label?: string
  required?: boolean
}

type LookupResponse = { brands: VehicleBrand[] }

const fetchLookup = async (): Promise<VehicleBrand[]> => {
  const r = await fetch("/admin/vehicle-fitment/lookup", { credentials: "include" })
  if (!r.ok) throw new Error(`Failed to load vehicles: ${r.status}`)
  const body = (await r.json()) as LookupResponse
  return body.brands ?? []
}

/**
 * Cascading Brand → Model → Generation multi-select. Search filters generations
 * by name/model/brand (case-insensitive); matching nodes auto-expand. Selected
 * generations show as chips above the tree with individual remove buttons.
 *
 * Brief #2 §8.
 */
export const VehiclePicker = ({
  selectedGenerationIds,
  onSelectionChange,
  showSelectAll,
  label,
  required,
}: VehiclePickerProps) => {
  const [brands, setBrands] = useState<VehicleBrand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set())
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    let cancelled = false
    fetchLookup()
      .then((data) => {
        if (cancelled) return
        setBrands(data)
        setLoading(false)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const selectedSet = useMemo(() => new Set(selectedGenerationIds), [selectedGenerationIds])

  const generationById = useMemo(() => {
    const map = new Map<string, { generation: VehicleGeneration; model: VehicleModel; brand: VehicleBrand }>()
    for (const b of brands) {
      for (const m of b.models) {
        for (const g of m.generations) {
          map.set(g.id, { generation: g, model: m, brand: b })
        }
      }
    }
    return map
  }, [brands])

  const filteredBrands = useMemo<VehicleBrand[]>(() => {
    if (!searchQuery.trim()) return brands
    const q = searchQuery.toLowerCase()
    return brands
      .map((b) => {
        const brandMatches = b.name.toLowerCase().includes(q)
        const models = b.models
          .map((m) => {
            const modelMatches = m.name.toLowerCase().includes(q) || brandMatches
            const generations = m.generations.filter(
              (g) =>
                modelMatches
                || g.name.toLowerCase().includes(q)
                || g.years_label.includes(q),
            )
            return { ...m, generations }
          })
          .filter((m) => m.generations.length > 0)
        return { ...b, models }
      })
      .filter((b) => b.models.length > 0)
  }, [brands, searchQuery])

  useEffect(() => {
    if (!searchQuery.trim()) return
    const eb = new Set<string>()
    const em = new Set<string>()
    for (const b of filteredBrands) {
      eb.add(b.id)
      for (const m of b.models) em.add(m.id)
    }
    setExpandedBrands(eb)
    setExpandedModels(em)
  }, [searchQuery, filteredBrands])

  const allGenerationIds = useMemo(
    () => brands.flatMap((b) => b.models.flatMap((m) => m.generations.map((g) => g.id))),
    [brands],
  )

  const toggleGeneration = (id: string) => {
    const next = new Set(selectedGenerationIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange(Array.from(next))
  }

  const removeGeneration = (id: string) => {
    onSelectionChange(selectedGenerationIds.filter((x) => x !== id))
  }

  const selectAll = () => onSelectionChange(allGenerationIds)
  const clearAll = () => onSelectionChange([])

  const toggleBrand = (id: string) => {
    setExpandedBrands((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleModel = (id: string) => {
    setExpandedModels((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) return <Text size="small" className="text-ui-fg-subtle">Ładowanie listy pojazdów...</Text>
  if (error) return <Text size="small" className="text-ui-fg-error">Błąd: {error}</Text>

  return (
    <div className="flex flex-col gap-y-3">
      {label && (
        <Label className="text-ui-fg-subtle">
          {label} {required && <span className="text-ui-fg-error">*</span>}
        </Label>
      )}

      {selectedGenerationIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-ui-border-base bg-ui-bg-subtle p-2">
          <Text size="xsmall" className="text-ui-fg-muted">
            Wybrano ({selectedGenerationIds.length}):
          </Text>
          {selectedGenerationIds.map((id) => {
            const entry = generationById.get(id)
            if (!entry) return null
            const { brand, model, generation } = entry
            return (
              <span
                key={id}
                className="inline-flex items-center gap-x-1 rounded-full bg-ui-bg-base px-2 py-0.5 text-xs text-ui-fg-base shadow-sm"
              >
                {brand.name} {model.name} {generation.name} ({generation.years_label})
                <IconButton
                  size="xsmall"
                  variant="transparent"
                  type="button"
                  onClick={() => removeGeneration(id)}
                  aria-label={`Usuń ${generation.name}`}
                >
                  <XMark />
                </IconButton>
              </span>
            )
          })}
          <Button size="small" variant="transparent" type="button" onClick={clearAll}>
            Wyczyść wszystkie
          </Button>
        </div>
      )}

      <div className="flex items-center gap-x-2">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-2 top-1/2 -translate-y-1/2 text-ui-fg-muted" />
          <Input
            type="text"
            placeholder="Szukaj marki / modelu / generacji..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        {showSelectAll && (
          <Button size="small" variant="secondary" type="button" onClick={selectAll}>
            Zaznacz wszystkie auta
          </Button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto rounded-md border border-ui-border-base">
        {filteredBrands.length === 0 ? (
          <Text size="small" className="p-3 text-ui-fg-subtle">
            {searchQuery ? "Brak wyników dla \"" + searchQuery + "\"." : "Brak pojazdów w katalogu."}
          </Text>
        ) : (
          <ul className="divide-y divide-ui-border-base">
            {filteredBrands.map((brand) => {
              const brandExpanded = expandedBrands.has(brand.id)
              const brandTotalGens = brand.models.reduce((acc, m) => acc + m.generations.length, 0)
              const brandSelectedGens = brand.models.reduce(
                (acc, m) => acc + m.generations.filter((g) => selectedSet.has(g.id)).length,
                0,
              )
              return (
                <li key={brand.id} className="py-1">
                  <button
                    type="button"
                    onClick={() => toggleBrand(brand.id)}
                    className="flex w-full items-center gap-x-2 rounded px-2 py-1 text-left hover:bg-ui-bg-base-hover"
                  >
                    {brandExpanded ? <ChevronDown /> : <ChevronRight />}
                    <span className="font-medium text-ui-fg-base">{brand.name}</span>
                    <span className="ml-auto text-xs text-ui-fg-muted">
                      {brandSelectedGens > 0 ? `${brandSelectedGens}/${brandTotalGens}` : brandTotalGens}
                    </span>
                  </button>
                  {brandExpanded && (
                    <ul className="ml-5 mt-1 space-y-0.5 border-l border-ui-border-base pl-3">
                      {brand.models.map((model) => {
                        const modelExpanded = expandedModels.has(model.id)
                        const modelSelected = model.generations.filter((g) => selectedSet.has(g.id)).length
                        return (
                          <li key={model.id}>
                            <button
                              type="button"
                              onClick={() => toggleModel(model.id)}
                              className="flex w-full items-center gap-x-2 rounded px-2 py-0.5 text-left text-sm hover:bg-ui-bg-base-hover"
                            >
                              {modelExpanded ? <ChevronDown /> : <ChevronRight />}
                              <span className="text-ui-fg-base">{model.name}</span>
                              <span className="ml-auto text-xs text-ui-fg-muted">
                                {modelSelected > 0
                                  ? `${modelSelected}/${model.generations.length}`
                                  : model.generations.length}
                              </span>
                            </button>
                            {modelExpanded && (
                              <ul className="ml-5 space-y-0.5 border-l border-ui-border-base pl-3">
                                {model.generations.map((g) => {
                                  const selected = selectedSet.has(g.id)
                                  return (
                                    <li key={g.id}>
                                      <label
                                        className={clx(
                                          "flex cursor-pointer items-center gap-x-2 rounded px-2 py-1 text-sm",
                                          selected ? "bg-ui-bg-base-pressed" : "hover:bg-ui-bg-base-hover",
                                        )}
                                      >
                                        <Checkbox
                                          checked={selected}
                                          onCheckedChange={() => toggleGeneration(g.id)}
                                        />
                                        <span className="text-ui-fg-base">{g.name}</span>
                                        <span className="text-ui-fg-muted">({g.years_label})</span>
                                        {g.body_type && (
                                          <span className="ml-auto text-xs text-ui-fg-muted">{g.body_type}</span>
                                        )}
                                      </label>
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
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
