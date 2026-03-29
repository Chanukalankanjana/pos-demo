import { api } from "@/lib/apiClient"

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
  name: string
  description: string
  costPrice: number
  sellingPrice: number
  imageUrl: string | null
  isAvailable: boolean

  hasPortionPricing: boolean
  portionPrices: PortionPrices
  recipe: ProductRecipeLineResponseDto[]
  effectiveSellingPrice: number | null

  createdAt: string
  updatedAt: string | null
}

export type ProductRequestDto = {
  categoryId: number
  name: string
  description: string
  costPrice: number
  sellingPrice: number
  imageUrl: string | null
  isAvailable: boolean

  hasPortionPricing: boolean
  portionPrices: PortionPrices
  recipe: ProductRecipeLineRequestDto[]
}

export async function getAllProducts(): Promise<ProductResponseDto[]> {
  const res = await api.get<ProductResponseDto[]>("/products")
  return res.data
}

export async function createProduct(payload: ProductRequestDto): Promise<ProductResponseDto> {
  const res = await api.post<ProductResponseDto>("/products", payload)
  return res.data
}

export async function updateProduct(productId: number, payload: ProductRequestDto): Promise<ProductResponseDto> {
  const res = await api.put<ProductResponseDto>(`/products/${productId}`, payload)
  return res.data
}

export async function deleteProduct(productId: number): Promise<void> {
  await api.delete(`/products/${productId}`)
}

export async function uploadProductImage(productId: number, file: File): Promise<ProductResponseDto> {
  const formData = new FormData()
  formData.append("image", file)

  const res = await api.post<ProductResponseDto>(`/products/${productId}/image`, formData)
  return res.data
}