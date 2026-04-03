"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/Layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Minus, Trash2, CreditCard, Search } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { formatItemCode } from "@/lib/itemCode"
import { getAllProducts, type ProductResponseDto, type PortionSize } from "@/lib/productsApi"
import { getAllCategories, type CategoryResponseDto } from "@/lib/categoriesApi"
import { createOrder, type Kitchen, type OrderType, type PaymentMethod } from "@/lib/ordersApi"
import { createOrderItem, deleteOrderItem, getAllOrderItems } from "@/lib/orderItemsApi"
import {
  SinhalaReceiptDialog,
  type KitchenTicketPayload,
  type OrderBillsPayload,
} from "@/components/POS/SinhalaReceiptDialog"

const paymentLabels: Record<PaymentMethod, string> = {
  CASH: "Cash",
  CARD: "Card",
  BANK_TRANSFER: "Bank transfer",
  CASH_ON_DELIVERY: "Cash on delivery",
}

const orderTypeLabels: Record<OrderType, string> = {
  DINE_IN: "Dine in",
  TAKE_AWAY: "Take away",
  DELIVERY: "Delivery",
}

const orderTypeLabelSi: Record<OrderType, string> = {
  DINE_IN: "ආපන ශාලාව",
  TAKE_AWAY: "නිවසට ගෙන යාම",
  DELIVERY: "ඩිලිවරි",
}

interface CartItem {
  lineKey: string
  productId: number
  name: string
  /** Station from menu item — used to split KOTs */
  kitchen: Kitchen
  nameSinhala: string | null
  unitPrice: number
  quantity: number
  portionSize?: PortionSize
  imageUrl?: string
  description?: string
}

function portionLabelSi(p?: PortionSize): string | undefined {
  if (p === "MEDIUM") return "මධ්‍යම"
  if (p === "LARGE") return "විශාල"
  return undefined
}

function buildKitchenTickets(
  cart: CartItem[],
  orderId: number,
  tableLabel: string,
  orderType: OrderType,
  kitchenNote?: string | null,
): KitchenTicketPayload[] {
  const map = new Map<Kitchen, KitchenTicketPayload["lines"]>()
  for (const c of cart) {
    const list = map.get(c.kitchen) ?? []
    list.push({
      nameEn: c.name,
      nameSi: c.nameSinhala,
      qty: c.quantity,
      portionSi: portionLabelSi(c.portionSize),
    })
    map.set(c.kitchen, list)
  }
  const stationOrder: Kitchen[] = ["KITCHEN_1", "KITCHEN_2"]
  return stationOrder
    .filter((k) => (map.get(k)?.length ?? 0) > 0)
    .map((k) => ({
      kitchen: k,
      kitchenBadgeSi: k === "KITCHEN_1" ? "කුස්සිය 1" : "කුස්සිය 2",
      orderId,
      tableLabel,
      orderTypeLabelSi: orderTypeLabelSi[orderType],
      kitchenNote,
      lines: map.get(k)!,
    }))
}

const cartKey = (productId: number, portionSize?: PortionSize) => `${productId}:${portionSize ?? "DEFAULT"}`

const getUnitPriceForPortion = (item: ProductResponseDto, portionSize?: PortionSize) => {
  if (!item.hasPortionPricing) return item.sellingPrice
  if (!portionSize) return NaN
  const price = item.portionPrices?.[portionSize]
  return typeof price === "number" && Number.isFinite(price) ? price : item.sellingPrice
}

const POS = () => {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedTable, setSelectedTable] = useState("5")
  const [menuItems, setMenuItems] = useState<ProductResponseDto[]>([])
  const [categories, setCategories] = useState<CategoryResponseDto[]>([])
  const [activeTab, setActiveTab] = useState("all")

  const [searchQuery, setSearchQuery] = useState("")

  const [orderType, setOrderType] = useState<OrderType>("DINE_IN")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH")
  const [kitchenNote, setKitchenNote] = useState("")
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [lastReceipt, setLastReceipt] = useState<OrderBillsPayload | null>(null)

  const handleCategoryDragStart = (event: React.DragEvent<HTMLButtonElement>, categoryId: number) => {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", String(categoryId))
  }

  const handleCategoryDrop = (event: React.DragEvent<HTMLButtonElement>, targetCategoryId: number) => {
    event.preventDefault()
    const raw = event.dataTransfer.getData("text/plain")
    const draggedId = Number(raw)
    if (!Number.isFinite(draggedId) || draggedId === targetCategoryId) return

    setCategories((prev) => {
      const srcIndex = prev.findIndex((c) => Number(c.categoryId) === draggedId)
      const dstIndex = prev.findIndex((c) => Number(c.categoryId) === targetCategoryId)
      if (srcIndex < 0 || dstIndex < 0 || srcIndex === dstIndex) return prev
      const next = [...prev]
      const [moved] = next.splice(srcIndex, 1)
      next.splice(dstIndex, 0, moved)
      return next
    })
  }

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const [cats, prods] = await Promise.all([getAllCategories(), getAllProducts()])
        if (cancelled) return

        const activeCats = cats.filter((c) => c.isActive !== false)

        const unique = new Map<number, CategoryResponseDto>()
        for (const c of activeCats) unique.set(Number(c.categoryId), c)

        setCategories(Array.from(unique.values()))
        setMenuItems(prods.filter((p) => p.isAvailable !== false))
      } catch (e) {
        console.error(e)
        toast.error("Failed to load categories/products")
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const addToCart = (item: ProductResponseDto, portionSize?: PortionSize) => {
    // If item has portion pricing, user must pick a portion
    if (item.hasPortionPricing && !portionSize) {
      toast.error("Please select Medium or Large")
      return
    }

    const unitPrice = getUnitPriceForPortion(item, portionSize)
    if (!Number.isFinite(unitPrice)) {
      toast.error("Invalid portion price")
      return
    }

    const lineKey = cartKey(item.productId, portionSize)
    const existing = cart.find((c) => c.lineKey === lineKey)

    if (existing) {
      setCart((prev) => prev.map((c) => (c.lineKey === lineKey ? { ...c, quantity: c.quantity + 1 } : c)))
      return
    }

    setCart((prev) => [
      ...prev,
      {
        lineKey,
        productId: item.productId,
        name: item.name,
        kitchen: item.kitchen === "KITCHEN_2" ? "KITCHEN_2" : "KITCHEN_1",
        nameSinhala: item.nameSinhala ?? null,
        unitPrice,
        quantity: 1,
        portionSize,
        imageUrl: item.imageUrl,
        description: item.description,
      },
    ])
  }

  const updateQuantity = (lineKey: string, change: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.lineKey !== lineKey) return item
          const newQuantity = item.quantity + change
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
        })
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (lineKey: string) => {
    setCart((prev) => prev.filter((item) => item.lineKey !== lineKey))
  }

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredMenuItems = normalizedSearch
    ? menuItems.filter((item) => {
        const name = item.name.toLowerCase()
        const code = formatItemCode(item.productId).toLowerCase()
        return name.includes(normalizedSearch) || code.includes(normalizedSearch)
      })
    : menuItems

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const taxAmount = Number((subtotal * 0.1).toFixed(2))
  const discountAmount = 0
  const totalAmount = Number((subtotal + taxAmount - discountAmount).toFixed(2))

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty")
      return
    }

    // /orders requires items: [{productId, quantity}] (no portion here)
    const itemsAggMap = new Map<number, number>()
    for (const c of cart) itemsAggMap.set(c.productId, (itemsAggMap.get(c.productId) ?? 0) + c.quantity)
    const items = Array.from(itemsAggMap.entries()).map(([productId, quantity]) => ({ productId, quantity }))

    let tableNumber: number | null = null
    if (orderType === "DINE_IN") {
      const parsed = Number(String(selectedTable).replace(/\D/g, "")) || 0
      if (!parsed) {
        toast.error("Table number is required for DINE_IN orders")
        return
      }
      tableNumber = parsed
    } else {
      tableNumber = null
    }

    const portionProductIds = new Set(cart.filter((c) => !!c.portionSize).map((c) => c.productId))
    const portionLines = cart.filter((c) => !!c.portionSize)
    const nonPortionLines = cart.filter((c) => !c.portionSize)

    try {
      const orderKitchen: Kitchen = cart[0]!.kitchen

      const order = await createOrder({
        tableNumber,
        totalAmount,
        taxAmount,
        discountAmount,
        paymentMethod,
        status: "PAID",
        orderType,
        kitchen: orderKitchen,
        items,
      })

      // If backend auto-created order-items from /orders, remove the "portionType=null" rows
      // for portion-priced products, then create correct portion rows.
      let existingForOrderCount = 0
      try {
        const all = await getAllOrderItems()
        const existingForOrder = all.filter((i) => i.orderId === order.orderId)
        existingForOrderCount = existingForOrder.length

        const toDelete = existingForOrder.filter(
          (i) => portionProductIds.has(i.productId) && (i.portionType == null || i.portionType === undefined),
        )

        await Promise.all(toDelete.map((i) => deleteOrderItem(i.orderItemId)))
      } catch (e) {
        // If this fails, continue (worst case Orders page may show duplicates)
        console.error(e)
      }

      // Create portion order-items (MEDIUM/LARGE) always (so Orders UI can show them)
      await Promise.all(
        portionLines.map((c) =>
          createOrderItem({
            orderId: order.orderId,
            productId: c.productId,
            quantity: c.quantity,
            portionType: c.portionSize!, // guaranteed
            unitPrice: c.unitPrice,
            subtotal: Number((c.unitPrice * c.quantity).toFixed(2)),
          }),
        ),
      )

      // Only create non-portion order-items if backend DID NOT create any order-items for this order
      // (fallback for environments where /orders doesn't auto-create /order-items)
      if (existingForOrderCount === 0) {
        await Promise.all(
          nonPortionLines.map((c) =>
            createOrderItem({
              orderId: order.orderId,
              productId: c.productId,
              quantity: c.quantity,
              portionType: null,
              unitPrice: c.unitPrice,
              subtotal: Number((c.unitPrice * c.quantity).toFixed(2)),
            }),
          ),
        )
      }

      const tableLabel = orderType === "DINE_IN" ? String(selectedTable) : "—"
      const portionLabel = (p?: PortionSize) =>
        p === "MEDIUM" ? "Medium" : p === "LARGE" ? "Large" : undefined

      const lines = cart.map((c) => ({
        name: c.name,
        qty: c.quantity,
        unitPrice: c.unitPrice,
        lineTotal: Number((c.unitPrice * c.quantity).toFixed(2)),
        portion: portionLabel(c.portionSize),
      }))

      setLastReceipt({
        customer: {
          orderId: order.orderId,
          lines,
          subtotal,
          taxAmount,
          total: totalAmount,
          tableLabel,
          paymentLabel: paymentLabels[paymentMethod],
          orderTypeLabel: orderTypeLabels[orderType],
        },
        kitchenTickets: buildKitchenTickets(cart, order.orderId, tableLabel, orderType, kitchenNote),
      })
      setReceiptOpen(true)

      toast.success(`Order ${order.orderId} placed! Total: ${formatCurrency(totalAmount)}`)
      setCart([])
    } catch (e) {
      console.error(e)
      toast.error("Failed to place order")
    }
  }

  const renderItemsGrid = (items: ProductResponseDto[]) => (
    <>
      <div className="mb-2 text-sm text-muted-foreground">Showing {items.length} items</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((item) => {
          const hasImage = Boolean(item.imageUrl)
          const isPortion = !!item.hasPortionPricing

          return (
            <Card
              key={item.productId}
              className="cursor-pointer modern-card group border-0 shadow-modern hover:shadow-modern-lg transition-all duration-300"
              onClick={() => {
                // Only add directly if not portion-priced
                if (!isPortion) addToCart(item)
              }}
            >
              <CardContent className="p-4">
                <div className="relative aspect-square rounded-xl mb-4 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <span className="absolute left-2 top-2 z-10 rounded-md bg-background/90 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground shadow-sm border border-border/60">
                    {formatItemCode(item.productId)}
                  </span>
                  <img
                    src={item.imageUrl ?? undefined}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    style={{ display: hasImage ? undefined : "none" }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement | null
                      if (fallback) fallback.style.display = "flex"
                    }}
                  />
                  <div
                    className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center"
                    style={{ display: hasImage ? "none" : "flex" }}
                  >
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🍽️</span>
                  </div>
                </div>

                <h3 className="font-bold text-base group-hover:text-primary transition-colors duration-200">
                  {item.name}
                </h3>

                {item.description && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2 group-hover:line-clamp-none">
                    {item.description}
                  </p>
                )}

                {!isPortion ? (
                  <p className="mt-2 text-accent font-bold text-lg">{formatCurrency(item.sellingPrice)}</p>
                ) : (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Choose portion</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border bg-muted/40 text-muted-foreground">
                        Tap to add
                      </span>
                    </div>

                    {/* vertical buttons to avoid overlap */}
                    <div className="flex flex-col gap-2 rounded-xl border border-muted/60 bg-muted/20 p-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className="group h-11 w-full rounded-lg border border-muted/70 bg-background/70 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all justify-between px-3"
                        onClick={(e) => {
                          e.stopPropagation()
                          addToCart(item, "MEDIUM")
                        }}
                      >
                        <span className="text-sm font-semibold">Medium</span>
                        <span className="text-xs font-bold px-2 py-1 rounded-md bg-muted/60 group-hover:bg-primary/10">
                          {formatCurrency(item.portionPrices?.MEDIUM ?? item.sellingPrice)}
                        </span>
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        className="group h-11 w-full rounded-lg border border-muted/70 bg-background/70 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all justify-between px-3"
                        onClick={(e) => {
                          e.stopPropagation()
                          addToCart(item, "LARGE")
                        }}
                      >
                        <span className="text-sm font-semibold">Large</span>
                        <span className="text-xs font-bold px-2 py-1 rounded-md bg-muted/60 group-hover:bg-primary/10">
                          {formatCurrency(item.portionPrices?.LARGE ?? item.sellingPrice)}
                        </span>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-full h-1 bg-gradient-to-r from-primary to-accent rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )

  return (
    <DashboardLayout>
      <SinhalaReceiptDialog open={receiptOpen} onOpenChange={setReceiptOpen} payload={lastReceipt} />

      <div className="h-screen flex flex-col bg-gradient-to-br from-background to-muted/20">
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Point of Sale
              </h1>
              <p className="text-muted-foreground mt-1 text-base">Process orders and payments with ease</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
                <span className="text-accent font-semibold text-sm">Table {selectedTable}</span>
              </div>
              <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 pb-4 min-h-0">
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-1">
              <div className="mb-2">
                <div className="pb-2">
                  <div className="text-xl font-bold flex items-center gap-2">
                    <div className="w-6 h-6 gradient-primary rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🍽️</span>
                    </div>
                    Menu Items
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <TabsList className="w-full flex flex-wrap gap-1 bg-muted/50 p-1 rounded-xl h-auto md:w-auto">
                    <TabsTrigger
                      value="all"
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-modern"
                    >
                      All
                    </TabsTrigger>

                    {categories.map((c) => (
                      <TabsTrigger
                        key={c.categoryId}
                        value={String(c.categoryId)}
                        draggable
                        onDragStart={(e) => handleCategoryDragStart(e, Number(c.categoryId))}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleCategoryDrop(e, Number(c.categoryId))}
                        className="cursor-move rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-modern"
                      >
                        {c.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <div className="relative w-full md:w-64">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search item or code (ITM-0001)"
                      className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-xs"
                    />
                  </div>
                </div>

              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain scroll-smooth min-h-0 max-h-[calc(100vh-160px)] pr-1">
                <Card className="modern-card shadow-modern-lg border-0">
                  <CardContent className="pt-2">
                    <TabsContent value="all" className="mt-0">
                      {renderItemsGrid(filteredMenuItems)}
                    </TabsContent>

                    {categories.map((c) => (
                      <TabsContent key={c.categoryId} value={String(c.categoryId)} className="mt-0">
                        {renderItemsGrid(
                          filteredMenuItems.filter((p) => p.categoryId === c.categoryId),
                        )}
                      </TabsContent>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </Tabs>
          </div>

          <div className="flex min-h-0 flex-col lg:h-full">
            <div className="flex min-h-0 flex-1 flex-col">
              <Card className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden modern-card shadow-modern-lg border-0 w-full max-w-md lg:w-96">
                <CardHeader className="shrink-0 pb-2">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <div className="w-6 h-6 gradient-accent rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🛒</span>
                    </div>
                    Current Order
                  </CardTitle>

                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Order Type</label>
                      <select
                        value={orderType}
                        onChange={(e) => {
                          const next = e.target.value as OrderType
                          setOrderType(next)
                          if (next !== "DINE_IN") setSelectedTable("")
                        }}
                        className="flex h-10 w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      >
                        <option value="DINE_IN">Dine In</option>
                        <option value="TAKE_AWAY">Take Away</option>
                        <option value="DELIVERY">Delivery</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Payment</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="flex h-10 w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      >
                        <option value="CASH">Cash</option>
                        <option value="CARD">Card</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
                      </select>
                    </div>

                    <p className="text-xs text-muted-foreground rounded-lg border border-muted/60 bg-muted/20 px-3 py-2">
                      Each menu item is assigned to Kitchen 1 or Kitchen 2 in{" "}
                      <span className="font-medium text-foreground">Menu Items</span>. The POS splits printed kitchen
                      tickets by station automatically.
                    </p>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">
                        Table Number {orderType !== "DINE_IN" ? "(Dine In only)" : ""}
                      </label>
                      <Input
                        value={selectedTable}
                        onChange={(e) => setSelectedTable(e.target.value)}
                        disabled={orderType !== "DINE_IN"}
                        className="rounded-xl border-2 focus:border-primary transition-colors duration-200"
                        placeholder={orderType === "DINE_IN" ? "Enter table number" : "Not required"}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">
                        Kitchen note (KOT only)
                      </label>
                      <Input
                        value={kitchenNote}
                        onChange={(e) => setKitchenNote(e.target.value)}
                        placeholder="E.g. No onions, extra spicy, pack separately"
                        className="rounded-xl border-2 focus:border-primary transition-colors duration-200 text-xs"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Printed only on kitchen tickets — not on the customer bill.
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 pb-6 pt-0">
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
                    <div className="space-y-1 pb-2">
                      {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mb-1">
                            <span className="text-sm">🛒</span>
                          </div>
                          <p className="text-sm justify-center font-medium mb-0">No items in cart</p>
                          <p className="text-xs justify-center text-muted-foreground">Add items from menu to start</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {cart.map((item) => (
                            <div
                              key={item.lineKey}
                              className="flex flex-col gap-2 p-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border border-muted/50 hover:shadow-modern transition-all duration-200"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm leading-tight">{item.name}</p>
                                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                                    {formatItemCode(item.productId)}
                                  </p>
                                  <p className="text-xs text-accent font-medium mt-1">
                                    {formatCurrency(item.unitPrice)} each
                                  </p>
                                </div>
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  className="h-6 w-6 rounded-md flex-shrink-0"
                                  onClick={() => removeItem(item.lineKey)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1 bg-background rounded-md p-1">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-6 w-6 rounded-md bg-transparent"
                                    onClick={() => updateQuantity(item.lineKey, -1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-6 w-6 rounded-md bg-transparent"
                                    onClick={() => updateQuantity(item.lineKey, 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>

                                <span className="text-sm font-bold text-accent">
                                  {formatCurrency(item.unitPrice * item.quantity)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 space-y-1 border-t border-muted/50 bg-card pt-3 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Subtotal</span>
                      <span className="font-bold">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Tax (10%)</span>
                      <span className="font-bold">{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-1 border-t-2 border-primary/20">
                      <span>Total</span>
                      <span className="text-accent">{formatCurrency(totalAmount)}</span>
                    </div>

                    <Button
                      className="w-full h-10 text-base font-bold rounded-lg modern-button gradient-primary hover:shadow-modern-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                      size="lg"
                      disabled={cart.length === 0}
                      onClick={handleCheckout}
                    >
                      <CreditCard className="mr-3 h-5 w-5" />
                      Process Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default POS
