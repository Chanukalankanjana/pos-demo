import { DEMO_KEYS, loadJson, nowIso, saveJson } from "@/lib/demoPersistence"

export type Employee = {
  employeeId: string
  name: string
  role: string
  paymentPerDay: number
  createdAt: string
}

const PAID_LEAVE_DAYS_PER_MONTH = 4

export { PAID_LEAVE_DAYS_PER_MONTH }

const DEFAULT_EMPLOYEES: Employee[] = [
  {
    employeeId: "EMP-DEMO-1",
    name: "Nishantha Perera",
    role: "Head Chef",
    paymentPerDay: 4500,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    employeeId: "EMP-DEMO-2",
    name: "Sanduni Wickramasinghe",
    role: "Cashier",
    paymentPerDay: 3200,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
]

/** One-time: old seeded Sinhala demo names → English (only if name still matches). */
const LEGACY_SINHALA_TO_ENGLISH: Record<string, { from: string; to: string }> = {
  "EMP-DEMO-1": { from: "නිශාන්ත පෙරේරා", to: "Nishantha Perera" },
  "EMP-DEMO-2": { from: "සඳුනි වික්‍රමසිංහ", to: "Sanduni Wickramasinghe" },
}

function readAll(): Employee[] {
  const raw = loadJson<Employee[]>(DEMO_KEYS.employees, [])
  if (!Array.isArray(raw) || raw.length === 0) {
    saveJson(DEMO_KEYS.employees, DEFAULT_EMPLOYEES)
    return [...DEFAULT_EMPLOYEES]
  }
  let changed = false
  const migrated = raw.map((e) => {
    const leg = LEGACY_SINHALA_TO_ENGLISH[e.employeeId]
    if (leg && e.name === leg.from) {
      changed = true
      return { ...e, name: leg.to }
    }
    return e
  })
  if (changed) saveJson(DEMO_KEYS.employees, migrated)
  return migrated
}

function writeAll(list: Employee[]) {
  saveJson(DEMO_KEYS.employees, list)
}

export async function getAllEmployees(): Promise<Employee[]> {
  return readAll()
}

export async function createEmployee(input: Omit<Employee, "employeeId" | "createdAt">): Promise<Employee> {
  const list = readAll()
  const row: Employee = {
    employeeId: `EMP-${Date.now()}`,
    name: input.name.trim(),
    role: input.role.trim(),
    paymentPerDay: Math.max(0, input.paymentPerDay),
    createdAt: nowIso(),
  }
  writeAll([row, ...list])
  return row
}

export async function deleteEmployee(employeeId: string): Promise<void> {
  const list = readAll()
  const next = list.filter((e) => e.employeeId !== employeeId)
  if (next.length === list.length) throw new Error("Employee not found")
  writeAll(next)
}
