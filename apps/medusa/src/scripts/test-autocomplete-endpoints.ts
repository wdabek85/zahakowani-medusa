import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const BASE = "http://localhost:9000"
const ADMIN_EMAIL = "admin@zahakowani.pl"
const ADMIN_PASSWORD = "admin123"

async function adminLogin(): Promise<string> {
  const r = await fetch(`${BASE}/auth/user/emailpass`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  if (!r.ok) throw new Error(`Login failed: ${r.status}`)
  const body = await r.json() as { token: string }
  return body.token
}

async function adminGet(token: string, path: string): Promise<{ status: number; body: unknown }> {
  const r = await fetch(`${BASE}${path}`, {
    headers: { authorization: `Bearer ${token}` },
  })
  return { status: r.status, body: await r.json() }
}

export default async function testAutocompleteEndpoints({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  let failures = 0
  const check = (label: string, ok: boolean, detail?: string) => {
    if (ok) logger.info(`  ✔ ${label}`)
    else { logger.error(`  ✘ ${label}${detail ? `: ${detail}` : ""}`); failures++ }
  }

  logger.info("=== Login as admin ===")
  const token = await adminLogin()
  logger.info(`Token obtained`)

  // ────────────────────────────────────────────────────────────
  logger.info("=== TEST 1: GET /admin/autocomplete/manufacturers (no query) ===")
  const r1 = await adminGet(token, "/admin/autocomplete/manufacturers")
  check("status 200", r1.status === 200, `got ${r1.status}`)
  const r1b = r1.body as { suggestions?: string[] }
  check("suggestions is array", Array.isArray(r1b.suggestions))
  check("contains 'Imioła Hak-Pol' (from seed Hook)", r1b.suggestions?.includes("Imioła Hak-Pol") ?? false)
  check("contains 'Producent Testowy' (from seed BikeRack/SW)", r1b.suggestions?.includes("Producent Testowy") ?? false)
  check("no duplicates", new Set(r1b.suggestions).size === (r1b.suggestions?.length ?? 0))
  logger.info(`  result: ${JSON.stringify(r1b.suggestions)}`)

  logger.info("=== TEST 2: GET /admin/autocomplete/manufacturers?q=imio (case-insensitive) ===")
  const r2 = await adminGet(token, "/admin/autocomplete/manufacturers?q=imio")
  check("status 200", r2.status === 200)
  const r2b = r2.body as { suggestions?: string[] }
  check("matches 'Imioła Hak-Pol'", r2b.suggestions?.includes("Imioła Hak-Pol") ?? false)
  check("does NOT include 'Producent Testowy'", !(r2b.suggestions?.includes("Producent Testowy") ?? false))

  logger.info("=== TEST 3: GET /admin/autocomplete/homologations ===")
  const r3 = await adminGet(token, "/admin/autocomplete/homologations")
  check("status 200", r3.status === 200)
  const r3b = r3.body as { suggestions?: string[] }
  check("contains 'E20' (from Hook + SW + WiringEquipment seeds)", r3b.suggestions?.includes("E20") ?? false)
  logger.info(`  result: ${JSON.stringify(r3b.suggestions)}`)

  logger.info("=== TEST 4: GET /admin/autocomplete/ball-types ===")
  const r4 = await adminGet(token, "/admin/autocomplete/ball-types")
  check("status 200", r4.status === 200)
  const r4b = r4.body as { suggestions?: string[] }
  check("contains 'Odkręcana' (from seed Hook)", r4b.suggestions?.includes("Odkręcana") ?? false)
  logger.info(`  result: ${JSON.stringify(r4b.suggestions)}`)

  logger.info("=== TEST 5: GET /admin/autocomplete/body-types ===")
  const r5 = await adminGet(token, "/admin/autocomplete/body-types")
  check("status 200", r5.status === 200)
  const r5b = r5.body as { suggestions?: string[] }
  check("contains 'Kombi' (from seed Generation)", r5b.suggestions?.includes("Kombi") ?? false)
  logger.info(`  result: ${JSON.stringify(r5b.suggestions)}`)

  logger.info("=== TEST 6: GET /admin/autocomplete/body-types?q=nonexistent ===")
  const r6 = await adminGet(token, "/admin/autocomplete/body-types?q=nonexistent")
  check("status 200", r6.status === 200)
  const r6b = r6.body as { suggestions?: string[] }
  check("empty array for no matches", r6b.suggestions?.length === 0, `got ${r6b.suggestions?.length}`)

  logger.info("=== TEST 7: auth — no Authorization header → 401 ===")
  const r7 = await fetch(`${BASE}/admin/autocomplete/manufacturers`)
  check("status 401", r7.status === 401, `got ${r7.status}`)

  if (failures === 0) {
    logger.info("=== ALL TESTS PASSED ===")
  } else {
    logger.error(`=== ${failures} failure(s) ===`)
  }
}
