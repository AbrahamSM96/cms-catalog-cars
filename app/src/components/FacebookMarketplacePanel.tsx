"use client";

import { useEffect, useMemo, useState } from "react";
import { useAllFormFields } from "@payloadcms/ui";
import { reduceFieldsToValues } from "payload/shared";
import {
  buildMarketplaceFields,
  buildMarketplaceDescription,
  type MarketplaceValues,
} from "../lib/marketplace";

interface FeatureRow {
  feature?: string;
}

/**
 * Resolve the `name` of a relationship value (id or populated object) by
 * fetching the referenced collection document. Used for brand and colors.
 */
function useRelationName(collection: string, value: unknown): string {
  const [name, setName] = useState("");

  const id =
    value && typeof value === "object" && "value" in (value as Record<string, unknown>)
      ? (value as { value: unknown }).value
      : value;

  useEffect(() => {
    if (id === undefined || id === null || id === "") {
      setName("");
      return;
    }
    // Already-populated object with a name
    if (typeof id === "object" && id !== null && "name" in id) {
      setName(String((id as { name: string }).name));
      return;
    }

    let cancelled = false;
    fetch(`/api/${collection}/${id}?depth=0`)
      .then((r) => (r.ok ? r.json() : null))
      .then((doc) => {
        if (!cancelled && doc?.name) setName(String(doc.name));
      })
      .catch(() => {
        if (!cancelled) setName("");
      });

    return () => {
      cancelled = true;
    };
  }, [collection, id]);

  return name;
}

export function FacebookMarketplacePanel() {
  const [fields] = useAllFormFields();
  const data = reduceFieldsToValues(fields, true) as Record<string, unknown>;

  const brandName = useRelationName("brands", data.brand);
  const exteriorColorName = useRelationName("colors", data.exteriorColor);
  const interiorColorName = useRelationName("colors", data.interiorColor);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const values: MarketplaceValues = useMemo(() => {
    const location = (data.location as { city?: string; state?: string } | undefined) ?? {};
    const featuresRaw = data.features;
    const features = (Array.isArray(featuresRaw) ? (featuresRaw as FeatureRow[]) : [])
      .map((f) => f?.feature)
      .filter((f): f is string => Boolean(f));

    return {
      vehicleType: data.vehicleType as string | undefined,
      year: data.year as number | undefined,
      brandName,
      model: data.model as string | undefined,
      mileage: data.mileage as number | undefined,
      price: data.price as number | undefined,
      bodyType: data.bodyType as string | undefined,
      exteriorColor: exteriorColorName,
      interiorColor: interiorColorName,
      condition: data.condition as string | undefined,
      fuelType: data.fuelType as string | undefined,
      transmission: data.transmission as string | undefined,
      city: location.city,
      state: location.state,
      features,
    };
  }, [data, brandName, exteriorColorName, interiorColorName]);

  const marketplaceFields = useMemo(() => buildMarketplaceFields(values), [values]);
  const description = useMemo(() => buildMarketplaceDescription(values), [values]);

  const photoCount = useMemo(() => {
    const count = (key: string) => {
      const v = data[key];
      return Array.isArray(v) ? v.length : 0;
    };
    return count("images") + count("exteriorImages") + count("interiorImages");
  }, [data]);

  const copy = async (key: string, text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    } catch {
      // clipboard unavailable; silently ignore
    }
  };

  const copyAllFields = () => {
    const text = marketplaceFields
      .filter((f) => f.value)
      .map((f) => `${f.label}: ${f.value}`)
      .join("\n");
    copy("__all__", text);
  };

  const CopyBtn = ({ id, text }: { id: string; text: string }) => (
    <button
      type="button"
      onClick={() => copy(id, text)}
      disabled={!text}
      style={{
        cursor: text ? "pointer" : "not-allowed",
        fontSize: "0.75rem",
        fontWeight: 600,
        padding: "0.25rem 0.6rem",
        borderRadius: "4px",
        border: "1px solid var(--theme-elevation-150)",
        background: copiedKey === id ? "#16a34a" : "var(--theme-elevation-50)",
        color: copiedKey === id ? "#fff" : "var(--theme-elevation-800)",
        opacity: text ? 1 : 0.4,
        whiteSpace: "nowrap",
      }}
    >
      {copiedKey === id ? "✓ Copiado" : "Copiar"}
    </button>
  );

  return (
    <div
      style={{
        marginBottom: "1.5rem",
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: "8px",
        overflow: "hidden",
        background: "var(--theme-elevation-0)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          padding: "0.85rem 1rem",
          background: "#1877f2",
          color: "#fff",
        }}
      >
        <strong style={{ fontSize: "0.95rem" }}>📋 Copiar información para Facebook Marketplace</strong>
        <span style={{ fontSize: "0.75rem", opacity: 0.9 }}>
          {photoCount} foto{photoCount === 1 ? "" : "s"} · sube hasta 20 en Facebook
        </span>
      </div>

      <div style={{ padding: "1rem" }}>
        <p style={{ margin: "0 0 0.75rem", fontSize: "0.8rem", color: "var(--theme-elevation-600)" }}>
          Copia cada dato en su campo correspondiente del formulario de Facebook, y pega la
          descripción en el campo de texto. Los valores usan las mismas opciones que Facebook.
        </p>

        {/* Per-field rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {marketplaceFields.map((f) => (
            <div
              key={f.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
                padding: "0.4rem 0.6rem",
                borderRadius: "6px",
                background: "var(--theme-elevation-50)",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--theme-elevation-500)",
                  minWidth: "130px",
                }}
              >
                {f.label}
              </span>
              <span
                style={{
                  flex: 1,
                  fontSize: "0.85rem",
                  color: f.value ? "var(--theme-elevation-900)" : "var(--theme-elevation-400)",
                }}
              >
                {f.value || "— sin dato —"}
              </span>
              <CopyBtn id={f.key} text={f.value} />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={copyAllFields}
          style={{
            marginTop: "0.75rem",
            cursor: "pointer",
            fontSize: "0.8rem",
            fontWeight: 600,
            padding: "0.4rem 0.9rem",
            borderRadius: "6px",
            border: "1px solid var(--theme-elevation-150)",
            background: copiedKey === "__all__" ? "#16a34a" : "var(--theme-elevation-100)",
            color: copiedKey === "__all__" ? "#fff" : "var(--theme-elevation-800)",
          }}
        >
          {copiedKey === "__all__" ? "✓ Copiado" : "Copiar todos los campos"}
        </button>

        {/* Description */}
        <div style={{ marginTop: "1.25rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.4rem",
            }}
          >
            <strong style={{ fontSize: "0.85rem", color: "var(--theme-elevation-800)" }}>
              Descripción (para el campo de texto de Facebook)
            </strong>
            <CopyBtn id="__desc__" text={description} />
          </div>
          <textarea
            readOnly
            value={description}
            rows={12}
            style={{
              width: "100%",
              resize: "vertical",
              fontFamily: "inherit",
              fontSize: "0.82rem",
              lineHeight: 1.5,
              padding: "0.6rem",
              borderRadius: "6px",
              border: "1px solid var(--theme-elevation-150)",
              background: "var(--theme-elevation-50)",
              color: "var(--theme-elevation-900)",
            }}
          />
          <p style={{ margin: "0.4rem 0 0", fontSize: "0.72rem", color: "var(--theme-elevation-400)" }}>
            Generada automáticamente a partir de los datos del auto. (Próximamente: opción de
            redactarla con IA.)
          </p>
        </div>
      </div>
    </div>
  );
}
