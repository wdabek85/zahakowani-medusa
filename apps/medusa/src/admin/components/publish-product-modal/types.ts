export type HookCatalogItem = {
  id: string
  catalog_number: string
  name: string
}

export type BikeRackCatalogItem = {
  id: string
  catalog_number: string
  name: string
}

export type StandaloneWiringCatalogItem = {
  id: string
  catalog_number: string
  name: string
  fits_all_vehicles: boolean
}

export type PublishStatus = "draft" | "published"

export type PublishResult = {
  success: true
  productsCreated: number
  productIds: string[]
}

export type PublishError = {
  success: false
  error: string
  step?: string
  details?: unknown
}

export type PublishResponse = PublishResult | PublishError

export async function publishCatalog(
  path: string,
  body: unknown,
): Promise<PublishResponse> {
  const r = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
  return (await r.json()) as PublishResponse
}
