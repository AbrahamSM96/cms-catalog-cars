import type { CollectionConfig } from "payload";
import {
  VEHICLE_TYPE_OPTIONS,
  BODY_TYPE_OPTIONS,
  CONDITION_OPTIONS,
} from "../lib/marketplace";

export const Cars: CollectionConfig = {
  slug: "cars",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "brand", "year", "status"],
  },
  access: {
    read: () => true, // Public read access for frontend
  },
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        // Format text fields to Title Case (Capital Letter)
        if (data.model) {
          data.model = data.model
            .toLowerCase()
            .split(" ")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        }

        if (data.version) {
          data.version = data.version
            .toLowerCase()
            .split(" ")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        }

        // Build the display title used across the admin: "Marca Modelo Año"
        const brandRef = data.brand ?? originalDoc?.brand;
        const model = data.model ?? originalDoc?.model;
        const year = data.year ?? originalDoc?.year;

        let brandName = "";
        if (brandRef) {
          if (typeof brandRef === "object" && brandRef?.name) {
            brandName = brandRef.name;
          } else {
            try {
              const brand = await req.payload.findByID({
                collection: "brands",
                id: brandRef,
                depth: 0,
              });
              brandName = brand?.name ?? "";
            } catch {
              // brand not found yet; leave blank
            }
          }
        }

        data.title = [brandName, model, year].filter(Boolean).join(" ");

        return data;
      },
    ],
  },
  fields: [
    {
      name: "title",
      type: "text",
      admin: {
        // Auto-generated ("Marca Modelo Año"); hidden from the form.
        hidden: true,
      },
      hooks: {
        // Fallback so records saved before this field existed still show a
        // proper title (computed on read) instead of falling back to the id.
        afterRead: [
          async ({ value, data, req }) => {
            if (value) return value;
            if (!data) return value;

            const brandRef = data.brand;
            let brandName = "";
            if (brandRef) {
              if (typeof brandRef === "object" && brandRef?.name) {
                brandName = brandRef.name;
              } else {
                try {
                  const brand = await req.payload.findByID({
                    collection: "brands",
                    id: brandRef,
                    depth: 0,
                  });
                  brandName = brand?.name ?? "";
                } catch {
                  // ignore
                }
              }
            }

            const computed = [brandName, data.model, data.year].filter(Boolean).join(" ");
            return computed || value;
          },
        ],
      },
    },
    {
      name: "fbMarketplace",
      type: "ui",
      admin: {
        components: {
          Field: "/components/FacebookMarketplacePanel#FacebookMarketplacePanel",
        },
      },
    },
    {
      name: "brand",
      type: "relationship",
      relationTo: "brands",
      required: true,
      hasMany: false,
    },
    { name: "model", type: "text", required: true },
    { name: "version", type: "text", required: true },
    { name: "year", type: "number", required: true },
    {
      name: "transmission",
      type: "select",
      required: true,
      options: [
        {
          label: "Automática",
          value: "automatic",
        },
        {
          label: "Manual",
          value: "manual",
        },
      ],
      defaultValue: "manual",
    },
    {
      name: "price",
      type: "number",
      required: true,
      admin: {
        description: "Enter price in dollars (e.g., 25000)",
        placeholder: "e.g., 25000",
        components: {
          Description: "/components/PriceDescription#PriceDescription",
        },
      },
    },
    {
      name: "hasVAT",
      type: "checkbox",
      label: "IVA",
      defaultValue: false,
      admin: {
        description: "¿El precio incluye/factura IVA? (se muestra como Sí/No)",
      },
    },
    { name: "cylinders", type: "number" },
    { name: "passengers", type: "number" },
    {
      name: "mileage",
      type: "number",
      admin: {
        description: "Enter mileage in kilometers (e.g., 150000)",
        placeholder: "e.g., 150000",
        components: {
          Description: "/components/MileageDescription#MileageDescription",
        },
      },
    },
    {
      name: "featuredImage",
      type: "upload",
      relationTo: "media",
      label: "Imagen principal",
      admin: {
        description: "Imagen que se mostrará en la vista previa",
      },
    },
    {
      name: "exteriorImages",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      label: "Imágenes exteriores",
      admin: {
        description: "Fotos del exterior del vehículo (carrocería, frente, laterales)",
      },
    },
    {
      name: "interiorImages",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      label: "Imágenes interiores",
      admin: {
        description: "Fotos del interior del vehículo (cabina, asientos, tablero)",
      },
    },
    { name: "description", type: "textarea" },
    { name: "featured", type: "checkbox", label: "Featured" },
    {
      name: "status",
      type: "select",
      required: true,
      options: [
        {
          label: "🟢 Available",
          value: "available",
        },
        {
          label: "🟡 Reserved",
          value: "reserved",
        },
        {
          label: "🔴 Sold",
          value: "sold",
        },
      ],
      defaultValue: "available",
      admin: {
        description: "Current availability status of the vehicle",
      },
    },

    // ========================================
    // ESPECIFICACIONES TÉCNICAS
    // ========================================
    {
      name: "doors",
      type: "number",
      admin: {
        description: "Número de puertas (ej: 4)",
      },
    },
    {
      name: "engine",
      type: "text",
      admin: {
        description: "Especificación del motor (ej: L4 2.0t, V6 3.5L)",
        placeholder: "L4 2.0t",
      },
    },
    {
      name: "horsepower",
      type: "number",
      admin: {
        description: "Caballos de fuerza (HP)",
        placeholder: "184",
      },
    },
    {
      name: "vehicleType",
      type: "select",
      label: "Tipo de vehículo",
      options: VEHICLE_TYPE_OPTIONS,
      admin: {
        description: "Auto o camioneta (Facebook Marketplace)",
      },
    },
    {
      name: "bodyType",
      type: "select",
      label: "Carrocería",
      options: BODY_TYPE_OPTIONS,
      admin: {
        description: "Tipo de carrocería (alineado a Facebook Marketplace)",
      },
    },
    {
      name: "condition",
      type: "select",
      label: "Estado del vehículo",
      options: CONDITION_OPTIONS,
      admin: {
        description: "Condición general del vehículo (Facebook Marketplace)",
      },
    },
    {
      name: "fuelType",
      type: "select",
      options: [
        { label: "Gasolina", value: "gasoline" },
        { label: "Diésel", value: "diesel" },
        { label: "Eléctrico", value: "electric" },
        { label: "Híbrido", value: "hybrid" },
        { label: "Híbrido Enchufable", value: "plug-in-hybrid" },
      ],
      admin: {
        description: "Tipo de combustible",
      },
    },

    // ========================================
    // UBICACIÓN
    // ========================================
    {
      name: "location",
      type: "group",
      label: "Ubicación del vehículo",
      fields: [
        {
          name: "dealership",
          type: "text",
          admin: {
            description: "Nombre del concesionario (ej: Centro Magno)",
            placeholder: "Centro Magno",
          },
        },
        {
          name: "city",
          type: "text",
          admin: {
            description: "Ciudad",
            placeholder: "Guadalajara",
          },
        },
        {
          name: "state",
          type: "text",
          admin: {
            description: "Estado",
            placeholder: "Jalisco",
          },
        },
      ],
    },

    // ========================================
    // FINANCIAMIENTO
    // ========================================
    {
      name: "financing",
      type: "group",
      label: "Opciones de financiamiento",
      fields: [
        {
          name: "minDownPaymentPercentage",
          type: "number",
          defaultValue: 20,
          admin: {
            description: "Porcentaje mínimo de enganche (ej: 20%)",
          },
        },
        {
          name: "maxDownPaymentPercentage",
          type: "number",
          defaultValue: 80,
          admin: {
            description: "Porcentaje máximo de enganche (ej: 80%)",
          },
        },
        {
          name: "defaultDownPaymentPercentage",
          type: "number",
          defaultValue: 20,
          admin: {
            description: "Porcentaje de enganche sugerido por defecto",
          },
        },
        {
          name: "availableLoanTerms",
          type: "array",
          label: "Plazos disponibles (meses)",
          admin: {
            description: "Lista de plazos en meses que ofreces (ej: 6, 12, 24, 36, 48, 60)",
          },
          fields: [
            {
              name: "months",
              type: "number",
              required: true,
              admin: {
                placeholder: "36",
              },
            },
          ],
        },
        {
          name: "defaultLoanTerm",
          type: "number",
          defaultValue: 36,
          admin: {
            description: "Plazo sugerido por defecto en meses (debe estar en la lista de disponibles)",
          },
        },
        {
          name: "interestRate",
          type: "number",
          defaultValue: 8.5,
          admin: {
            description: "Tasa de interés anual (%)",
            placeholder: "8.5",
          },
        },
      ],
    },

    // ========================================
    // COLORES
    // ========================================
    {
      name: "exteriorColor",
      type: "relationship",
      relationTo: "colors",
      hasMany: false,
      label: "Color exterior",
      admin: {
        description: "Color de la carrocería. ¿No está en la lista? Agrégalo en la colección Colores.",
      },
    },
    {
      name: "interiorColor",
      type: "relationship",
      relationTo: "colors",
      hasMany: false,
      label: "Color interior",
      admin: {
        description: "Color de la tapicería. ¿No está en la lista? Agrégalo en la colección Colores.",
      },
    },

    // ========================================
    // CARACTERÍSTICAS
    // ========================================
    {
      name: "features",
      type: "array",
      label: "Características adicionales",
      admin: {
        description: "Equipamiento y características especiales del vehículo",
      },
      fields: [
        {
          name: "feature",
          type: "text",
          required: true,
          admin: {
            placeholder: "Bluetooth, Cámara trasera, etc.",
          },
        },
      ],
    },

    // ========================================
    // HISTORIAL DEL AUTO
    // ========================================
    {
      name: "history",
      type: "group",
      label: "Historial del auto",
      admin: {
        description: "Respaldo e inspección del vehículo",
      },
      fields: [
        {
          name: "inspectionPoints",
          type: "number",
          label: "Puntos de inspección",
          defaultValue: 150,
          admin: {
            description: "Número de puntos inspeccionados (ej: 150 → \"+150 puntos\")",
          },
        },
        {
          name: "ownerHistory",
          type: "select",
          label: "Historial de dueños",
          options: [
            { label: "Único dueño", value: "single" },
            { label: "2 dueños", value: "two" },
            { label: "3 o más dueños", value: "multiple" },
          ],
          defaultValue: "single",
        },
        {
          name: "duplicateKeys",
          type: "checkbox",
          label: "Duplicado de llaves",
          defaultValue: false,
          admin: {
            description: "¿Incluye duplicado de llaves? (Sí/No)",
          },
        },
        {
          name: "plates",
          type: "checkbox",
          label: "Placas",
          defaultValue: false,
          admin: {
            description: "¿Incluye placas? (Sí/No)",
          },
        },
        {
          name: "manuals",
          type: "checkbox",
          label: "Manuales",
          defaultValue: false,
          admin: {
            description: "¿Incluye manuales? (Sí/No)",
          },
        },
        {
          name: "conditioning",
          type: "checkbox",
          label: "Acondicionamiento",
          defaultValue: false,
          admin: {
            description: "¿Recibió acondicionamiento/detallado? (Sí/No)",
          },
        },
      ],
    },
  ],
};
