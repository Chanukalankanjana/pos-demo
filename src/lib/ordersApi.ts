import { DEMO_KEYS, loadJson, nowIso, saveJson } from "@/lib/demoPersistence"

export type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "CASH_ON_DELIVERY"

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
  items?: OrderItemRequestDto[]
}

export type OrderPatchDto = Partial<Omit<OrderRequestDto, "items">> & {
  items?: OrderItemRequestDto[]
}

function readOrders(): OrderResponseDto[] {
  return loadJson<OrderResponseDto[]>(DEMO_KEYS.orders, [])
}

function writeOrders(list: OrderResponseDto[]) {
  saveJson(DEMO_KEYS.orders, list)
}

function removeOrderItemsForOrder(orderId: number) {
  type OI = { orderId: number }
  const items = loadJson<OI[]>(DEMO_KEYS.orderItems, [])
  saveJson(
    DEMO_KEYS.orderItems,
    items.filter((i) => i.orderId !== orderId),
  )
}

export async function createOrder(payload: OrderRequestDto): Promise<OrderResponseDto> {
  const orders = readOrders()
  const nextId = orders.length > 0 ? Math.max(...orders.map((o) => o.orderId)) + 1 : 1
  const t = nowIso()
  const { items, ...rest } = payload
  const order: OrderResponseDto = {
    ...rest,
    orderId: nextId,
    orderDate: t,
    createdAt: t,
    updatedAt: null,
    items,
  }
  writeOrders([order, ...orders])
  return order
}

export async function getAllOrders(): Promise<OrderResponseDto[]> {
  return readOrders()
}

export async function getOrderById(orderId: number): Promise<OrderResponseDto> {
  const found = readOrders().find((o) => o.orderId === orderId)
  if (!found) throw new Error(`Order ${orderId} not found`)
  return found
}

export async function updateOrder(orderId: number, payload: OrderRequestDto): Promise<OrderResponseDto> {
  const orders = readOrders()
  const idx = orders.findIndex((o) => o.orderId === orderId)
  if (idx < 0) throw new Error(`Order ${orderId} not found`)
  const t = nowIso()
  const { items, ...rest } = payload
  const updated: OrderResponseDto = {
    ...rest,
    orderId,
    orderDate: orders[idx].orderDate,
    createdAt: orders[idx].createdAt,
    updatedAt: t,
    items,
  }
  orders[idx] = updated
  writeOrders(orders)
  return updated
}

export async function patchOrder(orderId: number, patch: OrderPatchDto): Promise<OrderResponseDto> {
  const orders = readOrders()
  const idx = orders.findIndex((o) => o.orderId === orderId)
  if (idx < 0) throw new Error(`Order ${orderId} not found`)
  const cur = orders[idx]
  const t = nowIso()
  const nextItems = patch.items !== undefined ? patch.items : cur.items
  const updated: OrderResponseDto = {
    tableNumber: patch.tableNumber ?? cur.tableNumber,
    totalAmount: patch.totalAmount ?? cur.totalAmount,
    taxAmount: patch.taxAmount ?? cur.taxAmount,
    discountAmount: patch.discountAmount ?? cur.discountAmount,
    paymentMethod: patch.paymentMethod ?? cur.paymentMethod,
    status: patch.status ?? cur.status,
    orderType: patch.orderType ?? cur.orderType,
    kitchen: patch.kitchen ?? cur.kitchen,
    orderId: cur.orderId,
    orderDate: cur.orderDate,
    createdAt: cur.createdAt,
    updatedAt: t,
    items: nextItems,
  }
  orders[idx] = updated
  writeOrders(orders)
  return updated
}

export async function deleteOrder(orderId: number): Promise<void> {
  const orders = readOrders()
  const next = orders.filter((o) => o.orderId !== orderId)
  if (next.length === orders.length) throw new Error(`Order ${orderId} not found`)
  writeOrders(next)
  removeOrderItemsForOrder(orderId)
}
