import { DEMO_KEYS, loadJson, nowIso, saveJson } from "@/lib/demoPersistence"

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

export type OrderItemPatchDto = Partial<
  Pick<OrderItemRequestDto, "orderId" | "productId" | "quantity" | "unitPrice" | "subtotal">
> & {
  portionType?: PortionType | null
}

function normalizePortionType(v: unknown): PortionType | null {
  const s = String(v ?? "").trim().toUpperCase()
  if (s === "MEDIUM" || s === "LARGE") return s
  return null
}

function normalizeOrderItem(x: unknown): OrderItemResponseDto {
  const r = x as Record<string, unknown>
  const portion =
    r?.portionType ??
    r?.portion_type ??
    r?.portion ??
    r?.portionSize ??
    r?.portion_size ??
    r?.portiontype

  return {
    orderItemId: Number(r?.orderItemId ?? r?.orderItemID ?? r?.id ?? r?.ID),
    orderId: Number(r?.orderId ?? r?.orderID),
    productId: Number(r?.productId ?? r?.productID),
    quantity: Number(r?.quantity),
    portionType: normalizePortionType(portion),
    unitPrice: Number(r?.unitPrice),
    subtotal: Number(r?.subtotal),
    createdAt: String(r?.createdAt ?? ""),
    updatedAt: (r?.updatedAt as string | null) ?? null,
  }
}

function unwrapList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  const d = data as Record<string, unknown> | null
  if (Array.isArray(d?.data)) return d.data as unknown[]
  if (Array.isArray(d?.content)) return d.content as unknown[]
  return []
}

function readAll(): OrderItemResponseDto[] {
  const raw = loadJson<unknown[]>(DEMO_KEYS.orderItems, [])
  return unwrapList(raw).map(normalizeOrderItem).filter((i) => Number.isFinite(i.orderItemId))
}

function writeAll(list: OrderItemResponseDto[]) {
  saveJson(DEMO_KEYS.orderItems, list)
}

export async function createOrderItem(payload: OrderItemRequestDto): Promise<OrderItemResponseDto> {
  const list = readAll()
  const nextItemId = list.length > 0 ? Math.max(...list.map((i) => i.orderItemId)) + 1 : 1
  const t = nowIso()
  const row: OrderItemResponseDto = {
    orderItemId: nextItemId,
    orderId: payload.orderId,
    productId: payload.productId,
    quantity: payload.quantity,
    portionType: payload.portionType ?? null,
    unitPrice: payload.unitPrice,
    subtotal: payload.subtotal,
    createdAt: t,
    updatedAt: null,
  }
  writeAll([...list, row])
  return row
}

export async function getAllOrderItems(): Promise<OrderItemResponseDto[]> {
  return readAll()
}

export async function getOrderItemById(orderItemId: number): Promise<OrderItemResponseDto> {
  const found = readAll().find((i) => i.orderItemId === orderItemId)
  if (!found) throw new Error(`Order item ${orderItemId} not found`)
  return found
}

export async function updateOrderItem(orderItemId: number, payload: OrderItemRequestDto): Promise<OrderItemResponseDto> {
  const list = readAll()
  const idx = list.findIndex((i) => i.orderItemId === orderItemId)
  if (idx < 0) throw new Error(`Order item ${orderItemId} not found`)
  const t = nowIso()
  const updated: OrderItemResponseDto = {
    ...list[idx],
    orderId: payload.orderId,
    productId: payload.productId,
    quantity: payload.quantity,
    portionType: payload.portionType ?? null,
    unitPrice: payload.unitPrice,
    subtotal: payload.subtotal,
    updatedAt: t,
  }
  list[idx] = updated
  writeAll(list)
  return updated
}

export async function patchOrderItem(orderItemId: number, patch: OrderItemPatchDto): Promise<OrderItemResponseDto> {
  const current = await getOrderItemById(orderItemId)
  const portionType = patch.portionType !== undefined ? patch.portionType : current.portionType
  return updateOrderItem(orderItemId, {
    orderId: patch.orderId ?? current.orderId,
    productId: patch.productId ?? current.productId,
    quantity: patch.quantity ?? current.quantity,
    unitPrice: patch.unitPrice ?? current.unitPrice,
    subtotal: patch.subtotal ?? current.subtotal,
    portionType,
  })
}

export async function deleteOrderItem(orderItemId: number): Promise<void> {
  const list = readAll()
  const next = list.filter((i) => i.orderItemId !== orderItemId)
  if (next.length === list.length) throw new Error(`Order item ${orderItemId} not found`)
  writeAll(next)
}
