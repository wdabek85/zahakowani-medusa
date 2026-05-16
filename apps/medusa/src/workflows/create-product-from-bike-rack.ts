import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { BIKE_RACK_CATALOG_MODULE } from "../modules/bike-rack-catalog"
import {
  generateProductTitle,
  generateProductHandle,
  generateSku,
} from "../utils/catalog"

export type CreateProductFromBikeRackInput = {
  bikeRackId: string
  price: number
  inventory?: number
  status?: "draft" | "published"
  currencyCode?: string
}

type LoadedBikeRackContext = {
  bikeRack: {
    id: string
    catalog_number: string
    name: string
    manufacturer: string
    max_bikes: number
    weight_kg: number
    description_html: string
    thumbnail: string
  }
  defaultSalesChannelId: string
  defaultShippingProfileId: string
}

const loadBikeRackContextStep = createStep(
  "load-bike-rack-context",
  async (input: { bikeRackId: string }, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const [
      { data: bikeRackRows },
      { data: salesChannelRows },
      { data: shippingProfileRows },
    ] = await Promise.all([
      query.graph({
        entity: "bike_rack",
        fields: [
          "id", "catalog_number", "name", "manufacturer",
          "max_bikes", "weight_kg", "description_html", "thumbnail",
        ],
        filters: { id: input.bikeRackId },
      }),
      query.graph({ entity: "sales_channel", fields: ["id"] }),
      query.graph({ entity: "shipping_profile", fields: ["id"] }),
    ])

    if (!bikeRackRows.length) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, `BikeRack "${input.bikeRackId}" not found`)
    }
    if (!salesChannelRows.length || !shippingProfileRows.length) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Missing default sales channel or shipping profile`)
    }

    return new StepResponse<LoadedBikeRackContext>({
      bikeRack: bikeRackRows[0] as LoadedBikeRackContext["bikeRack"],
      defaultSalesChannelId: salesChannelRows[0].id,
      defaultShippingProfileId: shippingProfileRows[0].id,
    })
  },
)

const createBikeRackLinkStep = createStep(
  "create-bike-rack-link",
  async (
    input: { productId: string; bikeRackId: string },
    { container },
  ) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    const record = {
      [Modules.PRODUCT]: { product_id: input.productId },
      [BIKE_RACK_CATALOG_MODULE]: { bike_rack_id: input.bikeRackId },
    }
    await link.create(record)
    return new StepResponse(record, record)
  },
  async (record, { container }) => {
    if (!record) return
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    await link.dismiss(record)
  },
)

/**
 * Creates one Product (with a single variant) from a BikeRack catalog entry.
 * Per brief #1 §9.2. BikeRacks have no vehicle fitment and no variant axes.
 */
export const createProductFromBikeRackWorkflow = createWorkflow(
  "create-product-from-bike-rack",
  (input: CreateProductFromBikeRackInput) => {
    const context = loadBikeRackContextStep({ bikeRackId: input.bikeRackId })

    const productInputs = transform({ context, input }, ({ context, input }) => {
      const currencyCode = input.currencyCode ?? "pln"
      const status = (input.status ?? "draft") as ProductStatus

      const title = generateProductTitle({
        category: "bike_rack",
        catalog: {
          catalog_number: context.bikeRack.catalog_number,
          name: context.bikeRack.name,
          manufacturer: context.bikeRack.manufacturer,
          max_bikes: context.bikeRack.max_bikes,
        },
      })

      const sku = generateSku({
        category: "bike_rack",
        catalogNumber: context.bikeRack.catalog_number,
      })

      return [{
        title,
        handle: generateProductHandle(title),
        description: context.bikeRack.description_html,
        thumbnail: context.bikeRack.thumbnail || undefined,
        status,
        weight: context.bikeRack.weight_kg,
        shipping_profile_id: context.defaultShippingProfileId,
        // Medusa requires at least one option per product, even single-variant.
        options: [{ title: "Wariant", values: ["Standardowy"] }],
        variants: [{
          title,
          sku,
          options: { Wariant: "Standardowy" },
          weight: context.bikeRack.weight_kg,
          manage_inventory: true,
          prices: [{ amount: input.price, currency_code: currencyCode }],
        }],
        sales_channels: [{ id: context.defaultSalesChannelId }],
      }]
    })

    const createdProducts = createProductsWorkflow.runAsStep({
      input: { products: productInputs },
    })

    const linkInput = transform({ createdProducts, input }, ({ createdProducts, input }) => ({
      productId: createdProducts[0].id,
      bikeRackId: input.bikeRackId,
    }))

    createBikeRackLinkStep(linkInput)

    return new WorkflowResponse(createdProducts)
  },
)
