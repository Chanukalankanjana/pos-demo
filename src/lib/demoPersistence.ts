/** Local-only demo storage keys (no backend). */
export const DEMO_KEYS = {
  categories: "pos_demo_v1_categories",
  products: "pos_demo_v1_products",
  orders: "pos_demo_v1_orders",
  orderItems: "pos_demo_v1_order_items",
  inventory: "pos_demo_v1_inventory",
  employees: "pos_demo_v1_employees",
  invoices: "pos_demo_v1_invoices",
  attendance: "pos_demo_v1_attendance",
} as const

export function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJson(key: string, value: unknown) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota / private mode
  }
}

export function nowIso() {
  return new Date().toISOString()
}
