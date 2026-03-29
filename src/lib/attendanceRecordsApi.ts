import { DEMO_KEYS, loadJson, nowIso, saveJson } from "@/lib/demoPersistence"
import { PAID_LEAVE_DAYS_PER_MONTH } from "@/lib/employeesApi"

export type AttendanceStatus = "present" | "leave" | "absent"

export type AttendanceRecord = {
  id: string
  employeeId: string
  date: string
  status: AttendanceStatus
  createdAt: string
}

function readAll(): AttendanceRecord[] {
  return loadJson<AttendanceRecord[]>(DEMO_KEYS.attendance, [])
}

function writeAll(list: AttendanceRecord[]) {
  saveJson(DEMO_KEYS.attendance, list)
}

export async function getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
  return readAll()
}

/** yyyy-mm for month key */
export function yearMonthFromDate(isoDate: string): string {
  return isoDate.slice(0, 7)
}

export async function upsertAttendanceForDay(
  employeeId: string,
  date: string,
  status: AttendanceStatus,
): Promise<AttendanceRecord> {
  const list = readAll()
  const existingIdx = list.findIndex((r) => r.employeeId === employeeId && r.date === date)
  const t = nowIso()
  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], status, createdAt: t }
    writeAll(list)
    return list[existingIdx]
  }
  const row: AttendanceRecord = {
    id: `ATT-${Date.now()}`,
    employeeId,
    date,
    status,
    createdAt: t,
  }
  writeAll([row, ...list])
  return row
}

export function summarizeMonth(records: AttendanceRecord[], employeeId: string, ym: string) {
  const rows = records.filter((r) => r.employeeId === employeeId && r.date.startsWith(ym))
  let present = 0
  let leave = 0
  let absent = 0
  for (const r of rows) {
    if (r.status === "present") present++
    else if (r.status === "leave") leave++
    else absent++
  }
  const paidLeaveDays = Math.min(leave, PAID_LEAVE_DAYS_PER_MONTH)
  const unpaidLeaveDays = Math.max(0, leave - PAID_LEAVE_DAYS_PER_MONTH)
  const paidDays = present + paidLeaveDays
  return { present, leave, absent, paidLeaveDays, unpaidLeaveDays, paidDays }
}

export function payrollForMonth(paymentPerDay: number, summary: ReturnType<typeof summarizeMonth>) {
  return Math.round(summary.paidDays * paymentPerDay * 100) / 100
}
