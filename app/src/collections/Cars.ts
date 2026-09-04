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
import { cars, common, groups } from '../i18n/labels'
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
    group: groups.content,
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
          admin: {
            description: cars.tabs.general.description,
          },
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
                  label: common.brand,
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
                  label: common.model,
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
                  label: cars.fields.year.label,
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
                  label: cars.fields.version.label,
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
                  label: cars.fields.transmission.label,
                  name: 'transmission',
                  options: [
                    {
                      label: cars.options.transmission.automatic,
                      value: 'automatic',
                    },
                    {
                      label: cars.options.transmission.manual,
                      value: 'manual',
                    },
                  ],
                  required: true,
                  type: 'select',
                },
                {
                  admin: {
                    description: cars.fields.fuelType.description,
                    width: '50%',
                  },
                  label: cars.fields.fuelType.label,
                  name: 'fuelType',
                  options: [
                    {
                      label: cars.options.fuelType.gasoline,
                      value: 'gasoline',
                    },
                    { label: cars.options.fuelType.diesel, value: 'diesel' },
                    {
                      label: cars.options.fuelType.electric,
                      value: 'electric',
                    },
                    { label: cars.options.fuelType.hybrid, value: 'hybrid' },
                    {
                      label: cars.options.fuelType.plugInHybrid,
                      value: 'plug-in-hybrid',
                    },
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
                    description: cars.fields.status.description,
                    width: '50%',
                  },
                  defaultValue: 'available',
                  label: cars.fields.status.label,
                  name: 'status',
                  options: [
                    {
                      label: cars.options.status.available,
                      value: 'available',
                    },
                    {
                      label: cars.options.status.reserved,
                      value: 'reserved',
                    },
                    {
                      label: cars.options.status.sold,
                      value: 'sold',
                    },
                  ],
                  required: true,
                  type: 'select',
                },
                {
                  admin: { width: '50%' },
                  label: cars.fields.featured.label,
                  name: 'featured',
                  type: 'checkbox',
                },
              ],
              type: 'row',
            },
            {
              label: common.description,
              name: 'description',
              type: 'textarea',
            },
          ],
          label: cars.tabs.general.label,
        },

        // ========================================
        // PHOTOS
        // ========================================
        {
          admin: {
            description: cars.tabs.photos.description,
          },
          fields: [
            {
              admin: {
                description: cars.fields.featuredImage.description,
              },
              label: cars.fields.featuredImage.label,
              name: 'featuredImage',
              relationTo: 'media',
              type: 'upload',
            },
            {
              admin: {
                description: cars.fields.exteriorImages.description,
              },
              hasMany: true,
              label: cars.fields.exteriorImages.label,
              name: 'exteriorImages',
              relationTo: 'media',
              type: 'upload',
            },
            {
              admin: {
                description: cars.fields.interiorImages.description,
              },
              hasMany: true,
              label: cars.fields.interiorImages.label,
              name: 'interiorImages',
              relationTo: 'media',
              type: 'upload',
            },
          ],
          label: cars.tabs.photos.label,
        },

        // ========================================
        // PRICE AND FINANCING
        // ========================================
        {
          admin: {
            description: cars.tabs.price.description,
          },
          fields: [
            {
              fields: [
                {
                  admin: {
                    components: {
                      Description:
                        '/components/PriceDescription#PriceDescription',
                    },
                    description: cars.fields.price.description,
                    placeholder: cars.fields.price.placeholder,
                    width: '50%',
                  },
                  label: cars.fields.price.label,
                  name: 'price',
                  required: true,
                  type: 'number',
                },
                {
                  admin: {
                    description: cars.fields.hasVAT.description,
                    width: '50%',
                  },
                  defaultValue: false,
                  label: cars.fields.hasVAT.label,
                  name: 'hasVAT',
                  type: 'checkbox',
                },
              ],
              type: 'row',
            },
            {
              admin: {
                description: cars.fields.showFinancing.description,
              },
              defaultValue: true,
              label: cars.fields.showFinancing.label,
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
                              cars.fields.minDownPaymentPercentage.description,
                            width: '50%',
                          },
                          defaultValue: 20,
                          label: cars.fields.minDownPaymentPercentage.label,
                          name: 'minDownPaymentPercentage',
                          type: 'number',
                        },
                        {
                          admin: {
                            description:
                              cars.fields.maxDownPaymentPercentage.description,
                            width: '50%',
                          },
                          defaultValue: 80,
                          label: cars.fields.maxDownPaymentPercentage.label,
                          name: 'maxDownPaymentPercentage',
                          type: 'number',
                        },
                      ],
                      type: 'row',
                    },
                    {
                      admin: {
                        description:
                          cars.fields.defaultDownPaymentPercentage.description,
                      },
                      defaultValue: 20,
                      label: cars.fields.defaultDownPaymentPercentage.label,
                      name: 'defaultDownPaymentPercentage',
                      type: 'number',
                    },
                    {
                      admin: {
                        description: cars.fields.availableLoanTerms.description,
                      },
                      fields: [
                        {
                          admin: {
                            placeholder: '36',
                          },
                          label: cars.fields.months.label,
                          name: 'months',
                          required: true,
                          type: 'number',
                        },
                      ],
                      label: cars.fields.availableLoanTerms.label,
                      name: 'availableLoanTerms',
                      type: 'array',
                    },
                    {
                      fields: [
                        {
                          admin: {
                            description:
                              cars.fields.defaultLoanTerm.description,
                            width: '50%',
                          },
                          defaultValue: 36,
                          label: cars.fields.defaultLoanTerm.label,
                          name: 'defaultLoanTerm',
                          type: 'number',
                        },
                        {
                          admin: {
                            description: cars.fields.interestRate.description,
                            placeholder: '8.5',
                            width: '50%',
                          },
                          defaultValue: 8.5,
                          label: cars.fields.interestRate.label,
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
              label: cars.fields.financingOptions.label,
              type: 'collapsible',
            },
          ],
          label: cars.tabs.price.label,
        },

        // ========================================
        // TECHNICAL SPECIFICATIONS
        // ========================================
        {
          admin: {
            description: cars.tabs.specifications.description,
          },
          fields: [
            {
              admin: { initCollapsed: false },
              fields: [
                {
                  fields: [
                    {
                      admin: {
                        description: cars.fields.engine.description,
                        placeholder: 'L4 2.0t',
                        width: '50%',
                      },
                      label: cars.fields.engine.label,
                      name: 'engine',
                      type: 'text',
                    },
                    {
                      admin: {
                        description: cars.fields.horsepower.description,
                        placeholder: '184',
                        width: '50%',
                      },
                      label: cars.fields.horsepower.label,
                      name: 'horsepower',
                      type: 'number',
                    },
                  ],
                  type: 'row',
                },
                {
                  label: cars.fields.cylinders.label,
                  name: 'cylinders',
                  type: 'number',
                },
              ],
              label: cars.fields.engineAndPerformance.label,
              type: 'collapsible',
            },
            {
              admin: { initCollapsed: true },
              fields: [
                {
                  fields: [
                    {
                      admin: {
                        description: cars.fields.vehicleType.description,
                        width: '50%',
                      },
                      label: cars.fields.vehicleType.label,
                      name: 'vehicleType',
                      options: VEHICLE_TYPE_OPTIONS,
                      type: 'select',
                    },
                    {
                      admin: {
                        description: cars.fields.bodyStyle.description,
                        width: '50%',
                      },
                      label: cars.fields.bodyStyle.label,
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
                        description: cars.fields.doors.description,
                        width: '50%',
                      },
                      label: cars.fields.doors.label,
                      name: 'doors',
                      type: 'number',
                    },
                    {
                      admin: { width: '50%' },
                      label: cars.fields.passengers.label,
                      name: 'passengers',
                      type: 'number',
                    },
                  ],
                  type: 'row',
                },
              ],
              label: cars.fields.bodyAndCapacity.label,
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
                    description: cars.fields.mileage.description,
                    placeholder: cars.fields.mileage.placeholder,
                  },
                  label: cars.fields.mileage.label,
                  name: 'mileage',
                  type: 'number',
                },
                {
                  admin: {
                    description: cars.fields.vehicleCondition.description,
                  },
                  label: cars.fields.vehicleCondition.label,
                  name: 'condition',
                  options: CONDITION_OPTIONS,
                  type: 'select',
                },
              ],
              label: cars.fields.usageAndCondition.label,
              type: 'collapsible',
            },
            {
              admin: { initCollapsed: true },
              fields: [
                {
                  fields: [
                    {
                      admin: {
                        description: cars.fields.exteriorColor.description,
                        width: '50%',
                      },
                      hasMany: false,
                      label: cars.fields.exteriorColor.label,
                      name: 'exteriorColor',
                      relationTo: 'colors',
                      type: 'relationship',
                    },
                    {
                      admin: {
                        description: cars.fields.interiorColor.description,
                        width: '50%',
                      },
                      hasMany: false,
                      label: cars.fields.interiorColor.label,
                      name: 'interiorColor',
                      relationTo: 'colors',
                      type: 'relationship',
                    },
                  ],
                  type: 'row',
                },
              ],
              label: cars.fields.colors.label,
              type: 'collapsible',
            },
          ],
          label: cars.tabs.specifications.label,
        },

        // ========================================
        // ADDITIONAL DETAILS
        // ========================================
        {
          admin: {
            description: cars.tabs.additionalDetails.description,
          },
          fields: [
            {
              admin: { initCollapsed: true },
              fields: [
                {
                  admin: {
                    description: cars.fields.features.description,
                  },
                  fields: [
                    {
                      admin: {
                        placeholder: cars.fields.feature.placeholder,
                      },
                      label: cars.fields.feature.label,
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
              label: cars.fields.features.label,
              type: 'collapsible',
            },
            {
              admin: { initCollapsed: true },
              fields: [
                {
                  admin: {
                    description: cars.fields.carHistory.description,
                  },
                  fields: [
                    {
                      admin: {
                        description: cars.fields.inspectionPoints.description,
                      },
                      defaultValue: 150,
                      label: cars.fields.inspectionPoints.label,
                      name: 'inspectionPoints',
                      type: 'number',
                    },
                    {
                      defaultValue: 'single',
                      label: cars.fields.ownerHistory.label,
                      name: 'ownerHistory',
                      options: [
                        {
                          label: cars.options.ownerHistory.single,
                          value: 'single',
                        },
                        { label: cars.options.ownerHistory.two, value: 'two' },
                        {
                          label: cars.options.ownerHistory.multiple,
                          value: 'multiple',
                        },
                      ],
                      type: 'select',
                    },
                    {
                      fields: [
                        {
                          admin: {
                            description: cars.fields.duplicateKeys.description,
                            width: '50%',
                          },
                          defaultValue: false,
                          label: cars.fields.duplicateKeys.label,
                          name: 'duplicateKeys',
                          type: 'checkbox',
                        },
                        {
                          admin: {
                            description: cars.fields.plates.description,
                            width: '50%',
                          },
                          defaultValue: false,
                          label: cars.fields.plates.label,
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
                            description: cars.fields.manuals.description,
                            width: '50%',
                          },
                          defaultValue: false,
                          label: cars.fields.manuals.label,
                          name: 'manuals',
                          type: 'checkbox',
                        },
                        {
                          admin: {
                            description: cars.fields.conditioning.description,
                            width: '50%',
                          },
                          defaultValue: false,
                          label: cars.fields.conditioning.label,
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
              label: cars.fields.carHistory.label,
              type: 'collapsible',
            },
            {
              admin: { initCollapsed: true },
              fields: [
                // The car's city is derived from this dealership, never typed
                // per car: a car saying "Pachuca" while its dealership sits in
                // Tulancingo would put it on the wrong landing page.
                //
                // Not `required` yet — cars imported before the dealership
                // relation existed still have none, and flipping the flag with
                // orphans in the table makes the admin reject saves on records
                // nobody touched. Flip it once the backfill reports zero.
                {
                  admin: {
                    description: cars.fields.dealership.description,
                  },
                  hasMany: false,
                  label: cars.fields.dealership.label,
                  name: 'dealership',
                  relationTo: 'dealerships',
                  type: 'relationship',
                },
              ],
              label: cars.fields.location.label,
              type: 'collapsible',
            },
          ],
          label: cars.tabs.additionalDetails.label,
        },

        // ========================================
        // FACEBOOK MARKETPLACE
        // ========================================
        {
          admin: {
            description: cars.tabs.facebookMarketplace.description,
          },
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
          label: cars.tabs.facebookMarketplace.label,
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
  labels: cars.labels,
  slug: 'cars',
}
