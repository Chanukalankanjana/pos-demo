export function formatItemCode(productId: number): string {
  const n = Number(productId)
  const safe = Number.isFinite(n) && n > 0 ? n : 0
  return `ITM-${safe.toString().padStart(4, "0")}`
}

