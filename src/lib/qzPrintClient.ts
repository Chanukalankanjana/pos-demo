/**
 * Sends full HTML documents to a named printer via QZ Tray (must be installed and running).
 * Printers can be USB, Wi‑Fi, or shared network queues added in Windows — use the exact name from Settings → Printers.
 */
export async function printHtmlViaQz(printerName: string, html: string): Promise<void> {
  const qz = (await import("qz-tray")).default
  if (!qz.websocket.isActive()) {
    await qz.websocket.connect()
  }
  // 80mm thermal defaults: constrain width and fit content.
  const config = qz.configs.create(printerName, {
    units: "mm",
    // Let the driver/page decide the height; we only constrain roll width.
    size: { width: 80, height: null, custom: true },
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    density: 203,
    // Fit the rasterized HTML to the page width (prevents printing only "D O C..." cropped huge).
    scaleContent: true,
    rasterize: true,
    jobName: "POS Receipt",
  })
  const data = [{ type: "pixel", format: "html", flavor: "plain", data: html }]
  await qz.print(config, data)
}
