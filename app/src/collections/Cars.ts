import type { CollectionConfig } from 'payload'

import { adminsOnly, editorsAndAdmins } from '../access'
import {
  BODY_TYPE_OPTIONS,
  CONDITION_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
} from '../lib/marketplace'
import { resolveBrandName, toTitleCase } from '../lib/car-title'
import {
  revalidateAfterChange,
  revalidateAfterDelete,
} from '../hooks/revalidate'
import { CACHE_TAGS } from '../lib/cache-tags'
import { renameCarMedia } from '../hooks/renameCarMedia'

export const Cars: CollectionConfig = {
  access: {
    create: editorsAndAdmins,
    delete: adminsOnly,
    /**
     * read
     */
    read: () => true, // Public read access for frontend
    update: editorsAndAdmins,
  },
  admin: {
    defaultColumns: ['title', 'brand', 'year', 'status'],
    group: 'Content',
    useAsTitle: 'title',
  },
  fields: [
    {
      admin: {
        // Auto-generated ("Brand Model Year"); hidden from the form.
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

            const brandName = await resolveBrandName(data.brand, req.payload)
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
        // GENERAL
        // ========================================
        {
          description: 'Core vehicle data.',
          fields: [
            {
              fields: [
                {
                  admin: {
                    components: {
                      Field: '/components/admin/BrandField#BrandField',
                    },
                    width: '50%',
                  },
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
                      label: 'Automatic',
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
                    description: 'Fuel type',
                    width: '50%',
                  },
                  name: 'fuelType',
                  options: [
                    { label: 'Gasoline', value: 'gasoline' },
                    { label: 'Diesel', value: 'diesel' },
                    { label: 'Electric', value: 'electric' },
                    { label: 'Hybrid', value: 'hybrid' },
                    { label: 'Plug-in hybrid', value: 'plug-in-hybrid' },
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
        // PHOTOS
        // ========================================
        {
          description: 'Featured image and vehicle galleries.',
          fields: [
            {
              admin: {
                description: 'Image shown in the preview',
              },
              label: 'Featured image',
              name: 'featuredImage',
              relationTo: 'media',
              type: 'upload',
            },
            {
              admin: {
                description:
                  'Exterior photos of the vehicle (body, front, sides)',
              },
              hasMany: true,
              label: 'Exterior images',
              name: 'exteriorImages',
              relationTo: 'media',
              type: 'upload',
            },
            {
              admin: {
                description:
                  'Interior photos of the vehicle (cabin, seats, dashboard)',
              },
              hasMany: true,
              label: 'Interior images',
              name: 'interiorImages',
              relationTo: 'media',
              type: 'upload',
            },
          ],
          label: 'Photos',
        },

        // ========================================
        // PRICE AND FINANCING
        // ========================================
        {
          description: 'Sale price and financing options.',
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
                      'Does the price include/invoice VAT? (shown as Yes/No)',
                    width: '50%',
                  },
                  defaultValue: false,
                  label: 'VAT',
                  name: 'hasVAT',
                  type: 'checkbox',
                },
              ],
              type: 'row',
            },
            {
              admin: {
                description:
                  'Turn it off for cash-only cars; hides the calculator on the vehicle detail page.',
              },
              defaultValue: true,
              label: 'Show financing calculator',
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
                              'Minimum down payment percentage (e.g. 20%)',
                            width: '50%',
                          },
                          defaultValue: 20,
                          name: 'minDownPaymentPercentage',
                          type: 'number',
                        },
                        {
                          admin: {
                            description:
                              'Maximum down payment percentage (e.g. 80%)',
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
                          'Default suggested down payment percentage',
                      },
                      defaultValue: 20,
                      name: 'defaultDownPaymentPercentage',
                      type: 'number',
                    },
                    {
                      admin: {
                        description:
                          'List of terms in months you offer (e.g. 6, 12, 24, 36, 48, 60)',
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
                      label: 'Available terms (months)',
                      name: 'availableLoanTerms',
                      type: 'array',
                    },
                    {
                      fields: [
                        {
                          admin: {
                            description:
                              'Default suggested term in months (must be in the available list)',
                            width: '50%',
                          },
                          defaultValue: 36,
                          name: 'defaultLoanTerm',
                          type: 'number',
                        },
                        {
                          admin: {
                            description: 'Annual interest rate (%)',
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
              label: 'Financing options',
              type: 'collapsible',
            },
          ],
          label: 'Price',
        },

        // ========================================
        // TECHNICAL SPECIFICATIONS
        // ========================================
        {
          description: 'Vehicle spec sheet.',
          fields: [
            {
              admin: { initCollapsed: false },
              fields: [
                {
                  fields: [
                    {
                      admin: {
                        description:
                          'Engine specification (e.g. L4 2.0t, V6 3.5L)',
                        placeholder: 'L4 2.0t',
                        width: '50%',
                      },
                      name: 'engine',
                      type: 'text',
                    },
                    {
                      admin: {
                        description: 'Horsepower (HP)',
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
              label: 'Engine and performance',
              type: 'collapsible',
            },
            {
              admin: { initCollapsed: true },
              fields: [
                {
                  fields: [
                    {
                      admin: {
                        description: 'Car or truck (Facebook Marketplace)',
                        width: '50%',
                      },
                      label: 'Vehicle type',
                      name: 'vehicleType',
                      options: VEHICLE_TYPE_OPTIONS,
                      type: 'select',
                    },
                    {
                      admin: {
                        description:
                          'Body style (aligned with Facebook Marketplace)',
                        width: '50%',
                      },
                      label: 'Body style',
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
                        description: 'Number of doors (e.g. 4)',
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
              label: 'Body and capacity',
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
                      'Overall vehicle condition (Facebook Marketplace)',
                  },
                  label: 'Vehicle condition',
                  name: 'condition',
                  options: CONDITION_OPTIONS,
                  type: 'select',
                },
              ],
              label: 'Usage and condition',
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
                          'Body color. Not on the list? Add it in the Colors collection.',
                        width: '50%',
                      },
                      hasMany: false,
                      label: 'Exterior color',
                      name: 'exteriorColor',
                      relationTo: 'colors',
                      type: 'relationship',
                    },
                    {
                      admin: {
                        description:
                          'Upholstery color. Not on the list? Add it in the Colors collection.',
                        width: '50%',
                      },
                      hasMany: false,
                      label: 'Interior color',
                      name: 'interiorColor',
                      relationTo: 'colors',
                      type: 'relationship',
                    },
                  ],
                  type: 'row',
                },
              ],
              label: 'Colors',
              type: 'collapsible',
            },
          ],
          label: 'Specifications',
        },

        // ========================================
        // ADDITIONAL DETAILS
        // ========================================
        {
          description: 'Features, history and location (optional).',
          fields: [
            {
              admin: { initCollapsed: true },
              fields: [
                {
                  admin: {
                    description:
                      'Equipment and special features of the vehicle',
                  },
                  fields: [
                    {
                      admin: {
                        placeholder: 'Bluetooth, Backup camera, etc.',
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
              label: 'Features',
              type: 'collapsible',
            },
            {
              admin: { initCollapsed: true },
              fields: [
                {
                  admin: {
                    description: 'Vehicle warranty and inspection',
                  },
                  fields: [
                    {
                      admin: {
                        description:
                          'Number of inspected points (e.g. 150 → "+150 points")',
                      },
                      defaultValue: 150,
                      label: 'Inspection points',
                      name: 'inspectionPoints',
                      type: 'number',
                    },
                    {
                      defaultValue: 'single',
                      label: 'Owner history',
                      name: 'ownerHistory',
                      options: [
                        { label: 'Single owner', value: 'single' },
                        { label: '2 owners', value: 'two' },
                        { label: '3 or more owners', value: 'multiple' },
                      ],
                      type: 'select',
                    },
                    {
                      fields: [
                        {
                          admin: {
                            description:
                              'Includes duplicate keys? (Yes/No)',
                            width: '50%',
                          },
                          defaultValue: false,
                          label: 'Duplicate keys',
                          name: 'duplicateKeys',
                          type: 'checkbox',
                        },
                        {
                          admin: {
                            description: 'Includes license plates? (Yes/No)',
                            width: '50%',
                          },
                          defaultValue: false,
                          label: 'License plates',
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
                            description: 'Includes manuals? (Yes/No)',
                            width: '50%',
                          },
                          defaultValue: false,
                          label: 'Manuals',
                          name: 'manuals',
                          type: 'checkbox',
                        },
                        {
                          admin: {
                            description:
                              'Received reconditioning/detailing? (Yes/No)',
                            width: '50%',
                          },
                          defaultValue: false,
                          label: 'Reconditioning',
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
              label: 'Car history',
              type: 'collapsible',
            },
            {
              admin: { initCollapsed: true },
              fields: [
                {
                  admin: {
                    description:
                      'Select the dealership where the car is located. Used to show the map on the vehicle detail page.',
                  },
                  hasMany: false,
                  label: 'Dealership',
                  name: 'dealership',
                  relationTo: 'dealerships',
                  type: 'relationship',
                },
                {
                  admin: {
                    description:
                      'Use it only if you do not pick a dealership from the list.',
                  },
                  fields: [
                    {
                      admin: {
                        description:
                          'Dealership name (e.g. Centro Magno)',
                        placeholder: 'Centro Magno',
                      },
                      name: 'dealership',
                      type: 'text',
                    },
                    {
                      fields: [
                        {
                          admin: {
                            description: 'City',
                            placeholder: 'Guadalajara',
                            width: '50%',
                          },
                          name: 'city',
                          type: 'text',
                        },
                        {
                          admin: {
                            description: 'State',
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
                  label: 'Manual location (optional)',
                  name: 'location',
                  type: 'group',
                },
              ],
              label: 'Location',
              type: 'collapsible',
            },
          ],
          label: 'Additional details',
        },

        // ========================================
        // FACEBOOK MARKETPLACE
        // ========================================
        {
          description: 'Generate the Facebook Marketplace listing.',
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
    afterChange: [renameCarMedia, revalidateAfterChange(CACHE_TAGS.cars)],
    afterDelete: [revalidateAfterDelete(CACHE_TAGS.cars)],
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
        const formattedModel = toTitleCase(data.model) ?? data.model
        const formattedVersion = toTitleCase(data.version) ?? data.version

        // Build the display title used across the admin: "Brand Model Year"
        const brandRef = data.brand ?? originalDoc?.brand
        const model = formattedModel ?? originalDoc?.model
        const year = data.year ?? originalDoc?.year

        const brandName = await resolveBrandName(brandRef, req.payload)

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
