import type { GlobalConfig } from 'payload'

import { editorsAndAdmins } from '../access'

/**
 * Per-client site configuration, editable from the admin panel.
 *
 * Everything a dealership needs to brand its site — name, tagline, SEO defaults,
 * favicon, Open Graph image and accent colours — lives here in its OWN database.
 * That keeps a single shared codebase: no per-client `.env` branding, no forks.
 * The frontend reads this global and falls back to sane defaults when empty.
 */
export const SiteSettings: GlobalConfig = {
  access: {
    /**
     * read
     */
    read: () => true, // Público: el frontend lo consume sin auth
    update: editorsAndAdmins,
  },
  admin: {
    description:
      'Identidad del sitio: marca, SEO, favicon, imagen para compartir y colores.',
    group: 'Settings',
  },
  fields: [
    {
      admin: {
        description: 'Nombre y textos de marca que se muestran en el sitio.',
      },
      fields: [
        {
          admin: { placeholder: 'AutoCatálogo' },
          label: 'Nombre de la marca',
          name: 'name',
          required: true,
          type: 'text',
        },
        {
          admin: { placeholder: 'Autos seminuevos de calidad' },
          label: 'Eslogan',
          name: 'tagline',
          type: 'text',
        },
        {
          admin: {
            description: 'Descripción corta usada en el footer.',
          },
          label: 'Descripción',
          name: 'description',
          type: 'textarea',
        },
        {
          admin: {
            description:
              'Muestra el nombre de la marca junto al logo en la barra superior y el pie de página. Desactívalo si tu logo ya incluye el nombre.',
          },
          defaultValue: true,
          label: 'Mostrar el nombre junto al logo',
          name: 'showName',
          type: 'checkbox',
        },
      ],
      label: 'Marca',
      name: 'brand',
      type: 'group',
    },
    {
      admin: {
        description:
          'Textos que ven los buscadores (Google) y las redes al compartir el sitio.',
      },
      fields: [
        {
          admin: {
            description: 'Título por defecto y de la portada.',
            placeholder: 'AutoCatálogo - Autos Seminuevos de Calidad',
          },
          label: 'Título por defecto',
          name: 'titleDefault',
          type: 'text',
        },
        {
          admin: {
            description:
              'Plantilla para páginas internas. Usa %s donde va el título de la página.',
            placeholder: '%s | AutoCatálogo',
          },
          label: 'Plantilla de título',
          name: 'titleTemplate',
          type: 'text',
        },
        {
          admin: {
            description: 'Descripción larga (meta description).',
          },
          label: 'Descripción SEO',
          name: 'description',
          type: 'textarea',
        },
        {
          admin: {
            description: 'Descripción corta para redes sociales (Open Graph).',
          },
          label: 'Descripción para redes',
          name: 'ogDescription',
          type: 'textarea',
        },
        {
          admin: {
            description: 'Palabras clave (una por fila).',
          },
          fields: [
            {
              label: 'Palabra clave',
              name: 'value',
              required: true,
              type: 'text',
            },
          ],
          label: 'Palabras clave',
          name: 'keywords',
          type: 'array',
        },
      ],
      label: 'SEO',
      name: 'seo',
      type: 'group',
    },
    {
      admin: {
        description:
          'Imágenes de marca. El logo se muestra en la barra superior y el pie de página; el favicon es el ícono de la pestaña; la imagen para compartir aparece al pegar el enlace en redes.',
      },
      fields: [
        {
          admin: {
            description:
              'Logo de la marca (SVG, PNG o WebP). Se muestra a una altura de 36 px, así que usa un archivo con fondo transparente. Si lo dejas vacío se usa el ícono por defecto.',
          },
          label: 'Logo',
          name: 'logo',
          relationTo: 'media',
          type: 'upload',
        },
        {
          admin: {
            description: 'Ícono de la pestaña del navegador (PNG o ICO).',
          },
          label: 'Favicon',
          name: 'favicon',
          relationTo: 'media',
          type: 'upload',
        },
        {
          admin: {
            description:
              'Imagen que se muestra al compartir el sitio (recomendado 1200×630).',
          },
          label: 'Imagen para compartir (Open Graph)',
          name: 'ogImage',
          relationTo: 'media',
          type: 'upload',
        },
      ],
      label: 'Imágenes',
      name: 'media',
      type: 'group',
    },
    {
      admin: {
        description:
          'Colores de marca. Se aplican en botones, resaltados y la barra de carga.',
      },
      fields: [
        {
          fields: [
            {
              admin: { placeholder: '#276CF5', width: '50%' },
              label: 'Acento',
              name: 'accent',
              type: 'text',
            },
            {
              admin: { placeholder: '#1D4ED8', width: '50%' },
              label: 'Acento (hover)',
              name: 'accentStrong',
              type: 'text',
            },
          ],
          type: 'row',
        },
        {
          admin: {
            description: 'Color neutro principal (texto, superficies oscuras).',
            placeholder: '#0f172a',
          },
          label: 'Primario',
          name: 'primary',
          type: 'text',
        },
      ],
      label: 'Colores',
      name: 'theme',
      type: 'group',
    },
  ],
  label: 'Configuración del sitio',
  slug: 'site-settings',
}
