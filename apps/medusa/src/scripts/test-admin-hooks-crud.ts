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
  return ((await r.json()) as { token: string }).token
}

async function api(token: string, method: string, path: string, body?: unknown): Promise<{ status: number; body: unknown }> {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: r.status, body: await r.json() }
}

export default async function testAdminHooksCrud({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  let failures = 0
  const check = (label: string, ok: boolean, detail?: string) => {
    if (ok) logger.info(`  ✔ ${label}`)
    else { logger.error(`  ✘ ${label}${detail ? `: ${detail}` : ""}`); failures++ }
  }

  const token = await adminLogin()
  let createdHookId: string | null = null

  try {
    logger.info("=== TEST 1: POST /admin/hooks (happy path) ===")
    const r1 = await api(token, "POST", "/admin/hooks", {
      catalog_number: "CRUD-TEST-Z/001",
      name: "Hak testowy CRUD",
      manufacturer: "TestManuf CRUD",
      pulling_capacity_kg: 1500,
      vertical_load_kg: 75,
      homologation: "E11",
      ball_type: "Stała",
      requires_bumper_cutting: false,
      warranty_years: 3,
      weight_kg: 12,
      description_html: "<p>crud test</p>",
      thumbnail: "https://example.com/crud.jpg",
      gallery: ["https://example.com/a.jpg", "https://example.com/b.jpg"],
    })
    check("status 201", r1.status === 201, `got ${r1.status} body=${JSON.stringify(r1.body)}`)
    const r1b = r1.body as { hook?: { id: string; catalog_number: string } }
    check("hook returned with id", typeof r1b.hook?.id === "string")
    if (r1b.hook?.id) createdHookId = r1b.hook.id

    logger.info("=== TEST 2: POST /admin/hooks (validation error) ===")
    const r2 = await api(token, "POST", "/admin/hooks", { catalog_number: "" })
    check("status 400", r2.status === 400)
    const r2b = r2.body as { error?: string; details?: unknown[] }
    check("returns Zod issues", Array.isArray(r2b.details))

    logger.info("=== TEST 3: POST /admin/hooks (duplicate catalog_number) ===")
    const r3 = await api(token, "POST", "/admin/hooks", {
      catalog_number: "CRUD-TEST-Z/001", name: "dup",
      manufacturer: "x", pulling_capacity_kg: 1, vertical_load_kg: 1, homologation: "x",
      ball_type: "x", requires_bumper_cutting: false, weight_kg: 1,
      description_html: "<p>x</p>", thumbnail: "https://x/x.jpg",
    })
    check("status 409 Conflict", r3.status === 409, `got ${r3.status}`)

    logger.info("=== TEST 4: GET /admin/hooks (list) ===")
    const r4 = await api(token, "GET", "/admin/hooks")
    check("status 200", r4.status === 200)
    const r4b = r4.body as { hooks?: Array<{ id: string }>; count?: number }
    check("returned hooks array", Array.isArray(r4b.hooks))
    check("our hook in list", r4b.hooks?.some((h) => h.id === createdHookId) ?? false)
    check("count >= 1", (r4b.count ?? 0) >= 1)

    logger.info("=== TEST 5: GET /admin/hooks?manufacturer=TestManuf%20CRUD ===")
    const r5 = await api(token, "GET", `/admin/hooks?manufacturer=${encodeURIComponent("TestManuf CRUD")}`)
    check("status 200", r5.status === 200)
    const r5b = r5.body as { count?: number }
    check("count === 1 (only our hook matches)", r5b.count === 1, `got ${r5b.count}`)

    logger.info("=== TEST 6: GET /admin/hooks?pulling_capacity_min=2000 (excludes our 1500) ===")
    const r6 = await api(token, "GET", "/admin/hooks?pulling_capacity_min=2000")
    const r6b = r6.body as { hooks?: Array<{ id: string }> }
    check("our hook excluded", !(r6b.hooks?.some((h) => h.id === createdHookId)))

    logger.info("=== TEST 7: GET /admin/hooks/:id ===")
    const r7 = await api(token, "GET", `/admin/hooks/${createdHookId}`)
    check("status 200", r7.status === 200)
    const r7b = r7.body as { hook?: { catalog_number: string }; generations?: unknown[]; products?: unknown[] }
    check("hook.catalog_number matches", r7b.hook?.catalog_number === "CRUD-TEST-Z/001")
    check("generations array (empty for new hook)", Array.isArray(r7b.generations) && r7b.generations.length === 0)
    check("products array (empty for new hook)", Array.isArray(r7b.products) && r7b.products.length === 0)

    logger.info("=== TEST 8: GET /admin/hooks/does-not-exist → 404 ===")
    const r8 = await api(token, "GET", "/admin/hooks/does-not-exist")
    check("status 404", r8.status === 404)

    logger.info("=== TEST 9: PATCH /admin/hooks/:id (partial update) ===")
    const r9 = await api(token, "PATCH", `/admin/hooks/${createdHookId}`, {
      warranty_years: 5,
      requires_bumper_cutting: true,
    })
    check("status 200", r9.status === 200)
    const r9b = r9.body as { hook?: { warranty_years: number; requires_bumper_cutting: boolean } }
    check("warranty_years = 5", r9b.hook?.warranty_years === 5)
    check("requires_bumper_cutting = true", r9b.hook?.requires_bumper_cutting === true)

    logger.info("=== TEST 10: DELETE /admin/hooks/:id ===")
    const r10 = await api(token, "DELETE", `/admin/hooks/${createdHookId}`)
    check("status 200", r10.status === 200)
    const r10b = r10.body as { deleted?: boolean }
    check("deleted: true", r10b.deleted === true)

    logger.info("=== TEST 11: GET /admin/hooks/:id (after delete) → 404 ===")
    const r11 = await api(token, "GET", `/admin/hooks/${createdHookId}`)
    check("status 404 after delete", r11.status === 404)
    createdHookId = null

    logger.info("=== TEST 12: brak auth → 401 ===")
    const r12 = await fetch(`${BASE}/admin/hooks`)
    check("status 401", r12.status === 401)

    if (failures === 0) logger.info("=== ALL TESTS PASSED ===")
    else logger.error(`=== ${failures} failure(s) ===`)
  } finally {
    if (createdHookId) {
      try { await api(token, "DELETE", `/admin/hooks/${createdHookId}`) } catch {}
    }
  }
}
