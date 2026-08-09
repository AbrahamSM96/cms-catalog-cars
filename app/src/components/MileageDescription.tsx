"use client";

import { useField } from "@payloadcms/ui";

export const MileageDescription = () => {
  const { value } = useField<number>();

  if (!value || value === 0) return null;

  const formatted = new Intl.NumberFormat("en-US").format(value);

  return (
    <div
      style={{
        marginTop: "0.5rem",
        padding: "0.75rem",
        backgroundColor: "#f0fdf4",
        borderLeft: "3px solid #22c55e",
        borderRadius: "4px",
      }}
    >
      <strong style={{ color: "#15803d", fontSize: "1.1rem" }}>
        {formatted} km
      </strong>
    </div>
  );
};
