"use client";

import { useField } from "@payloadcms/ui";

export const PriceDescription = () => {
  const { value } = useField<number>();

  if (!value || value === 0) return null;

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

  return (
    <div
      style={{
        marginTop: "0.5rem",
        padding: "0.75rem",
        backgroundColor: "#f0f9ff",
        borderLeft: "3px solid #0ea5e9",
        borderRadius: "4px",
      }}
    >
      <strong style={{ color: "#0369a1", fontSize: "1.1rem" }}>{formatted}</strong>
    </div>
  );
};
