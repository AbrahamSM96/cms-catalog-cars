import type { CollectionConfig } from 'payload'

export const Colors: CollectionConfig = {
  access: {
    /**
     * read
     */
    read: () => true, // Public read access for frontend
  },
  admin: {
    defaultColumns: ['name', 'hex'],
    description:
      'Catálogo de colores (exterior e interior). Agrega los que necesites.',
    group: 'Settings',
    useAsTitle: 'name',
  },
  fields: [
    {
      admin: {
        description:
          'Nombre del color en español (ej: Negro, Blanco, Gris Oxford)',
        placeholder: 'Negro',
      },
      label: 'Color',
      name: 'name',
      required: true,
      type: 'text',
      unique: true,
    },
    {
      admin: {
        description: 'Código hexadecimal para la muestra visual (ej: #000000)',
        placeholder: '#000000',
      },
      label: 'Código de color (opcional)',
      name: 'hex',
      type: 'text',
    },
  ],
  slug: 'colors',
}
