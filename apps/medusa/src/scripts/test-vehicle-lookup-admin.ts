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
  return ((await r.json()) as { token: string }).token
}

export default async function testVehicleLookupAdmin({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  let failures = 0
  const check = (label: string, ok: boolean, detail?: string) => {
    if (ok) logger.info(`  ✔ ${label}`)
    else { logger.error(`  ✘ ${label}${detail ? `: ${detail}` : ""}`); failures++ }
  }

  const token = await adminLogin()

  logger.info("=== TEST 1: GET /admin/vehicle-fitment/lookup ===")
  const r1 = await fetch(`${BASE}/admin/vehicle-fitment/lookup`, {
    headers: { authorization: `Bearer ${token}` },
  })
  check("status 200", r1.status === 200, `got ${r1.status}`)

  const body = await r1.json() as {
    brands?: Array<{
      code: string; name: string;
      models: Array<{
        code: string; name: string;
        generations: Array<{ code: string; years_label: string }>
      }>
    }>
  }

  check("brands is array", Array.isArray(body.brands))
  const skoda = body.brands?.find((b) => b.code === "skoda")
  check("contains 'skoda' brand", Boolean(skoda))
  const octavia = skoda?.models.find((m) => m.code === "octavia")
  check("skoda has 'octavia' model", Boolean(octavia))
  const octavia3 = octavia?.generations.find((g) => g.code === "octavia-3")
  check("octavia has 'octavia-3' generation", Boolean(octavia3))
  check("years_label = '2013-2019'", octavia3?.years_label === "2013-2019", `got "${octavia3?.years_label}"`)

  logger.info("=== TEST 2: brak auth → 401 ===")
  const r2 = await fetch(`${BASE}/admin/vehicle-fitment/lookup`)
  check("status 401", r2.status === 401, `got ${r2.status}`)

  if (failures === 0) logger.info("=== ALL TESTS PASSED ===")
  else logger.error(`=== ${failures} failure(s) ===`)
}
