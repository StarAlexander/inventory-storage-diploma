"use client"

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { BrowserQRCodeSvgWriter } from "@zxing/browser";

type BarcodeGeneratorProps = {
  value: string;
  format?: "CODE128" | "EAN13" | "QR";
  width?: number;
  height?: number;
  className?: string;
};

export function BarcodeGenerator({
  value,
  format = "CODE128",
  width = 2,
  height = 100,
  className = ""
}: BarcodeGeneratorProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (format === "QR" && qrCodeRef.current) {
      // Clear previous QR code
      qrCodeRef.current.innerHTML = "";
      
      // Create new QR code writer
      const qrWriter = new BrowserQRCodeSvgWriter();
      
      // Write QR code to the container
      qrWriter.writeToDom(qrCodeRef.current, value, 200, 200);
    } else if (barcodeRef.current) {
      // Generate regular barcode
      JsBarcode(barcodeRef.current, value, {
        format,
        width,
        height,
        displayValue: true,
      });
    }
  }, [value, format, width, height]);

  return (
    <div className={`flex justify-center ${className}`}>
      {format === "QR" ? (
        <div ref={qrCodeRef} className="qr-code-container" />
      ) : (
        <svg ref={barcodeRef} />
      )}
    </div>
  );
}