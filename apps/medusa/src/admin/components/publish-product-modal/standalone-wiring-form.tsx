import { Button, Heading, Input, Label, RadioGroup, Text, toast } from "@medusajs/ui"
import { useState } from "react"
import { VehiclePicker } from "../vehicle-picker"
import { PublishStatus, StandaloneWiringCatalogItem, publishCatalog } from "./types"

export type StandaloneWiringPublishFormProps = {
  wiring: StandaloneWiringCatalogItem
  onSubmitted: (productIds: string[]) => void
  onCancel: () => void
}

export const StandaloneWiringPublishForm = ({
  wiring, onSubmitted, onCancel,
}: StandaloneWiringPublishFormProps) => {
  const [selectedGenerationIds, setSelectedGenerationIds] = useState<string[]>([])
  const [price, setPrice] = useState("")
  const [inventory, setInventory] = useState("")
  const [status, setStatus] = useState<PublishStatus>("draft")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const priceNum = Number(price)
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      toast.error("Cena musi być liczbą >= 0")
      return
    }
    if (!wiring.fits_all_vehicles && selectedGenerationIds.length === 0) {
      toast.error("Wybierz przynajmniej jedną generację pojazdu (lub oznacz wiązkę jako uniwersalną)")
      return
    }
    const inventoryNum = inventory === "" ? undefined : Number(inventory)

    setSubmitting(true)
    try {
      const response = await publishCatalog("/admin/catalog/publish-standalone-wiring", {
        wiringId: wiring.id,
        generationIds: wiring.fits_all_vehicles ? undefined : selectedGenerationIds,
        price: priceNum,
        inventory: inventoryNum,
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
        <Heading level="h2">Wystaw produkt: {wiring.name}</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {wiring.fits_all_vehicles
            ? "Wiązka uniwersalna — pasuje do każdego auta, tworzy 1 produkt bez fitmentu."
            : "Wiązka dedykowana — tworzy 1 produkt per wybrana generacja pojazdu."}
        </Text>
      </div>

      {!wiring.fits_all_vehicles && (
        <VehiclePicker
          label="Wybierz generacje pojazdów"
          required
          selectedGenerationIds={selectedGenerationIds}
          onSelectionChange={setSelectedGenerationIds}
          showSelectAll
        />
      )}

      <div className="flex flex-col gap-y-1">
        <Label htmlFor="sw-price" className="text-ui-fg-subtle">Cena (PLN) *</Label>
        <Input
          id="sw-price"
          type="number"
          min={0}
          step={1}
          placeholder="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-y-1">
        <Label htmlFor="sw-inventory" className="text-ui-fg-subtle">Stan magazynowy (sztuki)</Label>
        <Input
          id="sw-inventory"
          type="number"
          min={0}
          step={1}
          placeholder="0"
          value={inventory}
          onChange={(e) => setInventory(e.target.value)}
        />
      </div>

      <div>
        <Label className="text-ui-fg-subtle">Status</Label>
        <RadioGroup
          value={status}
          onValueChange={(v) => setStatus(v as PublishStatus)}
          className="mt-2 flex gap-x-4"
        >
          <div className="flex items-center gap-x-2">
            <RadioGroup.Item id="status-draft-sw" value="draft" />
            <Label htmlFor="status-draft-sw">Szkic</Label>
          </div>
          <div className="flex items-center gap-x-2">
            <RadioGroup.Item id="status-published-sw" value="published" />
            <Label htmlFor="status-published-sw">Opublikowany</Label>
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
