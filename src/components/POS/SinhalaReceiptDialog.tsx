import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  /** Optional special instructions from POS current-order note (Sinhala or English). */
  kitchenNote?: string | null
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function lineDisplayName(line: ReceiptLine): string {
  return line.portion ? `${line.name} (${line.portion})` : line.name
}

/** Build bill HTML from data so print does not rely on portaled dialog DOM (fixes empty / failed print). */
function buildCustomerBillHtml(customer: CustomerBillPayload, d: Date): string {
  const rows = customer.lines
    .map(
      (line) => `<tr>
      <td class="py-1">${escapeHtml(lineDisplayName(line))}</td>
      <td style="text-align:center">${line.qty}</td>
      <td style="text-align:right;white-space:nowrap">${formatCurrency(line.unitPrice)}</td>
      <td style="text-align:right;white-space:nowrap;font-weight:600">${formatCurrency(line.lineTotal)}</td>
    </tr>`,
    )
    .join("")
  return `<div class="customer-print-section">
    <div style="text-align:center;border-bottom:1px solid #e5e5e5;padding-bottom:8px">
      <p style="font-weight:600;font-size:1rem;margin:0">${customerLabels.restaurant}</p>
      <p style="font-size:0.7rem;color:#666;margin:4px 0 0">${customerLabels.receipt}</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:0.75rem;margin-top:8px">
      <span>${customerLabels.date}:</span><span style="text-align:right">${escapeHtml(d.toLocaleString())}</span>
      <span>${customerLabels.orderNo}:</span><span style="text-align:right;font-family:monospace">#${customer.orderId}</span>
      <span>${customerLabels.table}:</span><span style="text-align:right">${escapeHtml(customer.tableLabel)}</span>
      <span>${customerLabels.orderType}:</span><span style="text-align:right">${escapeHtml(customer.orderTypeLabel)}</span>
      <span>${customerLabels.payment}:</span><span style="text-align:right">${escapeHtml(customer.paymentLabel)}</span>
    </div>
    <table>
      <thead><tr>
        <th>${customerLabels.item}</th>
        <th style="width:2.5rem;text-align:center">${customerLabels.qty}</th>
        <th style="text-align:right">${customerLabels.unit}</th>
        <th style="text-align:right">${customerLabels.amount}</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="font-size:0.75rem;border-top:1px solid #e5e5e5;padding-top:8px;margin-top:8px">
      <div style="display:flex;justify-content:space-between"><span>${customerLabels.sub}</span><span>${formatCurrency(customer.subtotal)}</span></div>
      <div style="display:flex;justify-content:space-between"><span>${customerLabels.tax}</span><span>${formatCurrency(customer.taxAmount)}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:1rem;font-weight:700;padding-top:4px"><span>${customerLabels.grand}</span><span>${formatCurrency(customer.total)}</span></div>
    </div>
    <p style="text-align:center;font-size:0.7rem;color:#666;padding-top:8px;margin:0">${customerLabels.thanks}</p>
  </div>`
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
    ${ticket.kitchenNote && ticket.kitchenNote.trim().length > 0 ? `<p class="prep-note">${ticket.kitchenNote}</p>` : `<p class="prep-note">${kotLabels.prepNote}</p>`}
  `
}

function buildPrintDocumentHtml(customerHtml: string, kotSection: string): string {
  return `<!DOCTYPE html><html><head>
    <meta charset="utf-8" />
    <title>Receipt & kitchen tickets</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, sans-serif; padding: 16px; max-width: 380px; margin: 0 auto; }
      .customer-print-section table { width: 100%; border-collapse: collapse; font-size: 0.8rem; margin-top: 12px; }
      .customer-print-section th, .customer-print-section td { text-align: left; padding: 4px 2px; border-bottom: 1px solid #eee; }
      .customer-print-section th { font-weight: 600; }
      ${kotSection ? `.customer-print-section { page-break-after: always; }` : ""}
      ${KOT_PRINT_STYLES}
      .kot-page { font-family: 'Noto Sans Sinhala', system-ui, sans-serif; }
    </style>
  </head><body>${customerHtml}${kotSection}</body></html>`
}

function runPrint(html: string): void {
  const schedulePrint = (win: Window, afterClose?: () => void) => {
    const doc = win.document
    doc.open()
    doc.write(html)
    doc.close()
    win.focus()
    const doPrint = () => {
      win.print()
      const closeLater = () => {
        try {
          win.close()
        } catch {
          /* ignore */
        }
        afterClose?.()
      }
      win.addEventListener("afterprint", closeLater)
      setTimeout(closeLater, 800)
    }
    if (doc.readyState === "complete") {
      setTimeout(doPrint, 100)
    } else {
      win.addEventListener("load", () => setTimeout(doPrint, 100))
    }
  }

  const w = window.open("", "_blank", "width=420,height=720")
  if (w) {
    schedulePrint(w)
    return
  }

  // Popup blocked: print from a hidden iframe (same tab, usually allowed)
  const iframe = document.createElement("iframe")
  iframe.setAttribute("title", "Print receipt")
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none"
  document.body.appendChild(iframe)
  const iw = iframe.contentWindow
  if (!iw) {
    document.body.removeChild(iframe)
    return
  }
  schedulePrint(iw, () => {
    iframe.remove()
  })
}

/** One print job: English customer bill, then each Sinhala KOT (page breaks between kitchens). */
function printCustomerBillAndKitchenTickets(customer: CustomerBillPayload, tickets: KitchenTicketPayload[], d: Date) {
  const customerHtml = buildCustomerBillHtml(customer, d)
  const kotSection =
    tickets.length > 0
      ? tickets.map((t) => `<div class="kot-page">${renderKotInnerHtml(t, d)}</div>`).join("")
      : ""
  runPrint(buildPrintDocumentHtml(customerHtml, kotSection))
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
  if (!payload) return null

  const d = new Date()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Order complete</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <div
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
                    <td className="py-1.5 pr-1">{line.portion ? `${line.name} (${line.portion})` : line.name}</td>
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
            <Button
              type="button"
              onClick={() => printCustomerBillAndKitchenTickets(payload.customer, payload.kitchenTickets, d)}
            >
              Print receipt &amp; kitchen tickets
            </Button>
          </div>
        </div>

        <div className="flex gap-2 justify-end border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
