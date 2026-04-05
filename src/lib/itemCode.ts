export function formatItemCode(productId: number): string {
  const n = Number(productId)
  const safe = Number.isFinite(n) && n > 0 ? n : 0
  return `ITM-${safe.toString().padStart(4, "0")}`
}

/** Accepts plain number or `ITM-0001` style. Returns null if invalid. */
export function parseProductIdInput(raw: string): number | null {
  const t = raw.trim()
  if (!t) return null
  const m = /^ITM-(\d+)$/i.exec(t.replace(/\s/g, ""))
  if (m) {
    const n = Number.parseInt(m[1], 10)
    return Number.isFinite(n) && n >= 1 ? n : null
  }
  const digits = t.replace(/\D/g, "")
  if (!digits) return null
  const n = Number.parseInt(digits, 10)
  return Number.isFinite(n) && n >= 1 ? n : null
}

