import type { GlobalConfig } from "payload";

export const Contact: GlobalConfig = {
  slug: "contact",
  label: "Contacto",
  admin: {
    group: "Content",
    description: "Datos de contacto que se muestran en el footer y en la página de contacto.",
  },
  access: {
    read: () => true, // Público: el frontend lo consume sin auth
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "phone",
          type: "text",
          label: "Teléfono",
          admin: { width: "50%", placeholder: "+52 55 5001 0000" },
        },
        {
          name: "whatsapp",
          type: "text",
          label: "WhatsApp",
          admin: {
            width: "50%",
            placeholder: "525550010000",
            description: "Solo dígitos con lada país (ej. 5255...). Se usa para el enlace de WhatsApp.",
          },
        },
      ],
    },
    {
      name: "email",
      type: "email",
      label: "Correo electrónico",
      admin: { placeholder: "contacto@tu-negocio.com" },
    },
    {
      name: "address",
      type: "group",
      label: "Dirección",
      fields: [
        {
          name: "line1",
          type: "text",
          label: "Calle y número",
          admin: { placeholder: "Av. Universidad 2060, Copilco Universidad" },
        },
        {
          type: "row",
          fields: [
            { name: "city", type: "text", label: "Ciudad", admin: { width: "50%", placeholder: "Ciudad de México" } },
            { name: "state", type: "text", label: "Estado", admin: { width: "50%", placeholder: "CDMX" } },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "postalCode", type: "text", label: "Código postal", admin: { width: "50%", placeholder: "04360" } },
            { name: "country", type: "text", label: "País", defaultValue: "México", admin: { width: "50%" } },
          ],
        },
        {
          name: "googleMapsUrl",
          type: "text",
          label: "Enlace de Google Maps (opcional)",
          admin: { placeholder: "https://maps.app.goo.gl/..." },
        },
      ],
    },
    {
      name: "hoursNote",
      type: "textarea",
      label: "Horario (texto)",
      admin: {
        placeholder: "Lun a Vie 9:00 a.m. – 7:00 p.m. · Sáb 9:00 a.m. – 2:00 p.m.",
        description: "Horario general que se muestra en la página de contacto (opcional).",
      },
    },
    {
      name: "social",
      type: "group",
      label: "Redes sociales",
      admin: { description: "Enlaces completos (https://...). Deja vacío lo que no uses." },
      fields: [
        { name: "facebook", type: "text", label: "Facebook", admin: { placeholder: "https://facebook.com/..." } },
        { name: "instagram", type: "text", label: "Instagram", admin: { placeholder: "https://instagram.com/..." } },
        { name: "tiktok", type: "text", label: "TikTok", admin: { placeholder: "https://tiktok.com/@..." } },
        { name: "youtube", type: "text", label: "YouTube", admin: { placeholder: "https://youtube.com/@..." } },
      ],
    },
  ],
};
