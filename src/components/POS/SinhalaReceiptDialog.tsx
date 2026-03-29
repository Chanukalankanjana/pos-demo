import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import type { Kitchen } from "@/lib/ordersApi"

export type ReceiptLine = {
  name: string
  qty: number
  unitPrice: number
  lineTotal: number
  portion?: string
}

/** English payment receipt for the customer. */
export type CustomerBillPayload = {
  orderId: number
  lines: ReceiptLine[]
  subtotal: number
  taxAmount: number
  total: number
  tableLabel: string
  paymentLabel: string
  orderTypeLabel: string
}

export type KitchenTicketLine = {
  nameEn: string
  nameSi: string | null
  qty: number
  portionSi?: string
}

/** One prep ticket per station (Sinhala UI, no prices). */
export type KitchenTicketPayload = {
  kitchen: Kitchen
  kitchenBadgeSi: string
  orderId: number
  tableLabel: string
  orderTypeLabelSi: string
  lines: KitchenTicketLine[]
}

export type OrderBillsPayload = {
  customer: CustomerBillPayload
  kitchenTickets: KitchenTicketPayload[]
}

const kotLabels = {
  title: "මුළුතැන්ගෙයි ඇණවුම", // Kitchen Order එකට වඩාත් ගැළපෙන වචනය
  subtitle: "(මිල ගණන් ඇතුළත් නොවේ)", // වඩාත් පැහැදිලියි
  orderNo: "ඇණවුම් අංකය",
  table: "මේස අංකය",
  orderType: "ඇණවුම් වර්ගය",
  time: "වේලාව",
  item: "අයිතමය / විස්තරය",
  qty: "ප්‍රමාණය",
  note: "විශේෂ සටහන්", // Note එකට වඩාත් වෘත්තීය පෙනුමක් ලබා දෙයි
  none: "—",
  prepNote: "මෙම පත්‍රිකාව ආහාර පිළියෙළ කිරීම සඳහා පමණි.",
}

const customerLabels = {
  restaurant: "Restaurant",
  receipt: "Customer receipt",
  date: "Date",
  orderNo: "Order #",
  table: "Table",
  orderType: "Order type",
  payment: "Payment",
  item: "Item",
  qty: "Qty",
  unit: "Unit",
  amount: "Amount",
  sub: "Subtotal",
  tax: "Tax (10%)",
  grand: "Total",
  thanks: "Thank you — please visit again.",
}

function kotLineDisplay(line: KitchenTicketLine) {
  const si = line.nameSi?.trim()
  return si && si.length > 0 ? si : line.nameEn
}

/** Matches index.css — embedded in print popup so styles apply without Tailwind */
const KOT_PRINT_STYLES = `
  .kot-title {
    font-size: 1.4rem;
    border-bottom: 2px solid #000;
    padding-bottom: 5px;
    margin-bottom: 10px;
    text-align: center;
    font-weight: bold;
  }
  .kot-table {
    font-size: 1.1rem;
    line-height: 1.8;
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
  }
  .kot-table th, .kot-table td {
    text-align: left;
    padding: 6px 4px;
    border-bottom: 1px solid #eee;
  }
  .kot-table th:nth-child(2), .kot-table td:nth-child(2) { text-align: center; }
  .kot-table th:nth-child(3), .kot-table td:nth-child(3) { text-align: right; }
  .kot-table th { font-weight: 600; }
  .prep-note {
    font-style: italic;
    font-size: 0.85rem;
    margin-top: 20px;
    text-align: center;
    border-top: 1px dashed #666;
    padding-top: 10px;
  }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #111; color: #fff; font-size: 0.85rem; margin: 8px 0; }
  .kot-page { page-break-after: always; }
  .kot-page:last-child { page-break-after: auto; }
  .kot-subtitle { font-size: 0.7rem; color: #666; text-align: center; margin: 4px 0 8px; }
  .kot-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 0.75rem; margin-top: 8px; }
`

function openPrintWindow(elementId: string, documentTitle: string, sinhalaFont: boolean) {
  const node = document.getElementById(elementId)
  if (!node) return
  const fontLink = sinhalaFont
    ? `<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;600;700&display=swap" rel="stylesheet">`
    : ""
  const bodyFont = sinhalaFont
    ? "'Noto Sans Sinhala', system-ui, sans-serif"
    : "system-ui, -apple-system, Segoe UI, sans-serif"
  const w = window.open("", "_blank", "width=400,height=700")
  if (!w) return
  const kotBlock = sinhalaFont ? KOT_PRINT_STYLES : ""
  w.document.write(`<!DOCTYPE html><html><head>
    <title>${documentTitle}</title>
    ${fontLink}
    <style>
      body { font-family: ${bodyFont}; padding: 16px; max-width: 380px; margin: 0 auto; }
      ${kotBlock}
      ${sinhalaFont ? "" : `table { width: 100%; border-collapse: collapse; font-size: 0.8rem; margin-top: 12px; }
      th, td { text-align: left; padding: 4px 2px; border-bottom: 1px solid #eee; }
      th { font-weight: 600; }`}
    </style>
  </head><body>${node.innerHTML}</body></html>`)
  w.document.close()
  w.focus()
  w.print()
  w.close()
}

function renderKotInnerHtml(ticket: KitchenTicketPayload, d: Date) {
  const rows = ticket.lines
    .map(
      (line) => `<tr>
      <td>${kotLineDisplay(line)}</td>
      <td style="font-weight:700">${line.qty}</td>
      <td>${line.portionSi ?? kotLabels.none}</td>
    </tr>`,
    )
    .join("")
  return `
    <div class="kot-title">${kotLabels.title}</div>
    <p class="kot-subtitle">${kotLabels.subtitle}</p>
    <div style="text-align:center"><span class="badge">${ticket.kitchenBadgeSi}</span></div>
    <div class="kot-meta">
      <span>${kotLabels.orderNo}:</span><span style="text-align:right;font-family:monospace;font-weight:700">#${ticket.orderId}</span>
      <span>${kotLabels.table}:</span><span style="text-align:right">${ticket.tableLabel}</span>
      <span>${kotLabels.orderType}:</span><span style="text-align:right">${ticket.orderTypeLabelSi}</span>
      <span>${kotLabels.time}:</span><span style="text-align:right">${d.toLocaleString()}</span>
    </div>
    <table class="kot-table">
      <thead><tr>
        <th>${kotLabels.item}</th>
        <th style="width:3rem">${kotLabels.qty}</th>
        <th>${kotLabels.note}</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="prep-note">${kotLabels.prepNote}</p>
  `
}

function printAllKitchenTickets(tickets: KitchenTicketPayload[], d: Date) {
  if (tickets.length === 0) return
  const pages = tickets
    .map(
      (t, i) =>
        `<div class="kot-page">${renderKotInnerHtml(t, d)}</div>`,
    )
    .join("")
  const w = window.open("", "_blank", "width=400,height=700")
  if (!w) return
  w.document.write(`<!DOCTYPE html><html><head>
    <title>Kitchen-tickets</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      body { font-family: 'Noto Sans Sinhala', system-ui, sans-serif; padding: 16px; max-width: 380px; margin: 0 auto; }
      ${KOT_PRINT_STYLES}
    </style>
  </head><body>${pages}</body></html>`)
  w.document.close()
  w.focus()
  w.print()
  w.close()
}

export function SinhalaReceiptDialog({
  open,
  onOpenChange,
  payload,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  payload: OrderBillsPayload | null
}) {
  const [tab, setTab] = useState("customer")

  if (!payload) return null

  const printCustomerId = "print-customer-bill"
  const d = new Date()

  const lineDisplayName = (line: ReceiptLine) =>
    line.portion ? `${line.name} (${line.portion})` : line.name

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (v) setTab("customer")
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Order complete</DialogTitle>
          <p className="text-center text-sm text-muted-foreground font-normal">
            Print the English customer bill and each Sinhala kitchen ticket (split by station). You can print them one by one or all KOTs in one job.
          </p>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="flex h-auto min-h-10 w-full flex-wrap justify-start gap-1 bg-muted/50 p-1">
            <TabsTrigger value="customer" className="flex-1 min-w-[8rem]">
              Customer bill
            </TabsTrigger>
            {payload.kitchenTickets.map((t) => (
              <TabsTrigger key={t.kitchen} value={`kot-${t.kitchen}`} className="flex-1 min-w-[8rem]">
                KOT · {t.kitchen === "KITCHEN_1" ? "Kitchen 1" : "Kitchen 2"}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="customer" className="mt-4 space-y-3">
            <div
              id={printCustomerId}
              className="space-y-3 text-sm p-2 border rounded-lg bg-card"
              style={{ fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}
            >
              <div className="text-center border-b pb-2">
                <p className="font-semibold text-base">{customerLabels.restaurant}</p>
                <p className="text-xs text-muted-foreground">{customerLabels.receipt}</p>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span>{customerLabels.date}:</span>
                <span className="text-right">{d.toLocaleString()}</span>
                <span>{customerLabels.orderNo}:</span>
                <span className="text-right font-mono">#{payload.customer.orderId}</span>
                <span>{customerLabels.table}:</span>
                <span className="text-right">{payload.customer.tableLabel}</span>
                <span>{customerLabels.orderType}:</span>
                <span className="text-right">{payload.customer.orderTypeLabel}</span>
                <span>{customerLabels.payment}:</span>
                <span className="text-right">{payload.customer.paymentLabel}</span>
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1">{customerLabels.item}</th>
                    <th className="text-center w-10">{customerLabels.qty}</th>
                    <th className="text-right">{customerLabels.unit}</th>
                    <th className="text-right">{customerLabels.amount}</th>
                  </tr>
                </thead>
                <tbody>
                  {payload.customer.lines.map((line, i) => (
                    <tr key={i} className="border-b border-muted/50">
                      <td className="py-1.5 pr-1">{lineDisplayName(line)}</td>
                      <td className="text-center">{line.qty}</td>
                      <td className="text-right whitespace-nowrap">{formatCurrency(line.unitPrice)}</td>
                      <td className="text-right whitespace-nowrap font-medium">{formatCurrency(line.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-1 text-xs border-t pt-2">
                <div className="flex justify-between">
                  <span>{customerLabels.sub}</span>
                  <span>{formatCurrency(payload.customer.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{customerLabels.tax}</span>
                  <span>{formatCurrency(payload.customer.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-1">
                  <span>{customerLabels.grand}</span>
                  <span>{formatCurrency(payload.customer.total)}</span>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground pt-2">{customerLabels.thanks}</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <Button type="button" onClick={() => openPrintWindow(printCustomerId, "Customer-receipt", false)}>
                Print customer bill
              </Button>
              {payload.kitchenTickets.length > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => printAllKitchenTickets(payload.kitchenTickets, d)}
                >
                  Print all kitchen tickets
                </Button>
              )}
            </div>
          </TabsContent>

          {payload.kitchenTickets.map((ticket) => {
            const printId = `print-kot-${ticket.kitchen}`
            return (
              <TabsContent key={ticket.kitchen} value={`kot-${ticket.kitchen}`} className="mt-4 space-y-3">
                <div
                  id={printId}
                  className="space-y-2 p-2 border rounded-lg bg-card"
                  style={{ fontFamily: "'Noto Sans Sinhala', system-ui, sans-serif" }}
                >
                  <div className="kot-title">{kotLabels.title}</div>
                  <p className="text-center text-[10px] text-muted-foreground">{kotLabels.subtitle}</p>
                  <div className="text-center">
                    <span className="inline-block rounded-md bg-foreground px-3 py-1 text-sm text-background">
                      {ticket.kitchenBadgeSi}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span>{kotLabels.orderNo}:</span>
                    <span className="text-right font-mono font-bold">#{ticket.orderId}</span>
                    <span>{kotLabels.table}:</span>
                    <span className="text-right">{ticket.tableLabel}</span>
                    <span>{kotLabels.orderType}:</span>
                    <span className="text-right">{ticket.orderTypeLabelSi}</span>
                    <span>{kotLabels.time}:</span>
                    <span className="text-right">{d.toLocaleString()}</span>
                  </div>

                  <table className="kot-table w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1 font-semibold">{kotLabels.item}</th>
                        <th className="text-center w-12 font-semibold">{kotLabels.qty}</th>
                        <th className="text-right font-semibold">{kotLabels.note}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticket.lines.map((line, i) => (
                        <tr key={i} className="border-b border-muted/50">
                          <td className="py-1.5 pr-1 font-medium">{kotLineDisplay(line)}</td>
                          <td className="text-center font-bold">{line.qty}</td>
                          <td className="text-right text-muted-foreground">{line.portionSi ?? kotLabels.none}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <p className="prep-note text-foreground">{kotLabels.prepNote}</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => openPrintWindow(printId, `Kitchen-${ticket.kitchen}`, true)}
                  >
                    Print this kitchen ticket
                  </Button>
                  {payload.kitchenTickets.length > 1 && (
                    <Button type="button" variant="outline" onClick={() => printAllKitchenTickets(payload.kitchenTickets, d)}>
                      Print all kitchen tickets
                    </Button>
                  )}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>

        <div className="flex gap-2 justify-end border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
