import { jsPDF } from "jspdf";
import { hexToRgb } from "@/lib/color/hex-to-rgb";
import type { MapRoute } from "@/lib/map/types";
import type { RouteStopDisplay } from "@/lib/map/route-stop-display";

export type RoutePdfBranding = {
  primaryColor: string;
  logoDataUrl: string;
};

const LOGO_BOTTOM_GAP_MM = 5;

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

const setDrawColorFromHex = (doc: jsPDF, hex: string): void => {
  const { r, g, b } = hexToRgb(hex);
  doc.setDrawColor(r, g, b);
};

const setFillColorFromHex = (doc: jsPDF, hex: string): void => {
  const { r, g, b } = hexToRgb(hex);
  doc.setFillColor(r, g, b);
};

const setTextColorFromHex = (doc: jsPDF, hex: string): void => {
  const { r, g, b } = hexToRgb(hex);
  doc.setTextColor(r, g, b);
};

const drawHorizontalRule = (
  doc: jsPDF,
  y: number,
  margin: number,
  contentWidth: number,
  color: string
): number => {
  setDrawColorFromHex(doc, color);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + contentWidth, y);
  return y + 4;
};

const drawWrappedLines = (
  doc: jsPDF,
  lines: string[],
  x: number,
  pageHeight: number,
  startY: number,
  fontSizePt: number,
  margin: number
): number => {
  let y = startY;
  const lh = lineHeightMm(fontSizePt);
  for (const line of lines) {
    if (y + lh > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, x, y);
    y += lh;
  }
  return y;
};

const drawStopBadge = (
  doc: jsPDF,
  x: number,
  y: number,
  label: string,
  backgroundColor: string,
  color: string,
  radiusMm = 3.2
): void => {
  setFillColorFromHex(doc, backgroundColor);
  doc.circle(x + radiusMm, y - radiusMm * 0.35, radiusMm, "F");

  setTextColorFromHex(doc, color);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(label, x + radiusMm, y - radiusMm * 0.35 + 0.8, {
    align: "center",
  });
};

const triggerPdfDownload = (doc: jsPDF, filename: string): void => {
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

/**
 * Builds a branded A4 PDF (logo, title, map, numbered stops) and triggers a file download.
 */
export const downloadRoutePdf = async (
  route: MapRoute,
  mapImageDataUrl: string,
  stops: RouteStopDisplay[],
  branding: RoutePdfBranding
): Promise<void> => {
  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const { primaryColor, logoDataUrl } = branding;

  doc.setProperties({
    title: route.name,
    subject: "Route",
  });

  const logoHeightMm = 20;
  const logoProps = doc.getImageProperties(logoDataUrl);
  const logoWidthMm = (logoProps.width / logoProps.height) * logoHeightMm;
  doc.addImage(
    logoDataUrl,
    "PNG",
    pageWidth - margin - logoWidthMm,
    margin,
    logoWidthMm,
    logoHeightMm
  );

  const titleMaxWidth = contentWidth - logoWidthMm - 4;
  let y = margin + 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  setTextColorFromHex(doc, primaryColor);
  const titleLines = doc.splitTextToSize(route.name, titleMaxWidth);
  y = drawWrappedLines(doc, titleLines, margin, pageHeight, y, 16, margin);
  y += 2;

  if (route.description?.trim()) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(55, 55, 55);
    const descLines = doc.splitTextToSize(route.description.trim(), contentWidth);
    y = drawWrappedLines(doc, descLines, margin, pageHeight, y, 10, margin);
    y += 2;
  }

  y = Math.max(y, margin + logoHeightMm + LOGO_BOTTOM_GAP_MM);
  y = drawHorizontalRule(doc, y, margin, contentWidth, primaryColor);

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

  const mapX = margin + (contentWidth - mapWmm) / 2;
  doc.addImage(mapImageDataUrl, "JPEG", mapX, y, mapWmm, mapHmm);
  y += mapHmm + 5;

  y = drawHorizontalRule(doc, y, margin, contentWidth, primaryColor);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setTextColorFromHex(doc, primaryColor);
  if (y + lineHeightMm(12) > pageHeight - margin) {
    doc.addPage();
    y = margin;
  }
  doc.text("Stops", margin, y);
  y += lineHeightMm(12) + 3;

  const badgeRadiusMm = 3.2;
  const badgeBlockWidth = badgeRadiusMm * 2 + 3;
  const textStartX = margin + badgeBlockWidth;
  const textWidth = contentWidth - badgeBlockWidth;

  for (const stop of stops) {
    const nameLines = doc.splitTextToSize(stop.userName, textWidth);
    const addrLines = doc.splitTextToSize(stop.addressLine, textWidth);
    const blockH =
      Math.max(
        badgeRadiusMm * 2,
        nameLines.length * lineHeightMm(10) +
          addrLines.length * lineHeightMm(10)
      ) + 3;

    if (y + blockH > pageHeight - margin - 8) {
      doc.addPage();
      y = margin;
    }

    const badgeCenterY = y + badgeRadiusMm;
    drawStopBadge(
      doc,
      margin,
      badgeCenterY,
      stop.label,
      stop.backgroundColor,
      stop.color,
      badgeRadiusMm
    );

    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    let textY = y;
    textY = drawWrappedLines(
      doc,
      nameLines,
      textStartX,
      pageHeight,
      textY,
      10,
      margin
    );

    doc.setFont("helvetica", "normal");
    doc.setTextColor(70, 70, 70);
    textY = drawWrappedLines(
      doc,
      addrLines,
      textStartX,
      pageHeight,
      textY,
      10,
      margin
    );

    y = Math.max(textY, y + badgeRadiusMm * 2) + 3;
  }

  const footerY = pageHeight - margin;
  setDrawColorFromHex(doc, primaryColor);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 6, margin + contentWidth, footerY - 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text("GLUE", margin, footerY - 1);

  const filename = `${sanitizeFilenameSegment(route.name)}-route.pdf`;
  triggerPdfDownload(doc, filename);
};
