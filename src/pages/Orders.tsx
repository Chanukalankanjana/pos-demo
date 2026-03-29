"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/Layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ClipboardList, Search, Pencil, Trash2, Clock, CheckCircle, XCircle } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { getAllProducts } from "@/lib/productsApi"
import {
  getAllOrders,
  patchOrder,
  deleteOrder,
  type OrderResponseDto,
  type OrderStatus,
  type PaymentMethod,
  type OrderType,
} from "@/lib/ordersApi"
import { getAllOrderItems, type OrderItemResponseDto } from "@/lib/orderItemsApi"

const statusLabels: Record<OrderStatus, string> = {
  NEW: "Pending",
  PAID: "Paid",
  CANCELLED: "Cancelled",
  UPDATED: "Updated",
}

const statusColors: Record<OrderStatus, string> = {
  NEW: "bg-amber-100 text-amber-800 border-amber-300",
  PAID: "bg-emerald-100 text-emerald-800 border-emerald-300",
  CANCELLED: "bg-red-100 text-red-800 border-red-300",
  UPDATED: "bg-sky-100 text-sky-800 border-sky-300",
}

const statusBorderColors: Record<OrderStatus, string> = {
  NEW: "border-l-4 border-l-amber-500",
  PAID: "border-l-4 border-l-emerald-500",
  CANCELLED: "border-l-4 border-l-red-500",
  UPDATED: "border-l-4 border-l-sky-500",
}

const statusIcons = {
  NEW: Clock,
  PAID: CheckCircle,
  CANCELLED: XCircle,
  UPDATED: Clock,
} as const

type UiOrderItem = OrderItemResponseDto & { name: string }


type UiOrder = Omit<OrderResponseDto, "items"> & {
  items: UiOrderItem[]
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} min ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return d.toLocaleDateString()
}

function normalizeOrderStatus(value: unknown): OrderStatus {
  const v = String(value ?? "").trim().toUpperCase()
  if (v === "CANCELED") return "CANCELLED"
  if (v === "NEW" || v === "PAID" || v === "CANCELLED" || v === "UPDATED") return v
  return "NEW"
}

function normalizePaymentMethod(value: unknown): PaymentMethod {
  const v = String(value ?? "").trim().toUpperCase()
  if (v === "PAYPAL") return "CASH"
  if (v === "CASH" || v === "CARD" || v === "BANK_TRANSFER" || v === "CASH_ON_DELIVERY") return v
  return "CASH"
}

export default function Orders() {
  const [orders, setOrders] = useState<UiOrder[]>([])
  const [search, setSearch] = useState("")
  const [editingOrder, setEditingOrder] = useState<UiOrder | null>(null)
  const [deleteOrderId, setDeleteOrderId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refresh = async () => {
    setIsLoading(true)
    try {
      const [ordersRes, orderItemsRes, productsRes] = await Promise.all([getAllOrders(), getAllOrderItems(), getAllProducts()])

      const productNameById = new Map<number, string>()
      for (const p of productsRes) productNameById.set(p.productId, p.name)

      const itemsByOrderId = new Map<number, OrderItemResponseDto[]>()
      for (const item of orderItemsRes) {
        const list = itemsByOrderId.get(item.orderId) ?? []
        list.push(item)
        itemsByOrderId.set(item.orderId, list)
      }

      const combined: UiOrder[] = ordersRes
        .slice()
        .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
        .map((o) => {
          const rawItems = (itemsByOrderId.get(o.orderId) ?? []).map((it) => ({
            ...it,
            name: productNameById.get(it.productId) ?? `Product #${it.productId}`,
          }))

          // If a product has MEDIUM/LARGE lines, hide its auto-created "portionType=null" line
          const portionProductIds = new Set(rawItems.filter((i) => i.portionType != null).map((i) => i.productId))
          const items = rawItems.filter((i) => {
            if (!portionProductIds.has(i.productId)) return true
            return i.portionType != null
          })

          return {
            ...o,
            status: normalizeOrderStatus(o.status),
            paymentMethod: normalizePaymentMethod(o.paymentMethod),
            items,
          }
        })

      setOrders(combined)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const filteredBySearch = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((o) => String(o.orderId).toLowerCase().includes(q) || String(o.tableNumber).toLowerCase().includes(q))
  }, [orders, search])

  const byStatus = (status: OrderStatus) => filteredBySearch.filter((o) => o.status === status)

  const newOrders = byStatus("NEW")
  const paidOrders = byStatus("PAID")
  const cancelledOrders = byStatus("CANCELLED")

  const handleStatusChange = async (order: UiOrder, status: OrderStatus) => {
    try {
      const updated = await patchOrder(order.orderId, { status })
      setOrders((prev) => prev.map((o) => (o.orderId === updated.orderId ? { ...o, ...updated } : o)))
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (orderId: number) => {
    try {
      await deleteOrder(orderId)
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId))
      setDeleteOrderId(null)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="p-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Orders
              </h1>
              <p className="text-muted-foreground mt-3 text-xl">Track and manage all orders</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by order ID or table..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Button variant="outline" onClick={refresh} disabled={isLoading}>
                {isLoading ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8">
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="bg-muted/50 p-1 rounded-xl gap-1">
              <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-modern">
                All ({filteredBySearch.length})
              </TabsTrigger>
              <TabsTrigger value="new" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-modern">
                Pending ({newOrders.length})
              </TabsTrigger>
              <TabsTrigger value="paid" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-modern">
                Paid ({paidOrders.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-modern">
                Cancelled ({cancelledOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <OrderList orders={filteredBySearch} onEdit={setEditingOrder} onDelete={setDeleteOrderId} onStatusChange={handleStatusChange} />
            </TabsContent>
            <TabsContent value="new" className="mt-0">
              <OrderList orders={newOrders} onEdit={setEditingOrder} onDelete={setDeleteOrderId} onStatusChange={handleStatusChange} />
            </TabsContent>
            <TabsContent value="paid" className="mt-0">
              <OrderList orders={paidOrders} onEdit={setEditingOrder} onDelete={setDeleteOrderId} onStatusChange={handleStatusChange} />
            </TabsContent>
            <TabsContent value="cancelled" className="mt-0">
              <OrderList orders={cancelledOrders} onEdit={setEditingOrder} onDelete={setDeleteOrderId} onStatusChange={handleStatusChange} />
            </TabsContent>
          </Tabs>
        </div>

        <EditOrderDialog
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSaved={(updated) => {
            setOrders((prev) => prev.map((o) => (o.orderId === updated.orderId ? { ...o, ...updated } : o)))
          }}
        />

        <AlertDialog open={deleteOrderId != null} onOpenChange={(open) => !open && setDeleteOrderId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete order?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove order {deleteOrderId}. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteOrderId != null && handleDelete(deleteOrderId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}

function OrderList({
  orders,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  orders: UiOrder[]
  onStatusChange: (order: UiOrder, status: OrderStatus) => void
  onEdit: (order: UiOrder) => void
  onDelete: (orderId: number) => void
}) {
  if (orders.length === 0) {
    return (
      <Card className="modern-card shadow-modern border-0">
        <CardContent className="py-16 text-center text-muted-foreground">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No orders in this category</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {orders.map((order) => (
        <OrderCard
          key={order.orderId}
          order={order}
          onStatusChange={(status) => onStatusChange(order, status)}
          onEdit={() => onEdit(order)}
          onDelete={() => onDelete(order.orderId)}
        />
      ))}
    </div>
  )
}

function OrderCard({
  order,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  order: UiOrder
  onStatusChange: (status: OrderStatus) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const canChangeStatus = order.status !== "PAID" && order.status !== "CANCELLED"
  const StatusIcon = statusIcons[order.status]

  return (
    <Card className={cn("modern-card shadow-modern border border-border/50 overflow-hidden", statusBorderColors[order.status])}>
      <div className={cn("px-4 py-2 border-b border-border/50 flex items-center justify-between", statusColors[order.status])}>
        <span className="font-semibold text-sm flex items-center gap-2">
          <StatusIcon className="h-4 w-4" />
          {statusLabels[order.status]}
        </span>
        <span className="text-xs opacity-90">{formatTime(order.createdAt || order.orderDate)}</span>
      </div>

      <CardHeader className="pb-2 pt-3 px-4">
        <p className="text-sm font-medium text-muted-foreground mb-2">
          {order.orderType === "DINE_IN" ? `Table ${order.tableNumber ?? "-"}` : String(order.orderType).replace(/_/g, " ")}
        </p>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg font-semibold">
            <span className="text-primary">Order #{order.orderId}</span>
          </CardTitle>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} title="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete} title="Delete">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        {order.items.length === 0 ? (
          <p className="text-sm text-muted-foreground mb-4">No items</p>
        ) : (
          <ul className="space-y-1 mb-4 text-sm">
            {order.items.map((item) => (
              <li key={item.orderItemId} className="flex justify-between">
                <span>
                  {item.name}
                  {item.portionType ? `(${item.portionType})` : ""}
                  {" x "}
                  {item.quantity}
                </span>
                <span className="text-muted-foreground">{formatCurrency(item.subtotal)}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-primary">{formatCurrency(order.totalAmount)}</span>
        </div>

        {canChangeStatus && (
          <div className="mt-3 flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => onStatusChange("PAID")}>
              Mark as Paid
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onStatusChange("CANCELLED")}>
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EditOrderDialog({
  order,
  onClose,
  onSaved,
}: {
  order: UiOrder | null
  onClose: () => void
  onSaved: (updated: OrderResponseDto) => void
}) {
  const [tableNumber, setTableNumber] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH")
  const [status, setStatus] = useState<OrderStatus>("NEW")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!order) return
    setTableNumber(order.tableNumber == null ? "" : String(order.tableNumber))
    setPaymentMethod(normalizePaymentMethod(order.paymentMethod))
    setStatus(normalizeOrderStatus(order.status))
  }, [order])

  const isDineIn: boolean = (order?.orderType as OrderType | undefined) === "DINE_IN"

  const handleSave = async () => {
    if (!order) return
    setSaving(true)
    try {
      const parsedTable = tableNumber.trim() === "" ? null : Number(tableNumber)
      if (isDineIn && (!parsedTable || parsedTable <= 0)) {
        setSaving(false)
        return
      }
      if (!isDineIn && parsedTable != null) {
        setSaving(false)
        return
      }

      const updated = await patchOrder(order.orderId, {
        tableNumber: isDineIn ? parsedTable : null,
        paymentMethod,
        status,
      })

      onSaved(updated)
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  if (!order) return null

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit order #{order.orderId}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Table Number</Label>
            <Input
              type="number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              min={1}
              disabled={!isDineIn}
              placeholder={isDineIn ? "Enter table number" : "Not applicable"}
            />
          </div>

          <div className="grid gap-2">
            <Label>Payment Method</Label>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              <option value="CASH">CASH</option>
              <option value="CARD">CARD</option>
              <option value="BANK_TRANSFER">BANK_TRANSFER</option>
              <option value="CASH_ON_DELIVERY">CASH_ON_DELIVERY</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label>Status</Label>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
            >
              <option value="NEW">Pending</option>
              <option value="PAID">PAID</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="UPDATED">UPDATED</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label>Items</Label>
            <div className="space-y-1 text-sm text-muted-foreground">
              {order.items.length === 0 ? (
                <p>No items</p>
              ) : (
                order.items.map((i) => (
                  <div key={i.orderItemId} className="flex justify-between">
                    <span>
                      {i.name}
                      {i.portionType ? `(${i.portionType})` : ""}
                      {" x "}
                      {i.quantity}
                    </span>
                    <span>{formatCurrency(i.subtotal)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || (isDineIn && (tableNumber.trim() === "" || Number(tableNumber) <= 0))}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
