export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled"

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  table: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  createdAt: string
  notes?: string
}

export const ORDERS_STORAGE_KEY = "pos-orders"

function getNextOrderId(orders: Order[]): string {
  const numbers = orders
    .map((o) => {
      const match = o.id.match(/ORD-(\d+)/i)
      return match ? parseInt(match[1], 10) : 0
    })
    .filter((n) => !Number.isNaN(n))
  const max = numbers.length > 0 ? Math.max(...numbers) : 1000
  return `ORD-${max + 1}`
}

export function loadOrders(): Order[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored) as Order[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveOrders(orders: Order[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
}

/** Add a new order (e.g. from POS checkout). Returns the created order. */
export function addOrder(params: {
  table: string
  items: OrderItem[]
  total: number
  notes?: string
}): Order {
  const orders = loadOrders()
  const newOrder: Order = {
    id: getNextOrderId(orders),
    table: params.table,
    items: params.items,
    total: params.total,
    status: "pending",
    createdAt: new Date().toISOString(),
    notes: params.notes,
  }
  saveOrders([newOrder, ...orders])
  return newOrder
}
