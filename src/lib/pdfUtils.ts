import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const generatePDF = async (elementId: string, filename: string = 'report.pdf') => {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`)
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(filename)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}

export const generateSalesReport = (data: any[]) => {
  const pdf = new jsPDF()
  
  // Header
  pdf.setFontSize(20)
  pdf.text('Sales Report', 20, 20)
  
  pdf.setFontSize(12)
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30)
  
  // Table headers
  pdf.setFontSize(10)
  pdf.text('Item', 20, 50)
  pdf.text('Quantity', 80, 50)
  pdf.text('Price', 120, 50)
  pdf.text('Total', 160, 50)
  
  // Table data
  let yPosition = 60
  data.forEach((item, index) => {
    if (yPosition > 280) {
      pdf.addPage()
      yPosition = 20
    }
    
    pdf.text(item.name || 'Item', 20, yPosition)
    pdf.text(item.quantity?.toString() || '0', 80, yPosition)
    pdf.text(`$${item.price || 0}`, 120, yPosition)
    pdf.text(`$${(item.quantity || 0) * (item.price || 0)}`, 160, yPosition)
    yPosition += 10
  })
  
  pdf.save('sales-report.pdf')
}

export const generateInventoryReport = (data: any[]) => {
  const pdf = new jsPDF()
  
  // Header
  pdf.setFontSize(20)
  pdf.text('Inventory Report', 20, 20)
  
  pdf.setFontSize(12)
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30)
  
  // Table headers
  pdf.setFontSize(10)
  pdf.text('Item', 20, 50)
  pdf.text('Category', 80, 50)
  pdf.text('Stock', 120, 50)
  pdf.text('Price', 160, 50)
  
  // Table data
  let yPosition = 60
  data.forEach((item, index) => {
    if (yPosition > 280) {
      pdf.addPage()
      yPosition = 20
    }
    
    pdf.text(item.name || 'Item', 20, yPosition)
    pdf.text(item.category || 'Category', 80, yPosition)
    pdf.text(item.stock?.toString() || '0', 120, yPosition)
    pdf.text(`$${item.price || 0}`, 160, yPosition)
    yPosition += 10
  })
  
  pdf.save('inventory-report.pdf')
}

export type SalarySlipPdfInput = {
  employeeName: string
  employeeId: string
  role: string
  /** yyyy-mm */
  periodYm: string
  paymentPerDay: number
  present: number
  leave: number
  absent: number
  paidLeaveDays: number
  unpaidLeaveDays: number
  paidDays: number
  grossLkr: number
  deductionLkr: number
  netLkr: number
}

/** Simple text-based salary slip (loan/advance deduction + net pay). */
export function generateSalarySlipPdf(data: SalarySlipPdfInput): void {
  const pdf = new jsPDF("p", "mm", "a4")
  let y = 18

  const periodHuman =
    data.periodYm.length >= 7
      ? new Date(`${data.periodYm}-01T12:00:00`).toLocaleString(undefined, { month: "long", year: "numeric" })
      : data.periodYm

  pdf.setFontSize(18)
  pdf.setFont("helvetica", "bold")
  pdf.text("Salary slip", 20, y)
  y += 12

  pdf.setFontSize(10)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(100, 100, 100)
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, y)
  pdf.setTextColor(0, 0, 0)
  y += 14

  const row = (label: string, value: string) => {
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(10)
    pdf.text(label, 20, y)
    pdf.setFont("helvetica", "normal")
    const wrapped = pdf.splitTextToSize(value, 115)
    pdf.text(wrapped, 72, y)
    y += Math.max(8, wrapped.length * 5 + 2)
  }

  row("Employee", data.employeeName)
  row("Employee ID", data.employeeId)
  row("Role", data.role)
  row("Pay period", periodHuman)
  row("Payment per day", `LKR ${data.paymentPerDay.toFixed(2)}`)
  row("Present days", String(data.present))
  row("Leave days", String(data.leave))
  row("Absent days", String(data.absent))
  row("Paid leave (capped)", String(data.paidLeaveDays))
  row("Unpaid leave", String(data.unpaidLeaveDays))
  row("Total paid days", String(data.paidDays))
  row("Gross pay", `LKR ${data.grossLkr.toFixed(2)}`)
  row("Loan / advance deduction", `LKR ${data.deductionLkr.toFixed(2)}`)
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(12)
  pdf.text("Net pay", 20, y)
  pdf.setFont("helvetica", "normal")
  pdf.text(`LKR ${data.netLkr.toFixed(2)}`, 72, y)
  y += 14

  pdf.setFontSize(9)
  pdf.setTextColor(90, 90, 90)
  pdf.text("Demo payroll document — verify figures against attendance records.", 20, 285)

  const safeId = data.employeeId.replace(/[^a-zA-Z0-9-_]/g, "_")
  pdf.save(`salary-slip-${safeId}-${data.periodYm}.pdf`)
}
