import { DEMO_KEYS, loadJson, nowIso, saveJson } from "@/lib/demoPersistence"

export type InvoiceStatus = "pending" | "paid"

/** One charge line: e.g. "Lunch buffet", "Sudhu rice", "Ala curry". */
export type InvoiceLine = {
  description: string
  qty: number
  unitPrice: number
  lineTotal: number
}

export type CustomerInvoice = {
  invoiceId: string
  customerName: string
  lines: InvoiceLine[]
  total: number
  status: InvoiceStatus
  createdAt: string
}

type LegacyMealType = "breakfast" | "lunch" | "dinner"

const MEAL_LINE_LABEL: Record<LegacyMealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function isNewFormat(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false
  return Array.isArray((raw as Record<string, unknown>).lines)
}

function normalizeLine(raw: Partial<InvoiceLine>): InvoiceLine | null {
  const description = String(raw.description ?? "").trim()
  const qty = Number(raw.qty)
  const unitPrice = Number(raw.unitPrice)
  if (!description || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) return null
  const lineTotal = roundMoney(qty * unitPrice)
  return { description, qty, unitPrice, lineTotal }
}

function normalizeCustomerInvoice(raw: unknown): CustomerInvoice {
  if (isNewFormat(raw)) {
    const o = raw as Record<string, unknown>
    let lines = (o.lines as unknown[])
      .map((x) => normalizeLine(x as Partial<InvoiceLine>))
      .filter((x): x is InvoiceLine => x != null)
    const totalStored = Number(o.total)
    const sumLines = lines.length > 0 ? roundMoney(lines.reduce((s, l) => s + l.lineTotal, 0)) : 0
    if (lines.length === 0 && Number.isFinite(totalStored) && totalStored > 0) {
      lines = [{ description: "Invoice", qty: 1, unitPrice: totalStored, lineTotal: totalStored }]
    }
    const total =
      lines.length > 0 ? (Number.isFinite(totalStored) && Math.abs(totalStored - sumLines) < 0.01 ? totalStored : sumLines) : totalStored
    return {
      invoiceId: String(o.invoiceId),
      customerName: String(o.customerName ?? "").trim() || "Customer",
      lines,
      total: Number.isFinite(total) && total > 0 ? total : sumLines,
      status: o.status === "paid" ? "paid" : "pending",
      createdAt: String(o.createdAt ?? nowIso()),
    }
  }

  const o = raw as Record<string, unknown>
  const meal = o.mealType as LegacyMealType | undefined
  const qty = Number(o.qty)
  const unitPrice = Number(o.unitPrice)
  const totalLegacy = Number(o.total)
  const label = meal && MEAL_LINE_LABEL[meal] ? `${MEAL_LINE_LABEL[meal]} meal` : "Meal"
  const lineTotal =
    Number.isFinite(qty) && Number.isFinite(unitPrice) && qty > 0 && unitPrice >= 0
      ? roundMoney(qty * unitPrice)
      : Number.isFinite(totalLegacy)
        ? totalLegacy
        : 0

  return {
    invoiceId: String(o.invoiceId ?? `INV-MIG-${Date.now()}`),
    customerName: String(o.customerName ?? "").trim() || "Customer",
    lines:
      Number.isFinite(qty) && qty > 0
        ? [{ description: label, qty, unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0, lineTotal }]
        : [],
    total: Number.isFinite(totalLegacy) ? totalLegacy : lineTotal,
    status: o.status === "paid" ? "paid" : "pending",
    createdAt: String(o.createdAt ?? nowIso()),
  }
}

function readAll(): CustomerInvoice[] {
  const raw = loadJson<unknown[]>(DEMO_KEYS.invoices, [])
  const normalized = raw.map((x) => normalizeCustomerInvoice(x))
  const needPersist = raw.some((x) => !isNewFormat(x))
  if (needPersist && normalized.length > 0) {
    saveJson(DEMO_KEYS.invoices, normalized)
  }
  return normalized
}

function writeAll(list: CustomerInvoice[]) {
  saveJson(DEMO_KEYS.invoices, list)
}

export async function getAllInvoices(): Promise<CustomerInvoice[]> {
  return readAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export type CreateInvoiceLineInput = {
  description: string
  qty: number
  unitPrice: number
}

export async function createInvoice(input: {
  customerName: string
  lines: CreateInvoiceLineInput[]
}): Promise<CustomerInvoice> {
  const lines: InvoiceLine[] = []
  for (const l of input.lines) {
    const row = normalizeLine({
      description: l.description,
      qty: l.qty,
      unitPrice: l.unitPrice,
    })
    if (row) lines.push(row)
  }
  if (lines.length === 0) {
    throw new Error("Add at least one line with description, quantity > 0, and unit price.")
  }
  const total = roundMoney(lines.reduce((s, l) => s + l.lineTotal, 0))
  if (total <= 0) {
    throw new Error("Invoice total must be greater than zero.")
  }

  const list = readAll()
  const n = list.length + 1
  const invoiceId = `INV-CUST-${String(n).padStart(4, "0")}`
  const row: CustomerInvoice = {
    invoiceId,
    customerName: input.customerName.trim(),
    lines,
    total,
    status: "pending",
    createdAt: nowIso(),
  }
  writeAll([row, ...list])
  return row
}

export async function markInvoicePaid(invoiceId: string): Promise<CustomerInvoice> {
  const list = readAll()
  const idx = list.findIndex((i) => i.invoiceId === invoiceId)
  if (idx < 0) throw new Error("Invoice not found")
  if (list[idx].status === "paid") return list[idx]
  list[idx] = { ...list[idx], status: "paid" }
  writeAll(list)
  return list[idx]
}

export async function deleteInvoice(invoiceId: string): Promise<void> {
  const list = readAll()
  const next = list.filter((i) => i.invoiceId !== invoiceId)
  if (next.length === list.length) throw new Error("Invoice not found")
  writeAll(next)
}
