"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { CHECKIN_QR_PDF_COPY } from "./checkin-qr-pdf-copy";

type QrCodePreviewProps = {
  token: string;
};

const lineHeightMm = (fontSizePt: number): number =>
  fontSizePt * 0.352778 * 1.25;

export default function QrCodePreview({ token }: QrCodePreviewProps) {
  const [svgMarkup, setSvgMarkup] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isPdfSaving, setIsPdfSaving] = useState(false);
  const [pdfError, setPdfError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    const createQrSvg = async () => {
      try {
        setErrorMessage("");
        const svg = await QRCode.toString(token, {
          type: "svg",
          errorCorrectionLevel: "M",
          margin: 1,
          width: 360,
        });
        if (isMounted) {
          setSvgMarkup(svg);
        }
      } catch (error) {
        console.error("Failed to generate QR SVG:", error);
        if (isMounted) {
          setErrorMessage("Failed to generate the QR code. Please refresh.");
        }
      }
    };

    void createQrSvg();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const svgDataUrl = useMemo(() => {
    if (!svgMarkup) return "";
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
  }, [svgMarkup]);

  const handleDownloadPdf = async () => {
    if (!token) return;

    setIsPdfSaving(true);
    setPdfError("");
    try {
      // Small raster + JPEG keeps the PDF tiny; ECC "L" minimizes QR module count for long payloads.
      const qrImageDataUrl = await QRCode.toDataURL(token, {
        errorCorrectionLevel: "L",
        margin: 1,
        width: 160,
        type: "image/jpeg",
        rendererOpts: { quality: 0.82 },
      });

      // Narrow page: less empty area than A4 (image + fonts dominate size; this trims structure a bit).
      const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: [100, 130],
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      const { title, subtitle, footer } = CHECKIN_QR_PDF_COPY;

      doc.setProperties({
        title: `${title} — QR`,
        subject: "Event check-in",
      });

      let y = margin;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(20, 20, 20);
      const titleLines = doc.splitTextToSize(title, contentWidth);
      for (const line of titleLines) {
        doc.text(line, pageWidth / 2, y, { align: "center" });
        y += lineHeightMm(18);
      }
      y += 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(55, 55, 55);
      const subtitleLines = doc.splitTextToSize(subtitle, contentWidth);
      for (const line of subtitleLines) {
        doc.text(line, pageWidth / 2, y, { align: "center" });
        y += lineHeightMm(11);
      }
      y += 10;

      const props = doc.getImageProperties(qrImageDataUrl);
      const aspect = props.height / props.width;
      const qrWmm = 48;
      const qrHmm = qrWmm * aspect;
      const xQr = (pageWidth - qrWmm) / 2;
      doc.addImage(qrImageDataUrl, "JPEG", xQr, y, qrWmm, qrHmm);
      y += qrHmm + 16;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(110, 110, 110);
      const footerLines = doc.splitTextToSize(footer, contentWidth);
      for (const line of footerLines) {
        if (y + lineHeightMm(9) > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, pageWidth / 2, y, { align: "center" });
        y += lineHeightMm(9);
      }

      doc.save("event-checkin-qr.pdf");
    } catch (error) {
      console.error("Failed to build check-in PDF:", error);
      setPdfError("Could not create the PDF. Please try again.");
    } finally {
      setIsPdfSaving(false);
    }
  };

  if (errorMessage) {
    return <p className="text-sm text-red-300">{errorMessage}</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-white/20 p-4">
      {svgDataUrl ? (
        <img
          src={svgDataUrl}
          alt="Event check-in QR code"
          className="h-auto w-full max-w-[320px] rounded bg-white p-2"
        />
      ) : (
        <p className="text-sm text-white/70">Generating QR preview...</p>
      )}

      <Button
        type="button"
        variant="secondary"
        disabled={!svgDataUrl || isPdfSaving}
        aria-label="Download check-in QR as PDF"
        onClick={() => void handleDownloadPdf()}
      >
        {isPdfSaving ? "Preparing PDF…" : "Download PDF"}
      </Button>
      {pdfError ? (
        <p className="text-center text-sm text-red-300">{pdfError}</p>
      ) : null}
    </div>
  );
}
