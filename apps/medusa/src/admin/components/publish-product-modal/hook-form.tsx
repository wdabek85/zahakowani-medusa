import { Button, Heading, Input, Label, RadioGroup, Text, toast } from "@medusajs/ui"
import { useState } from "react"
import { VehiclePicker } from "../vehicle-picker"
import type { HookVariantCode } from "../../../utils/catalog"
import { HookCatalogItem, PublishStatus, publishCatalog } from "./types"

const VARIANT_CODES: HookVariantCode[] = ["BARE", "W7", "W13", "M7", "M13"]
const VARIANT_LABELS: Record<HookVariantCode, string> = {
  BARE: "Sam hak",
  W7: "Wiązka 7-Pin",
  W13: "Wiązka 13-Pin",
  M7: "Moduł 7-Pin",
  M13: "Moduł 13-Pin",
}

type VariantNumberRecord = Record<HookVariantCode, string>

const emptyVariants = (): VariantNumberRecord => ({ BARE: "", W7: "", W13: "", M7: "", M13: "" })

export type HookPublishFormProps = {
  hook: HookCatalogItem
  onSubmitted: (productIds: string[]) => void
  onCancel: () => void
}

export const HookPublishForm = ({ hook, onSubmitted, onCancel }: HookPublishFormProps) => {
  const [selectedGenerationIds, setSelectedGenerationIds] = useState<string[]>([])
  const [prices, setPrices] = useState<VariantNumberRecord>(emptyVariants())
  const [inventory, setInventory] = useState<VariantNumberRecord>(emptyVariants())
  const [status, setStatus] = useState<PublishStatus>("draft")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedGenerationIds.length === 0) {
      toast.error("Wybierz przynajmniej jedną generację pojazdu")
      return
    }
    const parsedPrices: Record<HookVariantCode, number> = {} as Record<HookVariantCode, number>
    const parsedInventory: Record<HookVariantCode, number> = {} as Record<HookVariantCode, number>
    for (const code of VARIANT_CODES) {
      const priceNum = Number(prices[code])
      if (!Number.isFinite(priceNum) || priceNum < 0) {
        toast.error(`Cena dla "${VARIANT_LABELS[code]}" musi być liczbą >= 0`)
        return
      }
      parsedPrices[code] = priceNum
      const invStr = inventory[code]
      parsedInventory[code] = invStr === "" ? 0 : Number(invStr)
    }

    setSubmitting(true)
    try {
      const response = await publishCatalog("/admin/catalog/publish-hook", {
        hookId: hook.id,
        generationIds: selectedGenerationIds,
        variantPrices: parsedPrices,
        variantInventory: parsedInventory,
        status,
      })
      if (!response.success) {
        toast.error(response.error || "Błąd wystawiania produktu")
        return
      }
      toast.success(`Wystawiono ${response.productsCreated} produkt(ów)`)
      onSubmitted(response.productIds)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nieznany błąd")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-y-5">
      <div>
        <Heading level="h2">Wystaw produkt: {hook.name}</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Z jednego haka powstaje produkt per generacja pojazdu (5 wariantów: BARE/W7/W13/M7/M13).
        </Text>
      </div>

      <VehiclePicker
        label="Wybierz generacje pojazdów"
        required
        selectedGenerationIds={selectedGenerationIds}
        onSelectionChange={setSelectedGenerationIds}
        showSelectAll
      />

      <div>
        <Label className="text-ui-fg-subtle">Ceny wariantów (PLN) *</Label>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {VARIANT_CODES.map((code) => (
            <div key={code} className="flex flex-col gap-y-1">
              <Label size="xsmall" className="text-ui-fg-muted">{VARIANT_LABELS[code]}</Label>
              <Input
                type="number"
                min={0}
                step={1}
                placeholder="0"
                value={prices[code]}
                onChange={(e) => setPrices((p) => ({ ...p, [code]: e.target.value }))}
                required
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-ui-fg-subtle">Stany magazynowe (sztuki)</Label>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {VARIANT_CODES.map((code) => (
            <div key={code} className="flex flex-col gap-y-1">
              <Label size="xsmall" className="text-ui-fg-muted">{VARIANT_LABELS[code]}</Label>
              <Input
                type="number"
                min={0}
                step={1}
                placeholder="0"
                value={inventory[code]}
                onChange={(e) => setInventory((inv) => ({ ...inv, [code]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-ui-fg-subtle">Status</Label>
        <RadioGroup
          value={status}
          onValueChange={(v) => setStatus(v as PublishStatus)}
          className="mt-2 flex gap-x-4"
        >
          <div className="flex items-center gap-x-2">
            <RadioGroup.Item id="status-draft-hook" value="draft" />
            <Label htmlFor="status-draft-hook">Szkic</Label>
          </div>
          <div className="flex items-center gap-x-2">
            <RadioGroup.Item id="status-published-hook" value="published" />
            <Label htmlFor="status-published-hook">Opublikowany</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-end gap-x-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Anuluj
        </Button>
        <Button type="submit" isLoading={submitting}>
          Wystaw produkt
        </Button>
      </div>
    </form>
  )
}
