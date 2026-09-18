import { connection } from 'next/server'

import { getSearchIndex } from '@/lib/payload-client'
import { SearchBar } from '@/components/catalog/SearchBar'

/**
 * SearchBox — la barra de búsqueda con las sugerencias del inventario.
 *
 * `SearchBar` es un componente de cliente y las sugerencias salen de la base,
 * así que alguien tiene que leerlas en el servidor: esto. Va detrás de un
 * `<Suspense>` y tras `connection()`, como el resto de las lecturas, para que
 * la cáscara de la página siga prerenderizándose sin base de datos.
 */
export async function SearchBox(): Promise<React.JSX.Element> {
  await connection()

  const { suggestions } = await getSearchIndex()

  return <SearchBar suggestions={suggestions} />
}
