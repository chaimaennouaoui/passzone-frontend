import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export default function Barcode({ value }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    JsBarcode(svgRef.current, value, {
      format: "CODE128",
      displayValue: true,
      fontSize: 14,
      height: 70,
      margin: 12,
      background: "#ffffff",
      lineColor: "#111827",
    });
  }, [value]);

  return (
    <div
      style={{
        border: "1px solid rgba(2,6,23,.10)",
        borderRadius: 16,
        padding: 12,
        background: "#fff",
        overflow: "auto",
      }}
    >
      <svg ref={svgRef} />
    </div>
  );
}
