import { api } from "@/lib/apiClient"

export type PaymentMethod = "CASH" | "CARD" | "PAYPAL" | "BANK_TRANSFER" | "CASH_ON_DELIVERY"

// Backend examples show "UPDATED" during PUT, so keep it to avoid type mismatch
export type OrderStatus = "NEW" | "PAID" | "CANCELLED" | "UPDATED"

export type OrderType = "DINE_IN" | "TAKE_AWAY" | "DELIVERY"
export type Kitchen = "KITCHEN_1" | "KITCHEN_2"

export type OrderItemRequestDto = {
  productId: number
  quantity: number
}

export type OrderRequestDto = {
  tableNumber: number | null
  totalAmount: number
  taxAmount: number
  discountAmount: number
  paymentMethod: PaymentMethod
  status: OrderStatus
  orderType: OrderType
  kitchen: Kitchen
  items: OrderItemRequestDto[]
}

export type OrderResponseDto = Omit<OrderRequestDto, "items"> & {
  orderId: number
  orderDate: string
  createdAt: string
  updatedAt: string | null
  // API examples don't return items in response; keep optional for future-proofing
  items?: OrderItemRequestDto[]
}

export type OrderPatchDto = Partial<Omit<OrderRequestDto, "items">> & {
  items?: OrderItemRequestDto[]
}

export async function createOrder(payload: OrderRequestDto): Promise<OrderResponseDto> {
  const res = await api.post<OrderResponseDto>("/orders", payload)
  return res.data
}

export async function getAllOrders(): Promise<OrderResponseDto[]> {
  const res = await api.get<OrderResponseDto[]>("/orders")
  return res.data
}

export async function getOrderById(orderId: number): Promise<OrderResponseDto> {
  const res = await api.get<OrderResponseDto>(`/orders/${orderId}`)
  return res.data
}

export async function updateOrder(orderId: number, payload: OrderRequestDto): Promise<OrderResponseDto> {
  const res = await api.put<OrderResponseDto>(`/orders/${orderId}`, payload)
  return res.data
}

export async function patchOrder(orderId: number, patch: OrderPatchDto): Promise<OrderResponseDto> {
  const res = await api.patch<OrderResponseDto>(`/orders/${orderId}`, patch)
  return res.data
}

export async function deleteOrder(orderId: number): Promise<void> {
  await api.delete(`/orders/${orderId}`)
}