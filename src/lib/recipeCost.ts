import type { InventoryItemResponseDto } from "@/lib/inventoryApi"

/** Sum of (qty × cost per kg/L) for recipe lines. */
export function computeRecipeCostLkr(
  recipe: { itemId: number; quantity: number }[],
  inventory: InventoryItemResponseDto[],
): number {
  let total = 0
  for (const line of recipe) {
    const inv = inventory.find((i) => i.itemId === line.itemId)
    if (!inv) continue
    const cpu = inv.costPerUnit ?? 0
    total += line.quantity * cpu
  }
  return Math.round(total * 100) / 100
}
