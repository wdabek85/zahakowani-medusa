/**
 * Medusa Store API access layer.
 *
 * We hit custom endpoints under `/store/vehicle-fitment/*` (Brand→Model→Generation),
 * `/store/categories/*`, `/store/landing/*`, plus standard `/store/products`.
 * Since the custom ones aren't covered by `@medusajs/js-sdk`, we use a thin
 * `medusaFetch` wrapper that injects the publishable key header automatically.
 *
 * The SDK can be added later (singleton in this file) for cart/checkout flows.
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""
const REGION_CODE = process.env.NEXT_PUBLIC_DEFAULT_REGION_CODE ?? "pl"

export const medusaConfig = {
  backendUrl: BACKEND_URL,
  publishableKey: PUBLISHABLE_KEY,
  regionCode: REGION_CODE,
} as const

export class MedusaFetchError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly url: string,
  ) {
    super(message)
    this.name = "MedusaFetchError"
  }
}

/**
 * Thin fetch wrapper. Always sends `x-publishable-api-key`. Throws on non-2xx.
 * `path` must start with "/" (e.g. "/store/vehicle-fitment/brands").
 */
export async function medusaFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${BACKEND_URL}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": PUBLISHABLE_KEY,
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new MedusaFetchError(
      `Medusa ${res.status} on ${path}: ${body.slice(0, 200)}`,
      res.status,
      url,
    )
  }

  return res.json() as Promise<T>
}
