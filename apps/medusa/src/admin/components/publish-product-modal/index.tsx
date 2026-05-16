import { FocusModal } from "@medusajs/ui"
import { HookPublishForm } from "./hook-form"
import { BikeRackPublishForm } from "./bike-rack-form"
import { StandaloneWiringPublishForm } from "./standalone-wiring-form"
import type {
  BikeRackCatalogItem,
  HookCatalogItem,
  StandaloneWiringCatalogItem,
} from "./types"

export type PublishProductModalProps =
  | {
      open: boolean
      onClose: () => void
      category: "hook"
      catalogItem: HookCatalogItem
      onSuccess?: (productIds: string[]) => void
    }
  | {
      open: boolean
      onClose: () => void
      category: "bike-rack"
      catalogItem: BikeRackCatalogItem
      onSuccess?: (productIds: string[]) => void
    }
  | {
      open: boolean
      onClose: () => void
      category: "standalone-wiring"
      catalogItem: StandaloneWiringCatalogItem
      onSuccess?: (productIds: string[]) => void
    }

/**
 * Modal "Wystaw produkt" — branches on `category` to render the right per-kind
 * form. Each form internally calls the matching `/admin/catalog/publish-*`
 * endpoint and surfaces success/error via `toast`.
 *
 * Brief #2 §10.
 */
export const PublishProductModal = (props: PublishProductModalProps) => {
  const { open, onClose, onSuccess } = props

  const handleSubmitted = (productIds: string[]) => {
    onSuccess?.(productIds)
    onClose()
  }

  return (
    <FocusModal open={open} onOpenChange={(o) => !o && onClose()}>
      <FocusModal.Content>
        <FocusModal.Header>
          <FocusModal.Title>Wystaw produkt</FocusModal.Title>
        </FocusModal.Header>
        <FocusModal.Body className="overflow-y-auto px-8 py-6">
          {props.category === "hook" && (
            <HookPublishForm
              hook={props.catalogItem}
              onSubmitted={handleSubmitted}
              onCancel={onClose}
            />
          )}
          {props.category === "bike-rack" && (
            <BikeRackPublishForm
              bikeRack={props.catalogItem}
              onSubmitted={handleSubmitted}
              onCancel={onClose}
            />
          )}
          {props.category === "standalone-wiring" && (
            <StandaloneWiringPublishForm
              wiring={props.catalogItem}
              onSubmitted={handleSubmitted}
              onCancel={onClose}
            />
          )}
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}
