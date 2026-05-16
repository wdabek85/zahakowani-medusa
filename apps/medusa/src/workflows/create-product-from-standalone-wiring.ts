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
import { STANDALONE_WIRING_CATALOG_MODULE } from "../modules/standalone-wiring-catalog"
import { VEHICLE_FITMENT_MODULE } from "../modules/vehicle-fitment"
import {
  generateProductTitle,
  generateProductHandle,
  generateSku,
} from "../utils/catalog"

export type CreateProductFromStandaloneWiringInput = {
  wiringId: string
  generationIds?: string[]
  price: number
  inventory?: number
  status?: "draft" | "published"
  currencyCode?: string
}

type LoadedStandaloneWiringContext = {
  wiring: {
    id: string
    catalog_number: string
    name: string
    manufacturer: string
    type: "harness" | "module"
    pin_count: number
    weight_kg: number
    fits_all_vehicles: boolean
    description_html: string
    thumbnail: string
  }
  generations: Array<{
    id: string
    name: string
    code: string
    year_from: number
    year_to: number | null
    vehicle_model: {
      name: string
      code: string
      brand: { name: string; code: string }
    }
  }>
  defaultSalesChannelId: string
  defaultShippingProfileId: string
}

const loadStandaloneWiringContextStep = createStep(
  "load-standalone-wiring-context",
  async (
    input: { wiringId: string; generationIds?: string[] },
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const [
      { data: wiringRows },
      { data: salesChannelRows },
      { data: shippingProfileRows },
    ] = await Promise.all([
      query.graph({
        entity: "standalone_wiring",
        fields: [
          "id", "catalog_number", "name", "manufacturer", "type",
          "pin_count", "weight_kg", "fits_all_vehicles",
          "description_html", "thumbnail",
        ],
        filters: { id: input.wiringId },
      }),
      query.graph({ entity: "sales_channel", fields: ["id"] }),
      query.graph({ entity: "shipping_profile", fields: ["id"] }),
    ])

    if (!wiringRows.length) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, `StandaloneWiring "${input.wiringId}" not found`)
    }
    if (!salesChannelRows.length || !shippingProfileRows.length) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Missing default sales channel or shipping profile`)
    }

    const wiring = wiringRows[0] as LoadedStandaloneWiringContext["wiring"]

    // Validate generations input vs fits_all_vehicles flag
    if (wiring.fits_all_vehicles) {
      if (input.generationIds && input.generationIds.length > 0) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `StandaloneWiring "${wiring.catalog_number}" has fits_all_vehicles=true; generationIds must be empty or omitted`,
        )
      }
    } else {
      if (!input.generationIds || input.generationIds.length === 0) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `StandaloneWiring "${wiring.catalog_number}" has fits_all_vehicles=false; generationIds is required`,
        )
      }
    }

    let generations: LoadedStandaloneWiringContext["generations"] = []
    if (!wiring.fits_all_vehicles && input.generationIds) {
      const { data: genRows } = await query.graph({
        entity: "generation",
        fields: [
          "id", "name", "code", "year_from", "year_to",
          "vehicle_model.name", "vehicle_model.code",
          "vehicle_model.brand.name", "vehicle_model.brand.code",
        ],
        filters: { id: input.generationIds },
      })
      if (genRows.length !== input.generationIds.length) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Expected ${input.generationIds.length} generations, found ${genRows.length}`,
        )
      }
      generations = genRows as LoadedStandaloneWiringContext["generations"]
    }

    return new StepResponse<LoadedStandaloneWiringContext>({
      wiring,
      generations,
      defaultSalesChannelId: salesChannelRows[0].id,
      defaultShippingProfileId: shippingProfileRows[0].id,
    })
  },
)

type StandaloneWiringLinkInput = {
  productId: string
  wiringId: string
  generationId: string | null
}

const createStandaloneWiringLinksStep = createStep(
  "create-standalone-wiring-links",
  async (links: StandaloneWiringLinkInput[], { container }) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK)

    const records = links.flatMap((l) => {
      const base = [{
        [Modules.PRODUCT]: { product_id: l.productId },
        [STANDALONE_WIRING_CATALOG_MODULE]: { standalone_wiring_id: l.wiringId },
      }]
      if (l.generationId) {
        base.push({
          [Modules.PRODUCT]: { product_id: l.productId },
          [VEHICLE_FITMENT_MODULE]: { generation_id: l.generationId },
        })
      }
      return base
    })

    await link.create(records)
    return new StepResponse(records, records)
  },
  async (records, { container }) => {
    if (!records) return
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    await link.dismiss(records)
  },
)

/**
 * Creates products from a StandaloneWiring catalog entry, per brief #1 §9.3.
 *
 * Branching on `fits_all_vehicles`:
 *  - true → 1 universal Product, no Generation links
 *  - false → N Products (one per generationId), each linked to its Generation
 *
 * Both paths produce a single-variant Product.
 */
export const createProductFromStandaloneWiringWorkflow = createWorkflow(
  "create-product-from-standalone-wiring",
  (input: CreateProductFromStandaloneWiringInput) => {
    const context = loadStandaloneWiringContextStep({
      wiringId: input.wiringId,
      generationIds: input.generationIds,
    })

    const productInputs = transform({ context, input }, ({ context, input }) => {
      const currencyCode = input.currencyCode ?? "pln"
      const status = (input.status ?? "draft") as ProductStatus

      const builds: Array<{
        product: Record<string, unknown>
        generationId: string | null
      }> = []

      if (context.wiring.fits_all_vehicles) {
        const title = generateProductTitle({
          category: "standalone_wiring",
          catalog: {
            catalog_number: context.wiring.catalog_number,
            name: context.wiring.name,
            manufacturer: context.wiring.manufacturer,
            type: context.wiring.type,
            pin_count: context.wiring.pin_count,
            fits_all_vehicles: true,
          },
        })
        const sku = generateSku({
          category: "standalone_wiring",
          catalogNumber: context.wiring.catalog_number,
        })
        builds.push({
          product: {
            title,
            handle: generateProductHandle(title),
            description: context.wiring.description_html,
            thumbnail: context.wiring.thumbnail || undefined,
            status,
            weight: context.wiring.weight_kg,
            shipping_profile_id: context.defaultShippingProfileId,
            options: [{ title: "Wariant", values: ["Standardowy"] }],
            variants: [{
              title,
              sku,
              options: { Wariant: "Standardowy" },
              weight: context.wiring.weight_kg,
              manage_inventory: true,
              prices: [{ amount: input.price, currency_code: currencyCode }],
            }],
            sales_channels: [{ id: context.defaultSalesChannelId }],
          },
          generationId: null,
        })
      } else {
        for (const generation of context.generations) {
          const title = generateProductTitle({
            category: "standalone_wiring",
            catalog: {
              catalog_number: context.wiring.catalog_number,
              name: context.wiring.name,
              manufacturer: context.wiring.manufacturer,
              type: context.wiring.type,
              pin_count: context.wiring.pin_count,
              fits_all_vehicles: false,
            },
            generation: {
              name: generation.name,
              code: generation.code,
              year_from: generation.year_from,
              year_to: generation.year_to,
              vehicle_model: generation.vehicle_model,
            },
          })
          const sku = generateSku({
            category: "standalone_wiring",
            catalogNumber: context.wiring.catalog_number,
            generationCode: generation.code,
          })
          builds.push({
            product: {
              title,
              handle: generateProductHandle(title),
              description: context.wiring.description_html,
              thumbnail: context.wiring.thumbnail || undefined,
              status,
              weight: context.wiring.weight_kg,
              shipping_profile_id: context.defaultShippingProfileId,
              options: [{ title: "Wariant", values: ["Standardowy"] }],
              variants: [{
                title,
                sku,
                options: { Wariant: "Standardowy" },
                weight: context.wiring.weight_kg,
                manage_inventory: true,
                prices: [{ amount: input.price, currency_code: currencyCode }],
              }],
              sales_channels: [{ id: context.defaultSalesChannelId }],
            },
            generationId: generation.id,
          })
        }
      }

      return builds
    })

    // Pull just the product input list out of `builds`
    const productList = transform({ productInputs }, ({ productInputs }) =>
      productInputs.map((b) => b.product),
    )

    const createdProducts = createProductsWorkflow.runAsStep({
      input: { products: productList },
    })

    const linkInputs = transform(
      { createdProducts, productInputs, input },
      ({ createdProducts, productInputs, input }) =>
        createdProducts.map((p, idx): StandaloneWiringLinkInput => ({
          productId: p.id,
          wiringId: input.wiringId,
          generationId: productInputs[idx].generationId,
        })),
    )

    createStandaloneWiringLinksStep(linkInputs)

    return new WorkflowResponse(createdProducts)
  },
)
