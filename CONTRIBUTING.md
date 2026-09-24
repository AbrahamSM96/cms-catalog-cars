# Convención de commits

El `CHANGELOG.md` y las versiones se generan solos a partir de estos mensajes.
Un commit mal escrito no aparece en el changelog y no sube la versión.

## Formato

```
<tipo>(<alcance opcional>): <descripción en imperativo>

<cuerpo opcional>

<footer opcional>
```

Reglas:

- El tipo va en minúsculas y termina en `:` seguido de un espacio.
- La descripción va en inglés, en imperativo y sin punto final:
  `add lead export`, no `added lead export.` ni `adds`.
- Máximo ~72 caracteres en la primera línea.
- El alcance es opcional pero recomendado. Los que ya usas en el repo:
  `admin`, `catalog`, `cars`, `leads`, `migrations`, `seo`, `ui`, `auth`,
  `analytics`, `backup`, `deps`.

## Tipos y qué hacen

| Tipo | Sección en el CHANGELOG | Efecto en la versión |
| --- | --- | --- |
| `feat` | Features | sube **minor** (0.1.0 → 0.2.0) |
| `fix` | Bug Fixes | sube **patch** (0.2.0 → 0.2.1) |
| `perf` | Performance | patch |
| `refactor` | Refactors | patch |
| `revert` | Reverts | patch |
| `docs` | Documentation | patch |
| `build` | Build & Dependencies | patch |
| `ci` | oculto | ninguno |
| `chore` | oculto | ninguno |
| `style` | oculto | ninguno |
| `test` | oculto | ninguno |

`style` es formato de código (oxfmt, comillas, espacios), **no** cambios de CSS.
Un cambio visual real es `feat` o `fix`.

## Breaking changes

Dos formas, equivalentes. Mientras el proyecto esté pre-1.0 suben la minor, no
la major:

```
feat(cars)!: replace price field with priceMxn

BREAKING CHANGE: `price` ya no existe; correr la migración 0042 antes de
desplegar.
```

Úsalo para lo que rompe a otro: un campo de Payload eliminado, una migración
obligatoria, una variable de entorno nueva sin default.

## Ejemplos

Bien:

```
feat(leads): add WhatsApp source tracking to lead form
fix(catalog): keep brand filter after pagination
perf(cars): cache similar-cars query for 5 minutes
refactor(admin): extract VIN panel into its own component
build(deps): bump payload to 3.62.0
chore: update .gitignore
```

Mal:

```
update stuff                      -> sin tipo, no entra al changelog
feat: Added new card component.   -> pasado + punto final
feat: fix bug in filters          -> el tipo no corresponde al cambio
wip                               -> no llega a main
```

## Cómo se publica una versión

No hay paso manual. En cada push a `main`, el workflow `Release` hace todo:

1. Calcula la versión siguiente desde los commits nuevos.
2. Reescribe `CHANGELOG.md` y sube la versión en `package.json`.
3. Commitea eso a `main` como `chore(release): vX.Y.Z [skip ci]`.
4. Crea el tag `vX.Y.Z` y el GitHub Release con las notas.

Consecuencias prácticas:

- Un push con un solo `feat` ya publica una versión. Si quieres agrupar varios
  cambios en un release, júntalos en una rama y mergea de una vez.
- Un push con puros `chore`/`ci`/`style`/`test` no publica nada y el job
  termina en verde. Es lo esperado.
- Como el `CHANGELOG.md` se reescribe completo, no lo edites: cualquier cambio
  a mano se pierde en el siguiente release.

### La sección 0.1.0 (historial viejo)

Todo lo anterior a octubre de 2026 se generó una sola vez desde los commits y
vive como texto fijo en el `footer` de `cliff.toml`. Se re-emite tal cual al
final del `CHANGELOG.md` en cada release.

Si quieres corregir una línea de esa época, edítala en `cliff.toml`, no en
`CHANGELOG.md` (ese archivo se sobrescribe). Los commits de entonces no seguían
la convención: los que no tenían prefijo quedaron agrupados en `Other`.

### Probarlo en local antes de pushear

```bash
bunx git-cliff@2 --bumped-version   # qué versión saldría
bunx git-cliff@2 --unreleased       # qué texto saldría en el changelog
```
