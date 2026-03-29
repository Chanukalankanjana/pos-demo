import { DEMO_KEYS, loadJson, nowIso, saveJson } from "@/lib/demoPersistence"

export type CategoryResponseDto = {
  categoryId: number
  name: string
  iconUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export type CreateCategoryRequestDto = {
  name: string
  iconUrl: string | null
  isActive: boolean
}

function normalizeCategory(c: unknown): CategoryResponseDto {
  const x = c as Record<string, unknown>
  return {
    categoryId: Number(x.categoryId ?? x.CategoryId ?? x.id ?? x.ID),
    name: String(x.name ?? ""),
    iconUrl: (x.iconUrl as string | null) ?? null,
    isActive: (x.isActive as boolean) ?? (x.IsActive as boolean) ?? (x.active as boolean) ?? true,
    createdAt: String(x.createdAt ?? ""),
    updatedAt: (x.updatedAt as string | null) ?? null,
  }
}

const categoryCache = new Map<number, CategoryResponseDto>()

const DEFAULT_CATEGORIES: CategoryResponseDto[] = [
  { categoryId: 1, name: "Starters", iconUrl: null, isActive: true, createdAt: nowIso(), updatedAt: null },
  { categoryId: 2, name: "Mains", iconUrl: null, isActive: true, createdAt: nowIso(), updatedAt: null },
  { categoryId: 3, name: "Desserts", iconUrl: null, isActive: true, createdAt: nowIso(), updatedAt: null },
  { categoryId: 4, name: "Drinks", iconUrl: null, isActive: true, createdAt: nowIso(), updatedAt: null },
  { categoryId: 5, name: "Other", iconUrl: null, isActive: true, createdAt: nowIso(), updatedAt: null },
]

function readCategories(): CategoryResponseDto[] {
  const raw = loadJson<unknown[]>(DEMO_KEYS.categories, [])
  if (!Array.isArray(raw) || raw.length === 0) {
    saveJson(DEMO_KEYS.categories, DEFAULT_CATEGORIES)
    return [...DEFAULT_CATEGORIES]
  }
  return raw.map(normalizeCategory).filter((c) => Number.isFinite(c.categoryId))
}

function writeCategories(list: CategoryResponseDto[]) {
  saveJson(DEMO_KEYS.categories, list)
  categoryCache.clear()
  for (const c of list) categoryCache.set(c.categoryId, c)
}

export async function getAllCategories(): Promise<CategoryResponseDto[]> {
  const list = readCategories()
  for (const c of list) categoryCache.set(c.categoryId, c)
  return list
}

export async function getCategoryById(categoryId: number): Promise<CategoryResponseDto> {
  const cached = categoryCache.get(categoryId)
  if (cached) return cached

  const list = readCategories()
  const found = list.find((c) => c.categoryId === categoryId)
  if (!found) throw new Error(`Category ${categoryId} not found`)
  categoryCache.set(found.categoryId, found)
  return found
}

export async function createCategory(name: string): Promise<CategoryResponseDto> {
  const list = readCategories()
  const nextId = list.length > 0 ? Math.max(...list.map((c) => c.categoryId)) + 1 : 1
  const t = nowIso()
  const created: CategoryResponseDto = {
    categoryId: nextId,
    name: name.trim(),
    iconUrl: null,
    isActive: true,
    createdAt: t,
    updatedAt: null,
  }
  writeCategories([...list, created])
  categoryCache.set(created.categoryId, created)
  return created
}
