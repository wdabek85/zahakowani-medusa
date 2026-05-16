import { Button, Heading, Input, Label, RadioGroup, Text, toast } from "@medusajs/ui"
import { useState } from "react"
import { BikeRackCatalogItem, PublishStatus, publishCatalog } from "./types"

export type BikeRackPublishFormProps = {
  bikeRack: BikeRackCatalogItem
  onSubmitted: (productIds: string[]) => void
  onCancel: () => void
}

export const BikeRackPublishForm = ({ bikeRack, onSubmitted, onCancel }: BikeRackPublishFormProps) => {
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
    const inventoryNum = inventory === "" ? undefined : Number(inventory)

    setSubmitting(true)
    try {
      const response = await publishCatalog("/admin/catalog/publish-bike-rack", {
        bikeRackId: bikeRack.id,
        price: priceNum,
        inventory: inventoryNum,
        status,
      })
      if (!response.success) {
        toast.error(response.error || "Błąd wystawiania produktu")
        return
      }
      toast.success(`Wystawiono produkt (${response.productIds[0]})`)
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
        <Heading level="h2">Wystaw produkt: {bikeRack.name}</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Bagażnik to produkt uniwersalny — bez wyboru pojazdu, jeden wariant, jeden SKU.
        </Text>
      </div>

      <div className="flex flex-col gap-y-1">
        <Label htmlFor="br-price" className="text-ui-fg-subtle">Cena (PLN) *</Label>
        <Input
          id="br-price"
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
        <Label htmlFor="br-inventory" className="text-ui-fg-subtle">Stan magazynowy (sztuki)</Label>
        <Input
          id="br-inventory"
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
            <RadioGroup.Item id="status-draft-br" value="draft" />
            <Label htmlFor="status-draft-br">Szkic</Label>
          </div>
          <div className="flex items-center gap-x-2">
            <RadioGroup.Item id="status-published-br" value="published" />
            <Label htmlFor="status-published-br">Opublikowany</Label>
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
