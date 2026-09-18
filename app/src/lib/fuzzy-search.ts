/**
 * Búsqueda tolerante a errores de escritura.
 *
 * El catálogo se busca con `contains`, que es una comparación literal: quien
 * escribe "masda" o "nisan" no encuentra nada aunque el auto esté publicado.
 * Aquí se corrige cada palabra del query contra el vocabulario real del
 * inventario (marcas, modelos y versiones que existen), antes de armar la
 * consulta.
 *
 * Dos pasadas, en este orden:
 *
 * 1. Clave fonética — "masda" y "mazda" suenan igual en español, igual que
 *    "nisan"/"nissan" o "chebrolet"/"chevrolet". Es la que atrapa el error
 *    típico de quien escribe como oye.
 * 2. Distancia de edición — para el dedo resbalado ("toyata", "hyunday"),
 *    que no produce la misma clave fonética.
 *
 * Nunca inventa: si la palabra no se parece a nada del inventario se deja tal
 * cual, y la búsqueda devuelve vacío como antes.
 */

import type { SearchSuggestion } from '../types/car'

/** Debajo de este largo un token es demasiado corto para corregirlo sin inventar (BMW, GLC, 3). */
const MIN_FUZZY_LENGTH = 4

/** A partir de este largo se toleran dos ediciones en vez de una. */
const TWO_EDITS_LENGTH = 8

/** Índices derivados del vocabulario, armados una vez por búsqueda. */
interface VocabularyIndex {
  /** Clave fonética → palabras normalizadas que la producen. */
  byPhonetic: Map<string, string[]>
  /** Palabra normalizada → cómo se escribe de verdad en el CMS (con acentos). */
  originals: Map<string, string>
  /** Todas las palabras normalizadas, para el barrido por distancia. */
  words: string[]
}

/**
 * Baja a minúsculas, quita acentos y puntuación, y colapsa espacios.
 *
 * @param value - El texto a normalizar.
 */
export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Reduce una palabra a cómo suena en español, de modo que dos escrituras del
 * mismo sonido den la misma cadena: z/c → s, v/w → b, ll/y → i, h muda, y las
 * letras dobles se colapsan ("nissan" → "nisan").
 *
 * @param value - La palabra a convertir.
 */
export function phoneticKey(value: string): string {
  return normalize(value)
    .replace(/ch/g, 'x')
    .replace(/qu/g, 'k')
    .replace(/c([ei])/g, 's$1')
    .replace(/c/g, 'k')
    .replace(/g([ei])/g, 'j$1')
    .replace(/z/g, 's')
    .replace(/v/g, 'b')
    .replace(/w/g, 'b')
    .replace(/h/g, '')
    .replace(/ll/g, 'y')
    .replace(/y/g, 'i')
    .replace(/(.)\1+/g, '$1')
}

/**
 * Parte un texto en palabras normalizadas.
 *
 * @param value - El texto a partir.
 */
export function tokenize(value: string): string[] {
  const normalized = normalize(value)
  return normalized === '' ? [] : normalized.split(' ')
}

/**
 * Distancia de Levenshtein entre dos palabras.
 *
 * @param a - Primera palabra.
 * @param b - Segunda palabra.
 */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i)

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i]
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      current.push(
        Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost)
      )
    }
    previous = current
  }

  return previous[b.length]
}

/**
 * Cuántas ediciones se toleran para un token de este largo. Palabras cortas no
 * se corrigen: a un token de tres letras casi todo le queda a distancia uno.
 *
 * @param length - Largo del token.
 */
function editBudget(length: number): number {
  if (length < MIN_FUZZY_LENGTH) return 0
  return length >= TWO_EDITS_LENGTH ? 2 : 1
}

/**
 * Arma los índices de búsqueda a partir del vocabulario del inventario.
 *
 * @param vocabulary - Marcas, modelos y versiones tal como están en el CMS.
 */
function buildIndex(vocabulary: string[]): VocabularyIndex {
  const byPhonetic = new Map<string, string[]>()
  const originals = new Map<string, string>()

  for (const entry of vocabulary) {
    for (const word of entry.split(/\s+/)) {
      const normalized = normalize(word)
      if (normalized === '' || originals.has(normalized)) continue

      originals.set(normalized, word)
      const key = phoneticKey(normalized)
      const bucket = byPhonetic.get(key)
      if (bucket) {
        bucket.push(normalized)
      } else {
        byPhonetic.set(key, [normalized])
      }
    }
  }

  return { byPhonetic, originals, words: [...originals.keys()].sort() }
}

/**
 * Corrige un token contra el vocabulario, o lo devuelve intacto.
 *
 * @param token - La palabra escrita por la persona, ya normalizada.
 * @param index - Los índices del vocabulario.
 */
function correctToken(token: string, index: VocabularyIndex): string {
  // Ya existe, o es el prefijo de algo que existe: `contains` lo encuentra.
  if (index.originals.has(token)) return index.originals.get(token) ?? token
  if (index.words.some((word) => word.startsWith(token))) return token

  const budget = editBudget(token.length)
  if (budget === 0) return token

  // Misma pronunciación: "masda" → "mazda", "nisan" → "nissan".
  const sameSound = index.byPhonetic.get(phoneticKey(token))
  if (sameSound && sameSound.length > 0) {
    const best = [...sameSound].sort()[0]
    return index.originals.get(best) ?? token
  }

  // Dedo resbalado: la palabra más cercana dentro del presupuesto.
  let bestWord: null | string = null
  let bestDistance = budget + 1
  for (const word of index.words) {
    if (Math.abs(word.length - token.length) > budget) continue
    const distance = editDistance(token, word)
    if (distance < bestDistance) {
      bestDistance = distance
      bestWord = word
    }
  }

  return bestWord === null ? token : (index.originals.get(bestWord) ?? token)
}

/**
 * Corrige el query completo, palabra por palabra.
 *
 * Devuelve los términos listos para consultar: "masda 3" con un inventario que
 * tiene un Mazda 3 sale como `['Mazda', '3']`.
 *
 * @param query - Lo que escribió la persona.
 * @param vocabulary - Marcas, modelos y versiones del inventario publicado.
 */
export function correctSearchTerms(
  query: string,
  vocabulary: string[]
): string[] {
  const tokens = tokenize(query)
  if (tokens.length === 0) return []

  const index = buildIndex(vocabulary)
  return tokens.map((token) => correctToken(token, index))
}

/**
 * Las sugerencias que corresponden a lo que se lleva escrito.
 *
 * Corrige primero y filtra después, así "masda" ofrece "Mazda 3" igual que si
 * se hubiera escrito bien. El orden es el del catálogo — más autos detrás,
 * más arriba — que ya viene resuelto desde el servidor.
 *
 * @param query - Lo que va escrito en la barra.
 * @param suggestions - Las sugerencias del inventario publicado.
 * @param limit - Cuántas devolver como máximo.
 */
export function filterSuggestions(
  query: string,
  suggestions: SearchSuggestion[],
  limit: number
): SearchSuggestion[] {
  const vocabulary = suggestions.map((suggestion) => suggestion.label)
  const terms = correctSearchTerms(query, vocabulary).map((term) =>
    normalize(term)
  )
  if (terms.length === 0) return []

  return suggestions
    .filter((suggestion) => {
      const label = normalize(suggestion.label)
      return terms.every((term) => label.includes(term))
    })
    .slice(0, limit)
}
