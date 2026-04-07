import { jsPDF } from "jspdf";
import type { Route } from "@/app/hooks/useMapData";
import type { RouteStopDisplay } from "@/app/map/route-stop-display";

const sanitizeFilenameSegment = (name: string): string => {
  const cleaned = name
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "route";
  return cleaned.slice(0, 80);
};

/** Approximate line height in mm for a given font size (pt), unit is mm. */
const lineHeightMm = (fontSizePt: number): number =>
  fontSizePt * 0.352778 * 1.25;

const drawWrappedLines = (
  doc: jsPDF,
  lines: string[],
  margin: number,
  pageHeight: number,
  startY: number,
  fontSizePt: number,
): number => {
  let y = startY;
  const lh = lineHeightMm(fontSizePt);
  for (const line of lines) {
    if (y + lh > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lh;
  }
  return y;
};

/**
 * Builds an A4 PDF (title, description, embedded route map image, numbered stops) and triggers a file download.
 */
export const downloadRoutePdf = (
  route: Route,
  mapImageDataUrl: string,
  stops: RouteStopDisplay[],
): void => {
  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  doc.setProperties({
    title: route.name,
    subject: "Route",
  });

  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  const titleLines = doc.splitTextToSize(route.name, contentWidth);
  y = drawWrappedLines(doc, titleLines, margin, pageHeight, y, 16);
  y += 2;

  if (route.description?.trim()) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(55, 55, 55);
    const descLines = doc.splitTextToSize(route.description.trim(), contentWidth);
    y = drawWrappedLines(doc, descLines, margin, pageHeight, y, 10);
    doc.setTextColor(0, 0, 0);
    y += 3;
  }

  const props = doc.getImageProperties(mapImageDataUrl);
  const imgWpx = props.width;
  const imgHpx = props.height;
  let mapWmm = contentWidth;
  let mapHmm = (imgHpx / imgWpx) * mapWmm;
  const maxMapHmm = pageHeight * 0.48;
  if (mapHmm > maxMapHmm) {
    mapHmm = maxMapHmm;
    mapWmm = (imgWpx / imgHpx) * mapHmm;
  }

  if (y + mapHmm > pageHeight - margin) {
    doc.addPage();
    y = margin;
  }

  doc.addImage(mapImageDataUrl, "JPEG", margin, y, mapWmm, mapHmm);
  y += mapHmm + 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  if (y + lineHeightMm(12) > pageHeight - margin) {
    doc.addPage();
    y = margin;
  }
  doc.text("Stops", margin, y);
  y += lineHeightMm(12) + 2;

  doc.setFontSize(10);

  for (const stop of stops) {
    const namePart = `${stop.label}. ${stop.userName}`;
    const nameLines = doc.splitTextToSize(namePart, contentWidth);
    const addrLines = doc.splitTextToSize(stop.addressLine, contentWidth);
    const blockH =
      nameLines.length * lineHeightMm(10) +
      addrLines.length * lineHeightMm(10) +
      3;

    if (y + blockH > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    y = drawWrappedLines(doc, nameLines, margin, pageHeight, y, 10);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(70, 70, 70);
    y = drawWrappedLines(doc, addrLines, margin, pageHeight, y, 10);
    doc.setTextColor(0, 0, 0);
    y += 2;
  }

  const filename = `${sanitizeFilenameSegment(route.name)}-route.pdf`;
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};
