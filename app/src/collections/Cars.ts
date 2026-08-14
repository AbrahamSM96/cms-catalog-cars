import type { CollectionConfig } from 'payload'

import {
  BODY_TYPE_OPTIONS,
  CONDITION_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
} from '../lib/marketplace'

export const Cars: CollectionConfig = {
  access: {
    /**
     * read
     */
    read: () => true, // Public read access for frontend
  },
  admin: {
    defaultColumns: ['title', 'brand', 'year', 'status'],
    group: 'Content',
    useAsTitle: 'title',
  },
  fields: [
    {
      admin: {
        // Auto-generated ("Marca Modelo Año"); hidden from the form.
        hidden: true,
      },
      hooks: {
        /**
         * Fallback so records saved before this field existed still show a
         * proper title (computed on read) instead of falling back to the id.
         *
         * @param props - The hook parameters
         * @param props.data - The car document data
         * @param props.req - The Payload request object
         * @param props.value - The current title value
         * @returns The computed title
         */
        afterRead: [
          async ({ data, req, value }): Promise<string> => {
            if (value) return value
            if (!data) return value

            const brandRef = data.brand
            let brandName = ''
            if (brandRef) {
              if (typeof brandRef === 'object' && brandRef?.name) {
                brandName = brandRef.name
              } else {
                try {
                  const brand = await req.payload.findByID({
                    collection: 'brands',
                    depth: 0,
                    id: brandRef,
                  })
                  brandName = brand?.name ?? ''
                } catch {
                  // ignore
                }
              }
            }

            const computed = [brandName, data.model, data.year]
              .filter(Boolean)
              .join(' ')
            return computed || value
          },
        ],
      },
      name: 'title',
      type: 'text',
    },
    {
      tabs: [
        // ========================================
        // GENERAL — lo esencial, siempre visible
        // ========================================
        {
          description: 'Datos básicos del vehículo.',
          fields: [
            {
              fields: [
                {
                  admin: { width: '50%' },
                  hasMany: false,
                  name: 'brand',
                  relationTo: 'brands',
                  required: true,
                  type: 'relationship',
                },
                {
                  admin: {
                    components: {
                      Field: '/components/admin/ModelField#ModelField',
                    },
                    width: '50%',
                  },
                  name: 'model',
                  required: true,
                  type: 'text',
                },
              ],
              type: 'row',
            },
            {
              fields: [
                {
                  admin: {
                    components: {
                      Field: '/components/admin/YearField#YearField',
                    },
                    width: '50%',
                  },
                  name: 'year',
                  required: true,
                  type: 'number',
                },
                {
                  admin: {
                    components: {
                      Field: '/components/admin/VersionField#VersionField',
                    },
                    width: '50%',
                  },
                  name: 'version',
                  required: true,
                  type: 'text',
                },
              ],
              type: 'row',
            },
            {
              fields: [
                {
                  admin: { width: '50%' },
                  defaultValue: 'manual',
                  name: 'transmission',
                  options: [
                    {
                      label: 'Automática',
                      value: 'automatic',
                    },
                    {
                      label: 'Manual',
                      value: 'manual',
                    },
                  ],
                  required: true,
                  type: 'select',
                },
                {
                  admin: {
                    description: 'Tipo de combustible',
                    width: '50%',
                  },
                  name: 'fuelType',
                  options: [
                    { label: 'Gasolina', value: 'gasoline' },
                    { label: 'Diésel', value: 'diesel' },
                    { label: 'Eléctrico', value: 'electric' },
                    { label: 'Híbrido', value: 'hybrid' },
                    { label: 'Híbrido Enchufable', value: 'plug-in-hybrid' },
                  ],
                  type: 'select',
                },
              ],
              type: 'row',
            },
            {
              fields: [
                {
                  admin: {
                    description: 'Current availability status of the vehicle',
                    width: '50%',
                  },
                  defaultValue: 'available',
                  name: 'status',
                  options: [
                    {
                      label: '🟢 Available',
                      value: 'available',
                    },
                    {
                      label: '🟡 Reserved',
                      value: 'reserved',
                    },
                    {
                      label: '🔴 Sold',
                      value: 'sold',
                    },
                  ],
                  required: true,
                  type: 'select',
                },
                {
                  admin: { width: '50%' },
                  label: 'Featured',
                  name: 'featured',
                  type: 'checkbox',
                },
              ],
              type: 'row',
            },
            { name: 'description', type: 'textarea' },
          ],
          label: 'General',
        },

        // ========================================
        // FOTOS
        // ========================================
        {
          description: 'Imagen principal y galerías del vehículo.',
          fields: [
            {
              admin: {
                description: 'Imagen que se mostrará en la vista previa',
              },
              label: 'Imagen principal',
              name: 'featuredImage',
              relationTo: 'media',
              type: 'upload',
            },
            {
              admin: {
                description:
                  'Fotos del exterior del vehículo (carrocería, frente, laterales)',
              },
              hasMany: true,
              label: 'Imágenes exteriores',
              name: 'exteriorImages',
              relationTo: 'media',
              type: 'upload',
            },
            {
              admin: {
                description:
                  'Fotos del interior del vehículo (cabina, asientos, tablero)',
              },
              hasMany: true,
              label: 'Imágenes interiores',
              name: 'interiorImages',
              relationTo: 'media',
              type: 'upload',
            },
          ],
          label: 'Fotos',
        },

        // ========================================
        // PRECIO Y FINANCIAMIENTO
        // ========================================
        {
          description: 'Precio de venta y opciones de financiamiento.',
          fields: [
            {
              fields: [
                {
                  admin: {
                    components: {
                      Description:
                        '/components/PriceDescription#PriceDescription',
                    },
                    description: 'Enter price in dollars (e.g., 25000)',
                    placeholder: 'e.g., 25000',
                    width: '50%',
                  },
                  name: 'price',
                  required: true,
                  type: 'number',
                },
                {
                  admin: {
                    description:
                      '¿El precio incluye/factura IVA? (se muestra como Sí/No)',
                    width: '50%',
                  },
                  defaultValue: false,
                  label: 'IVA',
                  name: 'hasVAT',
                  type: 'checkbox',
                },
              ],
              type: 'row',
            },
            {
              admin: {
                description:
                  'Desactívalo para autos de solo contado; oculta la calculadora en el detalle del vehículo.',
              },
              defaultValue: true,
              label: 'Mostrar calculadora de financiamiento',
              name: 'showFinancing',
              type: 'checkbox',
            },
            {
              admin: {
                /**
                 * Condition to show financing section
                 *
                 * @param data - The car document data
                 * @returns Whether to show the financing section
                 */
                condition: (data): boolean => data?.showFinancing !== false,
                initCollapsed: true,
              },
              fields: [
                {
                  fields: [
                    {
                      fields: [
                        {
                          admin: {
                            description:
                              'Porcentaje mínimo de enganche (ej: 20%)',
                            width: '50%',
                          },
                          defaultValue: 20,
                          name: 'minDownPaymentPercentage',
                          type: 'number',
                        },
                        {
                          admin: {
                            description:
                              'Porcentaje máximo de enganche (ej: 80%)',
                            width: '50%',
                          },
                          defaultValue: 80,
                          name: 'maxDownPaymentPercentage',
                          type: 'number',
                        },
                      ],
                      type: 'row',
                    },
                    {
                      admin: {
                        description:
                          'Porcentaje de enganche sugerido por defecto',
                      },
                      defaultValue: 20,
                      name: 'defaultDownPaymentPercentage',
                      type: 'number',
                    },
                    {
                      admin: {
                        description:
                          'Lista de plazos en meses que ofreces (ej: 6, 12, 24, 36, 48, 60)',
                      },
                      fields: [
                        {
                          admin: {
                            placeholder: '36',
                          },
                          name: 'months',
                          required: true,
                          type: 'number',
                        },
                      ],
                      label: 'Plazos disponibles (meses)',
                      name: 'availableLoanTerms',
                      type: 'array',
                    },
                    {
                      fields: [
                        {
                          admin: {
                            description:
                              'Plazo sugerido por defecto en meses (debe estar en la lista de disponibles)',
                            width: '50%',
                          },
                          defaultValue: 36,
                          name: 'defaultLoanTerm',
                          type: 'number',
                        },
                        {
                          admin: {
                            description: 'Tasa de interés anual (%)',
                            placeholder: '8.5',
                            width: '50%',
                          },
                          defaultValue: 8.5,
                          name: 'interestRate',
                          type: 'number',
                        },
                      ],
                      type: 'row',
                    },
                  ],
                  label: false,
                  name: 'financing',
                  type: 'group',
                },
              ],
              label: 'Opciones de financiamiento',
              type: 'collapsible',
            },
          ],
          label: 'Precio',
        },

        // ========================================
        // ESPECIFICACIONES TÉCNICAS
        // ========================================
        {
          description: 'Ficha técnica del vehículo.',
          fields: [
            {
              admin: { initCollapsed: false },
              fields: [
                {
                  fields: [
                    {
                      admin: {
                        description:
                          'Especificación del motor (ej: L4 2.0t, V6 3.5L)',
                        placeholder: 'L4 2.0t',
                        width: '50%',
                      },
                      name: 'engine',
                      type: 'text',
                    },
                    {
                      admin: {
                        description: 'Caballos de fuerza (HP)',
                        placeholder: '184',
                        width: '50%',
                      },
                      name: 'horsepower',
                      type: 'number',
                    },
                  ],
                  type: 'row',
                },
                { name: 'cylinders', type: 'number' },
              ],
              label: 'Motor y desempeño',
              type: 'collapsible',
            },
            {
              admin: { initCollapsed: true },
              fields: [
                {
                  fields: [
                    {
                      admin: {
                        description: 'Auto o camioneta (Facebook Marketplace)',
                        width: '50%',
                      },
                      label: 'Tipo de vehículo',
                      name: 'vehicleType',
                      options: VEHICLE_TYPE_OPTIONS,
                      type: 'select',
                    },
                    {
                      admin: {
                        description:
                          'Tipo de carrocería (alineado a Facebook Marketplace)',
                        width: '50%',
                      },
                      label: 'Carrocería',
                      name: 'bodyType',
                      options: BODY_TYPE_OPTIONS,
                      type: 'select',
                    },
                  ],
                  type: 'row',
                },
                {
                  fields: [
                    {
                      admin: {
                        description: 'Número de puertas (ej: 4)',
                        width: '50%',
                      },
                      name: 'doors',
                      type: 'number',
                    },
                    {
                      admin: { width: '50%' },
                      name: 'passengers',
                      type: 'number',
                    },
                  ],
                  type: 'row',
                },
              ],
              label: 'Carrocería y capacidad',
              type: 'collapsible',
            },
            {
              admin: { initCollapsed: true },
              fields: [
                {
                  admin: {
                    components: {
                      Description:
                        '/components/MileageDescription#MileageDescription',
                    },
                    description: 'Enter mileage in kilometers (e.g., 150000)',
                    placeholder: 'e.g., 150000',
                  },
                  name: 'mileage',
                  type: 'number',
                },
                {
                  admin: {
                    description:
                      'Condición general del vehículo (Facebook Marketplace)',
                  },
                  label: 'Estado del vehículo',
                  name: 'condition',
                  options: CONDITION_OPTIONS,
                  type: 'select',
                },
              ],
              label: 'Uso y condición',
              type: 'collapsible',
            },
            {
              admin: { initCollapsed: true },
              fields: [
                {
                  fields: [
                    {
                      admin: {
                        description:
                          'Color de la carrocería. ¿No está en la lista? Agrégalo en la colección Colores.',
                        width: '50%',
                      },
                      hasMany: false,
                      label: 'Color exterior',
                      name: 'exteriorColor',
                      relationTo: 'colors',
                      type: 'relationship',
                    },
                    {
                      admin: {
                        description:
                          'Color de la tapicería. ¿No está en la lista? Agrégalo en la colección Colores.',
                        width: '50%',
                      },
                      hasMany: false,
                      label: 'Color interior',
                      name: 'interiorColor',
                      relationTo: 'colors',
                      type: 'relationship',
                    },
                  ],
                  type: 'row',
                },
              ],
              label: 'Colores',
              type: 'collapsible',
            },
          ],
          label: 'Especificaciones',
        },

        // ========================================
        // DETALLES ADICIONALES — todo colapsado
        // ========================================
        {
          description: 'Equipamiento, historial y ubicación (opcional).',
          fields: [
            {
              admin: { initCollapsed: true },
              fields: [
                {
                  admin: {
                    description:
                      'Equipamiento y características especiales del vehículo',
                  },
                  fields: [
                    {
                      admin: {
                        placeholder: 'Bluetooth, Cámara trasera, etc.',
                      },
                      name: 'feature',
                      required: true,
                      type: 'text',
                    },
                  ],
                  label: false,
                  name: 'features',
                  type: 'array',
                },
              ],
              label: 'Características',
              type: 'collapsible',
            },
            {
              admin: { initCollapsed: true },
              fields: [
                {
                  admin: {
                    description: 'Respaldo e inspección del vehículo',
                  },
                  fields: [
                    {
                      admin: {
                        description:
                          'Número de puntos inspeccionados (ej: 150 → "+150 puntos")',
                      },
                      defaultValue: 150,
                      label: 'Puntos de inspección',
                      name: 'inspectionPoints',
                      type: 'number',
                    },
                    {
                      defaultValue: 'single',
                      label: 'Historial de dueños',
                      name: 'ownerHistory',
                      options: [
                        { label: 'Único dueño', value: 'single' },
                        { label: '2 dueños', value: 'two' },
                        { label: '3 o más dueños', value: 'multiple' },
                      ],
                      type: 'select',
                    },
                    {
                      fields: [
                        {
                          admin: {
                            description:
                              '¿Incluye duplicado de llaves? (Sí/No)',
                            width: '50%',
                          },
                          defaultValue: false,
                          label: 'Duplicado de llaves',
                          name: 'duplicateKeys',
                          type: 'checkbox',
                        },
                        {
                          admin: {
                            description: '¿Incluye placas? (Sí/No)',
                            width: '50%',
                          },
                          defaultValue: false,
                          label: 'Placas',
                          name: 'plates',
                          type: 'checkbox',
                        },
                      ],
                      type: 'row',
                    },
                    {
                      fields: [
                        {
                          admin: {
                            description: '¿Incluye manuales? (Sí/No)',
                            width: '50%',
                          },
                          defaultValue: false,
                          label: 'Manuales',
                          name: 'manuals',
                          type: 'checkbox',
                        },
                        {
                          admin: {
                            description:
                              '¿Recibió acondicionamiento/detallado? (Sí/No)',
                            width: '50%',
                          },
                          defaultValue: false,
                          label: 'Acondicionamiento',
                          name: 'conditioning',
                          type: 'checkbox',
                        },
                      ],
                      type: 'row',
                    },
                  ],
                  label: false,
                  name: 'history',
                  type: 'group',
                },
              ],
              label: 'Historial del auto',
              type: 'collapsible',
            },
            {
              admin: { initCollapsed: true },
              fields: [
                {
                  admin: {
                    description:
                      'Selecciona el concesionario donde está el auto. Se usa para mostrar el mapa en el detalle del vehículo.',
                  },
                  hasMany: false,
                  label: 'Concesionario',
                  name: 'dealership',
                  relationTo: 'dealerships',
                  type: 'relationship',
                },
                {
                  admin: {
                    description:
                      'Úsala solo si no eliges un concesionario de la lista.',
                  },
                  fields: [
                    {
                      admin: {
                        description:
                          'Nombre del concesionario (ej: Centro Magno)',
                        placeholder: 'Centro Magno',
                      },
                      name: 'dealership',
                      type: 'text',
                    },
                    {
                      fields: [
                        {
                          admin: {
                            description: 'Ciudad',
                            placeholder: 'Guadalajara',
                            width: '50%',
                          },
                          name: 'city',
                          type: 'text',
                        },
                        {
                          admin: {
                            description: 'Estado',
                            placeholder: 'Jalisco',
                            width: '50%',
                          },
                          name: 'state',
                          type: 'text',
                        },
                      ],
                      type: 'row',
                    },
                  ],
                  label: 'Ubicación manual (opcional)',
                  name: 'location',
                  type: 'group',
                },
              ],
              label: 'Ubicación',
              type: 'collapsible',
            },
          ],
          label: 'Detalles adicionales',
        },

        // ========================================
        // FACEBOOK MARKETPLACE — siempre al final
        // ========================================
        {
          description: 'Genera la publicación para Facebook Marketplace.',
          fields: [
            {
              admin: {
                components: {
                  Field:
                    '/components/FacebookMarketplacePanel#FacebookMarketplacePanel',
                },
              },
              name: 'fbMarketplace',
              type: 'ui',
            },
          ],
          label: 'Facebook Marketplace',
        },
      ],

      type: 'tabs',
    },
  ],
  hooks: {
    beforeChange: [
      /**
       * Format text fields and build display title for the car collection.
       *
       * @param props - The hook parameters
       * @param props.data - The car document data being saved
       * @param props.originalDoc - The original document before changes
       * @param props.req - The Payload request object
       * @returns The modified car document data
       */
      // oxlint-disable-next-line typescript/no-explicit-any
      async ({ data, originalDoc, req }): Promise<Partial<any>> => {
        // Format text fields to Title Case (Capital Letter)
        const formattedModel = data.model
          ? data.model
              .toLowerCase()
              .split(' ')
              .map(
                (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join(' ')
          : data.model

        const formattedVersion = data.version
          ? data.version
              .toLowerCase()
              .split(' ')
              .map(
                (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join(' ')
          : data.version

        // Build the display title used across the admin: "Marca Modelo Año"
        const brandRef = data.brand ?? originalDoc?.brand
        const model = formattedModel ?? originalDoc?.model
        const year = data.year ?? originalDoc?.year

        let brandName = ''
        if (brandRef) {
          if (typeof brandRef === 'object' && brandRef?.name) {
            brandName = brandRef.name
          } else {
            try {
              const brand = await req.payload.findByID({
                collection: 'brands',
                depth: 0,
                id: brandRef,
              })
              brandName = brand?.name ?? ''
            } catch {
              // brand not found yet; leave blank
            }
          }
        }

        return {
          ...data,
          model: formattedModel ?? data.model,
          title: [brandName, model, year].filter(Boolean).join(' '),
          version: formattedVersion ?? data.version,
        }
      },
    ],
  },
  slug: 'cars',
}
