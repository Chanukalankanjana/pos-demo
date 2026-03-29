import { api } from "@/lib/apiClient"

export type PortionType = "MEDIUM" | "LARGE"

export type OrderItemRequestDto = {
  orderId: number
  productId: number
  quantity: number
  portionType?: PortionType | null
  unitPrice: number
  subtotal: number
}

export type OrderItemResponseDto = OrderItemRequestDto & {
  orderItemId: number
  createdAt: string
  updatedAt: string | null
}

// PATCH supports: orderId, productId, quantity, unitPrice, subtotal (NOT portionType)
export type OrderItemPatchDto = Partial<
  Pick<OrderItemRequestDto, "orderId" | "productId" | "quantity" | "unitPrice" | "subtotal">
>

function normalizePortionType(v: any): PortionType | null {
  const s = String(v ?? "").trim().toUpperCase()
  if (s === "MEDIUM" || s === "LARGE") return s
  return null
}

function normalizeOrderItem(x: any): OrderItemResponseDto {
  const portion =
    x?.portionType ??
    x?.portion_type ??
    x?.portion ??
    x?.portionSize ??
    x?.portion_size ??
    x?.portiontype

  return {
    orderItemId: Number(x?.orderItemId ?? x?.orderItemID ?? x?.id ?? x?.ID),
    orderId: Number(x?.orderId ?? x?.orderID),
    productId: Number(x?.productId ?? x?.productID),
    quantity: Number(x?.quantity),
    portionType: normalizePortionType(portion),
    unitPrice: Number(x?.unitPrice),
    subtotal: Number(x?.subtotal),
    createdAt: String(x?.createdAt ?? ""),
    updatedAt: x?.updatedAt ?? null,
  }
}

function unwrapList(data: any): any[] {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.content)) return data.content
  return []
}

export async function createOrderItem(payload: OrderItemRequestDto): Promise<OrderItemResponseDto> {
  const res = await api.post("/order-items", payload)
  return normalizeOrderItem(res.data)
}

export async function getAllOrderItems(): Promise<OrderItemResponseDto[]> {
  const res = await api.get("/order-items")
  return unwrapList(res.data).map(normalizeOrderItem)
}

export async function getOrderItemById(orderItemId: number): Promise<OrderItemResponseDto> {
  const res = await api.get(`/order-items/${orderItemId}`)
  return normalizeOrderItem(res.data)
}

export async function updateOrderItem(orderItemId: number, payload: OrderItemRequestDto): Promise<OrderItemResponseDto> {
  const res = await api.put(`/order-items/${orderItemId}`, payload)
  return normalizeOrderItem(res.data)
}

export async function patchOrderItem(orderItemId: number, patch: OrderItemPatchDto): Promise<OrderItemResponseDto> {
  const res = await api.patch(`/order-items/${orderItemId}`, patch)
  return normalizeOrderItem(res.data)
}

export async function deleteOrderItem(orderItemId: number): Promise<void> {
  await api.delete(`/order-items/${orderItemId}`)
}