/**
 * Building the version dropdown out of the scraped catalogue.
 *
 * The catalogue stores one row per version with the list of years it was sold,
 * and the obvious query — versions whose `years` contains this car's year —
 * leaves the dropdown empty whenever the scrape simply lacks that year. The
 * field is the last required one in the General tab, so an empty dropdown used
 * to mean an unsavable document.
 *
 * The way out is not free text, which would let one version be spelled three
 * ways and quietly ruin filtering later. It is to notice that these
 * descriptions belong to a model generation rather than to a calendar year: a
 * 2018 trim is almost always the same car as the 2019 one. So when the exact
 * year has nothing, the neighbouring years are offered instead — labelled with
 * the year they came from, because an editor borrowing a description from
 * another year should be able to see that they are.
 */

/** One entry of the version dropdown. */
export interface VersionOption {
  label: string
  value: string
}

/** A version row as the catalogue stores it. */
export interface VersionDoc {
  description?: string
  years?: number[]
}

/**
 * How far a version's closest year sits from the car's year, or `null` when
 * the row carries no years at all.
 *
 * @param doc - The catalogue row.
 * @param year - The car's model year.
 */
function nearestYear(doc: VersionDoc, year: number): number | null {
  const years = doc.years ?? []
  if (years.length === 0) return null

  return years.reduce((closest, candidate) =>
    Math.abs(candidate - year) < Math.abs(closest - year) ? candidate : closest
  )
}

/**
 * Build the dropdown entries for a model, preferring the exact year and
 * falling back to the nearest ones.
 *
 * @param props - Inputs.
 * @param props.docs - Every version the catalogue has for this model.
 * @param props.year - The car's model year.
 */
export function buildVersionOptions(props: {
  docs: VersionDoc[]
  year: number
}): VersionOption[] {
  const { docs, year } = props

  const described = docs.filter(
    (doc): doc is VersionDoc & { description: string } =>
      typeof doc.description === 'string' && doc.description.length > 0
  )

  const exact = described.filter((doc) => (doc.years ?? []).includes(year))
  if (exact.length > 0) {
    const unique = [...new Set(exact.map((doc) => doc.description))]
    return unique.map((description) => ({
      label: description,
      value: description,
    }))
  }

  // Nothing for this year: offer the neighbouring ones, closest first, and say
  // which year each one is from.
  const borrowed = new Map<string, number>()
  for (const doc of described) {
    const closest = nearestYear(doc, year)
    if (closest === null) continue

    const previous = borrowed.get(doc.description)
    if (
      previous === undefined ||
      Math.abs(closest - year) < Math.abs(previous - year)
    ) {
      borrowed.set(doc.description, closest)
    }
  }

  return [...borrowed.entries()]
    .sort((left, right) => {
      const distance = Math.abs(left[1] - year) - Math.abs(right[1] - year)
      return distance === 0 ? left[0].localeCompare(right[0]) : distance
    })
    .map(([description, from]) => ({
      label: `${String(from)} · ${description}`,
      value: description,
    }))
}
