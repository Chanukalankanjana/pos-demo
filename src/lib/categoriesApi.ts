import { api } from "@/lib/apiClient"

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

function normalizeCategory(c: any): CategoryResponseDto {
  return {
    categoryId: Number(c.categoryId ?? c.CategoryId ?? c.id ?? c.ID),
    name: String(c.name ?? ""),
    iconUrl: c.iconUrl ?? null,
    isActive: c.isActive ?? c.IsActive ?? c.active ?? true,
    createdAt: String(c.createdAt ?? ""),
    updatedAt: c.updatedAt ?? null,
  }
}

function unwrapList(data: any): any[] {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.categories)) return data.categories
  if (Array.isArray(data?.content)) return data.content
  return []
}

// simple module-level cache to avoid repeated calls
const categoryCache = new Map<number, CategoryResponseDto>()

export async function getAllCategories(): Promise<CategoryResponseDto[]> {
  const res = await api.get("/categories")
  const list = unwrapList(res.data).map(normalizeCategory).filter((c) => Number.isFinite(c.categoryId))

  for (const c of list) categoryCache.set(c.categoryId, c)
  return list
}

export async function getCategoryById(categoryId: number): Promise<CategoryResponseDto> {
  const cached = categoryCache.get(categoryId)
  if (cached) return cached

  const res = await api.get(`/categories/${categoryId}`)
  const normalized = normalizeCategory(res.data)
  categoryCache.set(normalized.categoryId, normalized)
  return normalized
}

export async function createCategory(name: string): Promise<CategoryResponseDto> {
  const payload: CreateCategoryRequestDto = {
    name: name.trim(),
    iconUrl: null,
    isActive: true,
  }

  const res = await api.post("/categories", payload)
  const created = normalizeCategory(res.data)
  categoryCache.set(created.categoryId, created)
  return created
}