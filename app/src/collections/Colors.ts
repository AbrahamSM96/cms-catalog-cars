import type { CollectionConfig } from "payload";

export const Colors: CollectionConfig = {
  slug: "colors",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "hex"],
    description: "Catálogo de colores (exterior e interior). Agrega los que necesites.",
    group: "Settings",
  },
  access: {
    read: () => true, // Public read access for frontend
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      unique: true,
      label: "Color",
      admin: {
        description: "Nombre del color en español (ej: Negro, Blanco, Gris Oxford)",
        placeholder: "Negro",
      },
    },
    {
      name: "hex",
      type: "text",
      label: "Código de color (opcional)",
      admin: {
        description: "Código hexadecimal para la muestra visual (ej: #000000)",
        placeholder: "#000000",
      },
    },
  ],
};
