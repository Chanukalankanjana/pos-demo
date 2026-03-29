import { DEMO_KEYS, loadJson, nowIso, saveJson } from "@/lib/demoPersistence"

export interface InventoryItemResponseDto {
  itemId: number
  itemName: string
  quantity: number
  lowStockThreshold: number
  /** LKR per kg (or per litre for liquids) — used for recipe cost. */
  costPerUnit: number
  updatedAt: string
  createdAt: string
}

export interface InventoryItemRequestDto {
  itemName: string
  quantity: number
  lowStockThreshold: number
  costPerUnit: number
}

export type InventoryItemPatchDto = Partial<InventoryItemRequestDto>

function normalizeItem(raw: Partial<InventoryItemResponseDto> & { costPerUnit?: number }): InventoryItemResponseDto {
  return {
    itemId: Number(raw.itemId),
    itemName: String(raw.itemName ?? ""),
    quantity: Number(raw.quantity ?? 0),
    lowStockThreshold: Number(raw.lowStockThreshold ?? 0),
    costPerUnit: typeof raw.costPerUnit === "number" && Number.isFinite(raw.costPerUnit) ? raw.costPerUnit : 120,
    createdAt: String(raw.createdAt ?? nowIso()),
    updatedAt: String(raw.updatedAt ?? nowIso()),
  }
}

const DEFAULT_INVENTORY: InventoryItemResponseDto[] = [
  {
    itemId: 1,
    itemName: "Tomato (kg)",
    quantity: 50,
    lowStockThreshold: 10,
    costPerUnit: 180,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    itemId: 2,
    itemName: "Cheese (kg)",
    quantity: 30,
    lowStockThreshold: 5,
    costPerUnit: 950,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    itemId: 3,
    itemName: "Chicken (kg)",
    quantity: 40,
    lowStockThreshold: 8,
    costPerUnit: 1100,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    itemId: 4,
    itemName: "Flour (kg)",
    quantity: 100,
    lowStockThreshold: 20,
    costPerUnit: 140,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    itemId: 5,
    itemName: "Cooking Oil (L)",
    quantity: 25,
    lowStockThreshold: 5,
    costPerUnit: 520,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
]

function readAll(): InventoryItemResponseDto[] {
  const raw = loadJson<unknown[]>(DEMO_KEYS.inventory, [])
  if (!Array.isArray(raw) || raw.length === 0) {
    saveJson(DEMO_KEYS.inventory, DEFAULT_INVENTORY)
    return [...DEFAULT_INVENTORY]
  }
  return raw.map((x) => normalizeItem(x as Partial<InventoryItemResponseDto>))
}

function writeAll(items: InventoryItemResponseDto[]) {
  saveJson(DEMO_KEYS.inventory, items)
}

export async function createInventoryItem(body: InventoryItemRequestDto) {
  const list = readAll()
  const nextId = list.length > 0 ? Math.max(...list.map((i) => i.itemId)) + 1 : 1
  const t = nowIso()
  const row: InventoryItemResponseDto = {
    itemId: nextId,
    itemName: body.itemName.trim(),
    quantity: body.quantity,
    lowStockThreshold: body.lowStockThreshold,
    costPerUnit: Math.max(0, body.costPerUnit),
    createdAt: t,
    updatedAt: t,
  }
  writeAll([row, ...list])
  return row
}

export async function getAllInventoryItems() {
  return readAll()
}

export async function getInventoryItemById(itemId: number) {
  const found = readAll().find((i) => i.itemId === itemId)
  if (!found) throw new Error(`Inventory item ${itemId} not found`)
  return found
}

export async function updateInventoryItem(itemId: number, body: InventoryItemRequestDto) {
  const list = readAll()
  const idx = list.findIndex((i) => i.itemId === itemId)
  if (idx < 0) throw new Error(`Inventory item ${itemId} not found`)
  const t = nowIso()
  const updated: InventoryItemResponseDto = {
    ...list[idx],
    itemName: body.itemName.trim(),
    quantity: body.quantity,
    lowStockThreshold: body.lowStockThreshold,
    costPerUnit: Math.max(0, body.costPerUnit),
    updatedAt: t,
  }
  list[idx] = updated
  writeAll(list)
  return updated
}

export async function patchInventoryItem(itemId: number, patch: InventoryItemPatchDto) {
  const current = await getInventoryItemById(itemId)
  return updateInventoryItem(itemId, {
    itemName: patch.itemName ?? current.itemName,
    quantity: patch.quantity ?? current.quantity,
    lowStockThreshold: patch.lowStockThreshold ?? current.lowStockThreshold,
    costPerUnit: patch.costPerUnit ?? current.costPerUnit,
  })
}

export async function deleteInventoryItem(itemId: number) {
  const list = readAll()
  const next = list.filter((i) => i.itemId !== itemId)
  if (next.length === list.length) throw new Error(`Inventory item ${itemId} not found`)
  writeAll(next)
}
