"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import {
  useBrands,
  useGenerations,
  useModels,
  type Brand,
  type Generation,
  type Model,
} from "@/lib/medusa/queries"

/**
 * Cascading Brand → Model → Generation selector.
 * Figma: node 407:1330 (Wariant=Hero, 620px wide).
 *
 * Behavior:
 *  - Step 1 active by default. Step N+1 unlocks when step N is selected.
 *  - Choosing a higher step resets all dependent selections.
 *  - "SZUKAJ" enabled only when all three are selected → router.push to
 *    /szukaj?vehicle_id={generationId} (generation = leaf fitment identifier).
 */

type StepState = "active" | "selected" | "disabled"

function StepRow({
  index,
  label,
  state,
  selectedLabel,
  options,
  onChange,
  isLoading,
}: {
  index: 1 | 2 | 3
  label: string
  state: StepState
  selectedLabel?: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  isLoading?: boolean
}) {
  const isDisabled = state === "disabled"
  const displayText = state === "selected" ? selectedLabel : label

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-between bg-white p-2 rounded-[2px] border",
        state === "active" ? "border-accent-600" : "border-secondary-200",
        isDisabled && "opacity-60",
      )}
    >
      <div className="flex flex-1 items-center gap-2">
        <span
          aria-hidden
          className={cn(
            "flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full text-sm leading-none text-white",
            state === "active" ? "bg-accent-600" : "bg-secondary-300",
          )}
        >
          {index}
        </span>
        <span className="flex-1 truncate text-sm leading-4 text-black">
          {isLoading ? "Ładowanie…" : displayText}
        </span>
      </div>
      <span className="flex items-center border-l border-secondary-200 pl-2 text-secondary-500">
        <ChevronDown className="h-[22px] w-[22px]" strokeWidth={2} aria-hidden />
      </span>
      {/* Native select layered on top — receives clicks, shows native picker on mobile. */}
      <select
        className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        disabled={isDisabled || isLoading}
        value=""
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      >
        <option value="" disabled hidden>
          {label}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function VehicleSelector({ className }: { className?: string }) {
  const router = useRouter()
  const [brand, setBrand] = useState<Pick<Brand, "id" | "code" | "name"> | null>(null)
  const [model, setModel] = useState<Pick<Model, "id" | "code" | "name"> | null>(null)
  const [generation, setGeneration] = useState<
    Pick<Generation, "id" | "name" | "years_label"> | null
  >(null)

  const { data: brands = [], isLoading: brandsLoading } = useBrands()
  const { data: models = [], isLoading: modelsLoading } = useModels(brand?.code ?? null)
  const { data: generations = [], isLoading: genLoading } = useGenerations(model?.id ?? null)

  function handleBrand(value: string) {
    const next = brands.find((b) => b.id === value)
    if (!next) return
    setBrand({ id: next.id, code: next.code, name: next.name })
    setModel(null)
    setGeneration(null)
  }

  function handleModel(value: string) {
    const next = models.find((m) => m.id === value)
    if (!next) return
    setModel({ id: next.id, code: next.code, name: next.name })
    setGeneration(null)
  }

  function handleGeneration(value: string) {
    const next = generations.find((g) => g.id === value)
    if (!next) return
    setGeneration({ id: next.id, name: next.name, years_label: next.years_label })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!generation) return
    router.push(`/szukaj?vehicle_id=${generation.id}`)
  }

  const stepState = (selected: boolean, prevSelected: boolean): StepState => {
    if (selected) return "selected"
    if (prevSelected) return "active"
    return "disabled"
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full max-w-[620px] flex-col gap-4 bg-secondary-50 px-4 py-6",
        className,
      )}
      aria-label="Wyszukiwarka po modelu pojazdu"
    >
      <p className="font-heading text-base font-medium leading-[18px] text-black">
        Wybierz model pojazdu,
        <br />
        aby wyszukać część
      </p>

      <div className="flex w-full flex-col gap-2">
        <StepRow
          index={1}
          label="Wybierz markę"
          state={stepState(!!brand, true)}
          selectedLabel={brand?.name}
          options={brands.map((b) => ({ value: b.id, label: b.name }))}
          onChange={handleBrand}
          isLoading={brandsLoading}
        />
        <StepRow
          index={2}
          label="Wybierz model"
          state={stepState(!!model, !!brand)}
          selectedLabel={model?.name}
          options={models.map((m) => ({ value: m.id, label: m.name }))}
          onChange={handleModel}
          isLoading={modelsLoading && !!brand}
        />
        <StepRow
          index={3}
          label="Wybierz rok pojazdu"
          state={stepState(!!generation, !!model)}
          selectedLabel={
            generation ? `${generation.name} (${generation.years_label})` : undefined
          }
          options={generations.map((g) => ({
            value: g.id,
            label: `${g.name} (${g.years_label})`,
          }))}
          onChange={handleGeneration}
          isLoading={genLoading && !!model}
        />
      </div>

      <button
        type="submit"
        disabled={!generation}
        className={cn(
          "flex w-full items-center justify-center border border-primary-900 px-6 py-2",
          "font-cta text-base font-medium leading-[26px] text-white",
          "bg-primary-800 transition-colors hover:bg-primary-900",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary-800",
        )}
      >
        SZUKAJ
      </button>
    </form>
  )
}
