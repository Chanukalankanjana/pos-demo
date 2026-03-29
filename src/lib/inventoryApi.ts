import { api } from "@/lib/apiClient"

export interface InventoryItemResponseDto {
  itemId: number
  itemName: string
  quantity: number
  lowStockThreshold: number
  updatedAt: string
  createdAt: string
}

export interface InventoryItemRequestDto {
  itemName: string
  quantity: number
  lowStockThreshold: number
}

export type InventoryItemPatchDto = Partial<InventoryItemRequestDto>

export async function createInventoryItem(body: InventoryItemRequestDto) {
  const { data } = await api.post<InventoryItemResponseDto>("/inventory", body)
  return data
}

export async function getAllInventoryItems() {
  const { data } = await api.get<InventoryItemResponseDto[]>("/inventory")
  return data
}

export async function getInventoryItemById(itemId: number) {
  const { data } = await api.get<InventoryItemResponseDto>(`/inventory/${itemId}`)
  return data
}

export async function updateInventoryItem(itemId: number, body: InventoryItemRequestDto) {
  const { data } = await api.put<InventoryItemResponseDto>(`/inventory/${itemId}`, body)
  return data
}

export async function patchInventoryItem(itemId: number, patch: InventoryItemPatchDto) {
  const { data } = await api.patch<InventoryItemResponseDto>(`/inventory/${itemId}`, patch)
  return data
}

export async function deleteInventoryItem(itemId: number) {
  await api.delete(`/inventory/${itemId}`)
}