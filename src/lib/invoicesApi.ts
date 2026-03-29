import { DEMO_KEYS, loadJson, nowIso, saveJson } from "@/lib/demoPersistence"

export type MealType = "breakfast" | "lunch" | "dinner"

export type InvoiceStatus = "pending" | "paid"

export type CustomerInvoice = {
  invoiceId: string
  customerName: string
  mealType: MealType
  qty: number
  unitPrice: number
  total: number
  status: InvoiceStatus
  createdAt: string
}

const DEFAULT_UNIT: Record<MealType, number> = {
  breakfast: 450,
  lunch: 650,
  dinner: 850,
}

export { DEFAULT_UNIT }

function readAll(): CustomerInvoice[] {
  return loadJson<CustomerInvoice[]>(DEMO_KEYS.invoices, [])
}

function writeAll(list: CustomerInvoice[]) {
  saveJson(DEMO_KEYS.invoices, list)
}

export async function getAllInvoices(): Promise<CustomerInvoice[]> {
  return readAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function createInvoice(input: {
  customerName: string
  mealType: MealType
  qty: number
  unitPrice: number
}): Promise<CustomerInvoice> {
  const list = readAll()
  const n = list.length + 1
  const invoiceId = `INV-CUST-${String(n).padStart(4, "0")}`
  const total = Math.round(input.qty * input.unitPrice * 100) / 100
  const row: CustomerInvoice = {
    invoiceId,
    customerName: input.customerName.trim(),
    mealType: input.mealType,
    qty: input.qty,
    unitPrice: input.unitPrice,
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
  list[idx] = { ...list[idx], status: "paid" }
  writeAll(list)
  return list[idx]
}
