import type { CollectionConfig, Field } from "payload";

const DAYS: { name: string; label: string }[] = [
  { name: "monday", label: "Lunes" },
  { name: "tuesday", label: "Martes" },
  { name: "wednesday", label: "Miércoles" },
  { name: "thursday", label: "Jueves" },
  { name: "friday", label: "Viernes" },
  { name: "saturday", label: "Sábado" },
  { name: "sunday", label: "Domingo" },
];

// One row per weekday: a "Cerrado" toggle plus opening/closing time (HH:MM, 24h).
const dayFields: Field[] = DAYS.map((day) => ({
  type: "group",
  name: day.name,
  label: day.label,
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "closed",
          type: "checkbox",
          label: "Cerrado",
          defaultValue: false,
          admin: { width: "34%" },
        },
        {
          name: "open",
          type: "text",
          label: "Abre",
          admin: {
            width: "33%",
            placeholder: "09:00",
            description: "Formato 24h",
            condition: (_, siblingData) => !siblingData?.closed,
          },
        },
        {
          name: "close",
          type: "text",
          label: "Cierra",
          admin: {
            width: "33%",
            placeholder: "19:00",
            description: "Formato 24h",
            condition: (_, siblingData) => !siblingData?.closed,
          },
        },
      ],
    },
  ],
}));

export const Dealerships: CollectionConfig = {
  slug: "dealerships",
  labels: {
    singular: "Concesionario",
    plural: "Concesionarios",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "phone", "updatedAt"],
    group: "Content",
  },
  access: {
    read: () => true, // Public read for the frontend locations page
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        // GENERAL
        {
          label: "General",
          description: "Datos principales del concesionario.",
          fields: [
            {
              name: "name",
              type: "text",
              required: true,
              label: "Nombre",
              admin: { placeholder: "Seminuevos Centro Magno" },
            },
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              label: "Foto del concesionario",
              admin: { description: "Imagen que se muestra en la tarjeta de ubicación." },
            },
            {
              type: "row",
              fields: [
                {
                  name: "phone",
                  type: "text",
                  label: "Teléfono",
                  admin: { width: "50%", placeholder: "+52 33 3002 5050" },
                },
                {
                  name: "whatsapp",
                  type: "text",
                  label: "WhatsApp",
                  admin: {
                    width: "50%",
                    placeholder: "5233 3002 5050",
                    description: "Solo dígitos con lada país (ej. 5233...). Opcional.",
                  },
                },
              ],
            },
          ],
        },

        // UBICACIÓN
        {
          label: "Ubicación",
          description: "Dirección y coordenadas para el mapa.",
          fields: [
            {
              name: "address",
              type: "group",
              label: "Dirección",
              fields: [
                {
                  name: "line1",
                  type: "text",
                  label: "Calle y número",
                  admin: { placeholder: "Av. Adolfo López Mateos Sur 4247-B" },
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "neighborhood",
                      type: "text",
                      label: "Colonia",
                      admin: { width: "50%", placeholder: "Loma Bonita" },
                    },
                    {
                      name: "postalCode",
                      type: "text",
                      label: "Código postal",
                      admin: { width: "50%", placeholder: "45086" },
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "city",
                      type: "text",
                      label: "Ciudad",
                      admin: { width: "50%", placeholder: "Zapopan" },
                    },
                    {
                      name: "state",
                      type: "text",
                      label: "Estado",
                      admin: { width: "50%", placeholder: "Jalisco" },
                    },
                  ],
                },
                {
                  name: "country",
                  type: "text",
                  label: "País",
                  defaultValue: "México",
                },
              ],
            },
            {
              name: "coordinates",
              type: "group",
              label: "Coordenadas (para el mapa)",
              admin: {
                description:
                  "Usa grados DECIMALES (ej. 20.6597 y -103.3496), no grados-minutos-segundos. En Google Maps: clic derecho sobre el lugar → clic en las coordenadas para copiarlas (vienen en decimal).",
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "latitude",
                      type: "number",
                      label: "Latitud",
                      admin: { width: "50%", placeholder: "20.6597", step: 0.000001 },
                      validate: (value: number | null | undefined) =>
                        value == null ||
                        (value >= -90 && value <= 90) ||
                        "La latitud debe estar entre -90 y 90 en grados decimales (ej. 20.6597).",
                    },
                    {
                      name: "longitude",
                      type: "number",
                      label: "Longitud",
                      admin: { width: "50%", placeholder: "-103.3496", step: 0.000001 },
                      validate: (value: number | null | undefined) =>
                        value == null ||
                        (value >= -180 && value <= 180) ||
                        "La longitud debe estar entre -180 y 180 en grados decimales (ej. -103.3496).",
                    },
                  ],
                },
              ],
            },
            {
              name: "googleMapsUrl",
              type: "text",
              label: "Enlace de Google Maps (opcional)",
              admin: {
                placeholder: "https://maps.app.goo.gl/...",
                description: "Para el botón 'Cómo llegar'.",
              },
            },
          ],
        },

        // HORARIO
        {
          label: "Horario",
          description: "Horario de atención por día. Se usa para mostrar Abierto/Cerrado.",
          fields: [
            {
              name: "hours",
              type: "group",
              label: false,
              fields: dayFields,
            },
          ],
        },
      ],
    },
  ],
};
