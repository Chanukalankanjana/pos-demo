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
