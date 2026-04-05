import { DEMO_KEYS, loadJson, nowIso, saveJson } from "@/lib/demoPersistence"
import { defaultMenuItems, type MenuCategory } from "@/lib/menuData"
import { getAllCategories } from "@/lib/categoriesApi"
import { getAllInventoryItems } from "@/lib/inventoryApi"
import type { Kitchen } from "@/lib/ordersApi"

export type PortionSize = "MEDIUM" | "LARGE"
export type PortionPrices = Partial<Record<PortionSize, number>>

export type ProductRecipeLineResponseDto = {
  itemId: number
  itemName?: string
  quantity: number
}

export type ProductRecipeLineRequestDto = {
  itemId: number
  quantity: number
}

export type ProductResponseDto = {
  productId: number
  categoryId: number
  /** Which kitchen station prepares this item */
  kitchen: Kitchen
  name: string
  /** Optional Sinhala name for kitchen (KOT) slips */
  nameSinhala: string | null
  description: string
  costPrice: number
  sellingPrice: number
  imageUrl: string | null
  isAvailable: boolean

  hasPortionPricing: boolean
  portionPrices: PortionPrices
  recipe: ProductRecipeLineResponseDto[]
  effectiveSellingPrice: number | null
  /** Drinks/showcase: on customer bill, not on printed kitchen tickets */
  skipKitchenTicket: boolean

  createdAt: string
  updatedAt: string | null
}

export type ProductRequestDto = {
  categoryId: number
  kitchen: Kitchen
  name: string
  nameSinhala?: string | null
  description: string
  costPrice: number
  sellingPrice: number
  imageUrl: string | null
  isAvailable: boolean

  hasPortionPricing: boolean
  portionPrices: PortionPrices
  recipe: ProductRecipeLineRequestDto[]
  /** Omit from KOT print (still billed on receipt) */
  skipKitchenTicket?: boolean
  /** Set on create only; must be unique. If omitted, next free id is used. */
  productId?: number
}

function categoryIdFromMenu(cat: MenuCategory): number {
  const m: Record<MenuCategory, number> = {
    starters: 1,
    mains: 2,
    desserts: 3,
    drinks: 4,
    other: 5,
  }
  return m[cat] ?? 5
}

function seedProductsFromMenu(): ProductResponseDto[] {
  const t = nowIso()
  return defaultMenuItems.map((item, i) => {
    const sellingPrice = item.price
    const costPrice = Math.round(item.price * 0.5)
    const station: Kitchen = item.kitchen === "KITCHEN_2" ? "KITCHEN_2" : "KITCHEN_1"
    const nameSi = item.nameSinhala?.trim() ? item.nameSinhala.trim() : null
    return {
      productId: i + 1,
      categoryId: categoryIdFromMenu(item.category),
      kitchen: station,
      name: item.name,
      nameSinhala: nameSi,
      description: item.description,
      costPrice,
      sellingPrice,
      imageUrl: item.image || null,
      isAvailable: true,
      hasPortionPricing: false,
      portionPrices: {},
      recipe: [],
      effectiveSellingPrice: sellingPrice,
      skipKitchenTicket: false,
      createdAt: t,
      updatedAt: null,
    }
  })
}

function normalizeStoredProduct(p: Partial<ProductResponseDto>): ProductResponseDto {
  const kitchen = (p.kitchen === "KITCHEN_2" ? "KITCHEN_2" : "KITCHEN_1") as Kitchen
  const rawSi = p.nameSinhala != null ? String(p.nameSinhala).trim() : ""
  const nameSinhala = rawSi.length > 0 ? rawSi : null
  return {
    ...p,
    kitchen,
    nameSinhala,
    productId: Number(p.productId),
    categoryId: Number(p.categoryId),
    name: String(p.name ?? ""),
    description: String(p.description ?? ""),
    costPrice: Number(p.costPrice ?? 0),
    sellingPrice: Number(p.sellingPrice ?? 0),
    imageUrl: p.imageUrl ?? null,
    isAvailable: p.isAvailable !== false,
    hasPortionPricing: !!p.hasPortionPricing,
    portionPrices: p.portionPrices ?? {},
    recipe: Array.isArray(p.recipe) ? p.recipe : [],
    effectiveSellingPrice: p.effectiveSellingPrice ?? null,
    skipKitchenTicket: p.skipKitchenTicket === true,
    createdAt: String(p.createdAt ?? ""),
    updatedAt: p.updatedAt ?? null,
  } as ProductResponseDto
}

async function ensureProductsSeeded(): Promise<ProductResponseDto[]> {
  const raw = loadJson<ProductResponseDto[]>(DEMO_KEYS.products, [])
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((p) => normalizeStoredProduct(p))
  }
  await getAllCategories()
  const seeded = seedProductsFromMenu()
  saveJson(DEMO_KEYS.products, seeded)
  return seeded
}

async function enrichRecipeLines(
  recipe: ProductRecipeLineRequestDto[],
): Promise<ProductRecipeLineResponseDto[]> {
  if (!recipe.length) return []
  const inv = await getAllInventoryItems()
  const nameById = new Map(inv.map((i) => [i.itemId, i.itemName]))
  return recipe.map((r) => ({
    itemId: r.itemId,
    quantity: r.quantity,
    itemName: nameById.get(r.itemId),
  }))
}

function writeProducts(list: ProductResponseDto[]) {
  saveJson(DEMO_KEYS.products, list)
}

export async function getAllProducts(): Promise<ProductResponseDto[]> {
  return ensureProductsSeeded()
}

function nextProductIdFromList(list: ProductResponseDto[]): number {
  const numericIds = list.map((p) => Number(p.productId)).filter((n) => Number.isFinite(n) && n >= 1)
  return numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1
}

export async function createProduct(payload: ProductRequestDto): Promise<ProductResponseDto> {
  const list = await ensureProductsSeeded()
  const requested = payload.productId
  let productId: number
  if (requested != null) {
    const n = Number(requested)
    if (!Number.isInteger(n) || n < 1) throw new Error("Invalid product ID")
    if (list.some((p) => p.productId === n)) throw new Error(`Product ID ${n} already exists`)
    productId = n
  } else {
    productId = nextProductIdFromList(list)
  }

  const t = nowIso()
  const recipe = await enrichRecipeLines(payload.recipe)
  const effective =
    payload.hasPortionPricing && payload.portionPrices.MEDIUM != null
      ? payload.portionPrices.MEDIUM
      : payload.sellingPrice

  const nameSi =
    payload.nameSinhala != null && String(payload.nameSinhala).trim().length > 0
      ? String(payload.nameSinhala).trim()
      : null
  const row: ProductResponseDto = {
    productId,
    categoryId: payload.categoryId,
    kitchen: payload.kitchen,
    name: payload.name,
    nameSinhala: nameSi,
    description: payload.description,
    costPrice: payload.costPrice,
    sellingPrice: payload.sellingPrice,
    imageUrl: payload.imageUrl,
    isAvailable: payload.isAvailable,
    hasPortionPricing: payload.hasPortionPricing,
    portionPrices: payload.portionPrices,
    recipe,
    effectiveSellingPrice: effective,
    skipKitchenTicket: !!payload.skipKitchenTicket,
    createdAt: t,
    updatedAt: null,
  }
  writeProducts([...list, row])
  return row
}

export async function updateProduct(productId: number, payload: ProductRequestDto): Promise<ProductResponseDto> {
  const list = await ensureProductsSeeded()
  const idx = list.findIndex((p) => p.productId === productId)
  if (idx < 0) throw new Error(`Product ${productId} not found`)
  const t = nowIso()
  const recipe = await enrichRecipeLines(payload.recipe)
  const effective =
    payload.hasPortionPricing && payload.portionPrices.MEDIUM != null
      ? payload.portionPrices.MEDIUM
      : payload.sellingPrice

  const nameSiUpd =
    payload.nameSinhala != null && String(payload.nameSinhala).trim().length > 0
      ? String(payload.nameSinhala).trim()
      : null
  const updated: ProductResponseDto = {
    ...list[idx],
    categoryId: payload.categoryId,
    kitchen: payload.kitchen,
    name: payload.name,
    nameSinhala: nameSiUpd,
    description: payload.description,
    costPrice: payload.costPrice,
    sellingPrice: payload.sellingPrice,
    imageUrl: payload.imageUrl,
    isAvailable: payload.isAvailable,
    hasPortionPricing: payload.hasPortionPricing,
    portionPrices: payload.portionPrices,
    recipe,
    effectiveSellingPrice: effective,
    skipKitchenTicket: !!payload.skipKitchenTicket,
    updatedAt: t,
  }
  list[idx] = updated
  writeProducts(list)
  return updated
}

export async function deleteProduct(productId: number): Promise<void> {
  const list = await ensureProductsSeeded()
  const next = list.filter((p) => p.productId !== productId)
  if (next.length === list.length) throw new Error(`Product ${productId} not found`)
  writeProducts(next)
}

export async function uploadProductImage(productId: number, file: File): Promise<ProductResponseDto> {
  const list = await ensureProductsSeeded()
  const idx = list.findIndex((p) => p.productId === productId)
  if (idx < 0) throw new Error(`Product ${productId} not found`)

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result)
      const t = nowIso()
      list[idx] = { ...list[idx], imageUrl: dataUrl, updatedAt: t }
      writeProducts(list)
      resolve(list[idx])
    }
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read image"))
    reader.readAsDataURL(file)
  })
}
