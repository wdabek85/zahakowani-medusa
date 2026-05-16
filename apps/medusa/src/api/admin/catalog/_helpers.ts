import { MedusaError } from "@medusajs/framework/utils"
import { ZodError } from "zod"

export type PublishSuccessResponse = {
  success: true
  productsCreated: number
  productIds: string[]
}

export type PublishErrorResponse = {
  success: false
  error: string
  step?: string
  details?: unknown
}

export type PublishResponse = PublishSuccessResponse | PublishErrorResponse

const STATUS_BY_MEDUSA_TYPE: Record<string, number> = {
  [MedusaError.Types.NOT_FOUND]: 404,
  [MedusaError.Types.INVALID_DATA]: 400,
  [MedusaError.Types.UNAUTHORIZED]: 401,
  [MedusaError.Types.CONFLICT]: 409,
}

type SerializedMedusaError = {
  __isMedusaError: true
  type: string
  message: string
  code?: string
}

function isSerializedMedusaError(e: unknown): e is SerializedMedusaError {
  return (
    typeof e === "object"
    && e !== null
    && "__isMedusaError" in e
    && (e as { __isMedusaError?: unknown }).__isMedusaError === true
    && typeof (e as { type?: unknown }).type === "string"
    && typeof (e as { message?: unknown }).message === "string"
  )
}

/**
 * Maps a thrown error from a publish workflow into a structured response.
 *
 * Medusa workflow SDK does not always re-throw a real `MedusaError` instance —
 * sometimes it serializes the error to a plain object with `__isMedusaError: true`
 * and the original `type` / `message`. We handle both shapes.
 */
export function mapPublishError(err: unknown): { status: number; body: PublishErrorResponse } {
  if (err instanceof ZodError) {
    return {
      status: 400,
      body: { success: false, error: "Validation failed", details: err.issues },
    }
  }

  if (err instanceof MedusaError) {
    return {
      status: STATUS_BY_MEDUSA_TYPE[err.type] ?? 500,
      body: { success: false, error: err.message },
    }
  }

  if (isSerializedMedusaError(err)) {
    return {
      status: STATUS_BY_MEDUSA_TYPE[err.type] ?? 500,
      body: { success: false, error: err.message },
    }
  }

  const message = err instanceof Error ? err.message : String(err)
  return {
    status: 500,
    body: { success: false, error: message },
  }
}
