# Auditoría de Arquitectura — CMS Catálogo de Autos

> Objetivo del producto: venderlo a agencias de autos (seminuevos/nuevos).
> Etapa: 1–5 agencias al inicio, catálogos pequeños (~50–300 autos c/u).
> Fecha: 2026-08.

---

## 1. Estado actual (qué hay hoy)

**Stack:** Next.js 16 (canary) + Payload CMS 3.x corriendo _dentro_ de la misma app + React 19.
Base de datos **SQLite** (archivo local). Imágenes en **Cloudinary**. Deploy: aún no definido.

### 1.1 Cómo se SUBEN las imágenes ✅ (bien)

- El admin de Payload sube el archivo → un **adapter propio de Cloudinary** (`payload.config.ts`) lo manda a Cloudinary con `disableLocalStorage: true`.
- El `public_id` se deriva de forma **determinista** del filename (`filenameToPublicId`, carpeta `cms-cars/`).
- **Veredicto:** correcto para producción. Las fotos NO viven en el servidor → el servidor puede ser efímero sin perder imágenes.

### 1.2 Cómo se CONSUMEN las imágenes 🟡 (bien, con matiz)

- El frontend arma la URL con el mismo mapeo (`getImageUrl`) o usa `media.url`.
- Se sirven con `next/image` apuntando a `res.cloudinary.com`.
- **Matiz:** hay **doble capa de optimización** (Cloudinary + el optimizador de imágenes de Next). Cloudinary ya redimensiona/comprime; pasar por el optimizador de Next añade costo/CPU sin beneficio. Recomendación: usar un `loader` de Cloudinary en `next/image` (que Next pida directo la transformación a Cloudinary) o `unoptimized` para esas URLs.

### 1.3 El CMS 🟡

- Colecciones bien modeladas (`Cars`, `Brands`, `Colors`, `Media`, `Users`) + el nuevo Global `Homepage`.
- Hooks de negocio (título automático, Title Case) correctos.
- **Riesgos:** el `onInit` hace _seeding_ en cada arranque (acopla datos semilla al runtime); no hay control de acceso por rol más allá de `read: () => true` público (todo el catálogo es lectura pública, ok; pero no hay separación de quién puede editar qué cuando haya varias agencias).

### 1.4 La webapp (data fetching) 🔴 (a corregir)

- `payload-client.ts` hace **fetch-to-self**: desde el servidor llama a su **propia API REST por HTTP** (`NEXT_PUBLIC_API_URL`, default `http://localhost:3000/api`).
- Problemas en prod: (a) depende de una URL absoluta bien configurada por entorno; (b) hop de red innecesario (HTTP a sí mismo) → más latencia y más superficie de error en serverless; (c) desperdicia la **Local API** de Payload, que consulta la BD en proceso, sin HTTP, y es más rápida y tipada.
- **Fix:** en Server Components usar `getPayload()` + `payload.find()/findGlobal()` en lugar de `fetch`.

### 1.5 Base de datos 🔴 (el mayor riesgo)

- **SQLite en archivo local** (`file:./payload.db`).
- En hosts serverless/efímeros (Vercel, contenedores sin volumen) el archivo **se borra en cada deploy/reinicio** → pierdes todo el catálogo.
- En un VM funciona, pero: no escala horizontal (una sola instancia con lock de escritura), backups manuales, y con varias agencias en SaaS se vuelve un cuello de botella.
- **Fix:** migrar a **Postgres** (Payload lo soporta con `@payloadcms/db-postgres`). Es el cambio #1 antes de producción.

### 1.6 Otros hallazgos

- **Next 16 canary**: no es estable. Ya hay bugs anotados (`notFound()` devolviendo 200). Para vender producto → fijar una versión **estable** (Next 15 LTS/estable).
- **`dump.rdb`** (volcado de Redis) en el árbol del repo sin que haya Redis en el código → artefacto suelto, quitar/gitignore.
- No hay **backups**, **migraciones versionadas**, ni **CI/CD**, ni **variables por entorno** más allá de `.env`.
- Secreto por defecto `"your-secret-key-here"` como fallback en `payload.config.ts` → nunca en prod.

---

## 2. Cómo DEBERÍA hacerse (producción vs desarrollo)

| Área               | Desarrollo (local)                                       | Producción                                                                                                           |
| ------------------ | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Base de datos**  | Postgres local en Docker (o SQLite solo para prototipos) | **Postgres gestionado** (Neon/Supabase/RDS) con backups automáticos y migraciones versionadas                        |
| **Imágenes**       | Cloudinary (cuenta free/dev, carpeta por entorno)        | Cloudinary plan pago o **Cloudflare R2 + Images**; carpetas/prefijo por tenant; backup                               |
| **CMS (Payload)**  | Corre embebido en Next (`next dev`)                      | Mismo binario, pero con `PAYLOAD_SECRET` fuerte, control de acceso por rol, y **migraciones** aplicadas en el deploy |
| **Webapp**         | `next dev`, datos vía Local API                          | Next **estable** en build de producción; ISR/revalidate para el catálogo; CDN al frente                              |
| **Data fetching**  | Local API de Payload                                     | Local API (nada de fetch-to-self)                                                                                    |
| **Entornos**       | `.env.local`                                             | `staging` + `production` separados, secretos en el proveedor (no en git)                                             |
| **Deploy**         | manual                                                   | **CI/CD** (GitHub Actions) con migraciones automáticas y rollback                                                    |
| **Backups**        | —                                                        | BD diaria + export de media; probar restore                                                                          |
| **Observabilidad** | logs en consola                                          | Sentry (errores) + logs + uptime monitor                                                                             |

**Manejo de imágenes en prod (resumen):** el patrón actual (subir a Cloudinary, servir por CDN, no guardar en disco) es el correcto. Solo falta: (1) evitar la doble optimización, (2) separar assets por tenant/entorno (prefijo de carpeta), (3) definir política de backup y de tamaños/formatos (WebP/AVIF).

---

## 3. La decisión de negocio: ¿cómo multiplicar agencias?

Esta decisión define costo e infraestructura. Comparativa:

| Modelo                                          | Cómo es                                                                   | ✅ Pros                                                                                    | ❌ Contras                                                                          | Costo/op            |
| ----------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------- |
| **A. Instancia por agencia** (single-tenant)    | Cada cliente = su deploy + su BD + su carpeta Cloudinary                  | Aislamiento total; simple de construir; un cliente no afecta a otro; fácil de personalizar | Operar N deploys; costo crece lineal; actualizar a todos es tedioso                 | Medio, crece lineal |
| **B. SaaS multi-tenant** (1 app, BD compartida) | Una app; cada agencia ve solo sus datos (scope por `tenant`); subdominios | Un solo deploy; costo marginal por cliente bajo; actualizas a todos de una vez             | Más complejo (aislamiento, seguridad, "noisy neighbor"); un bug afecta a todos      | Bajo por cliente    |
| **C. Licencia/plantilla**                       | Entregas el código; ellos hostean                                         | Cero operación tuya; ingreso por licencia                                                  | No hay ingreso recurrente por hosting; soporte disperso; pierdes control de versión | ~0 (tú)             |

### Mi recomendación para tu etapa (1–5 agencias)

**Empieza con el Modelo A (instancia por agencia), pero construido "multi-tenant-ready".**

Por qué:

- Con 1–5 clientes, la complejidad de un SaaS multi-tenant **no se paga todavía**. Vas a ir más rápido al mercado con instancias aisladas.
- El aislamiento total es un **argumento de venta** ("tus datos en tu propia base, tu propio dominio").
- Si dejas el código preparado (un campo `tenant`/config por instancia, nada de datos hardcodeados), migrar a Modelo B cuando tengas 15–20 clientes es evolutivo, no un rewrite.

**Regla práctica:** cambia a multi-tenant (B) cuando operar los deploys manualmente te empiece a doler (~10–15 clientes). Antes de eso, A es más barato en _tu tiempo_.

---

## 4. Dónde puede vivir y cuánto cuesta

Precios aproximados (USD/mes; MXN ≈ ×18). Rango porque depende de tráfico/tamaño.

### Opción 1 — VPS todo-en-uno (más barato) ⭐ para arrancar

Un VPS con Docker: Next+Payload + Postgres en la misma máquina. Cloudinary aparte.

| Componente            | Proveedor                     | Costo/mes         |
| --------------------- | ----------------------------- | ----------------- |
| VPS (2 vCPU / 4 GB)   | Hetzner CX22 / DO Droplet     | $5–12             |
| Postgres              | en el mismo VPS (Docker)      | $0                |
| Imágenes              | Cloudinary Free (25 créditos) | $0 al inicio      |
| Dominio               | —                             | ~$1 (prorrateado) |
| **Total por agencia** |                               | **~$6–15 / mes**  |

- Aísla varias agencias en el mismo VPS con contenedores hasta que crezca el tráfico.
- Contras: tú administras el servidor (updates, backups). Con Docker Compose + backups automatizados es manejable.

### Opción 2 — Vercel + Postgres gestionado (más fácil, casi cero ops)

| Componente            | Proveedor                   | Costo/mes                                                  |
| --------------------- | --------------------------- | ---------------------------------------------------------- |
| Hosting Next          | Vercel (Hobby $0 / Pro $20) | $0–20                                                      |
| Postgres              | Neon / Supabase (free tier) | $0–25                                                      |
| Imágenes              | Cloudinary Free/Plus        | $0–89                                                      |
| **Total por agencia** |                             | **~$0–65 / mes** (free tiers) a **~$130** con planes pagos |

- Pro: deploys automáticos, escalado, SSL, cero servidores. Ideal si valoras tu tiempo.
- Contra: en multi-tenant SaaS, Vercel + Neon escalan muy bien; en instancia-por-agencia el costo se multiplica más rápido que el VPS.
- ⚠️ Payload en Vercel **exige Postgres** (SQLite local no persiste). Confirma límites de tamaño de función.

### Opción 3 — Nube grande (AWS/GCP)

- Solo si esperas escala enterprise o ya tienes cuenta. ECS/Fargate o Cloud Run + RDS/Cloud SQL + Cloudflare/CloudFront.
- Costo base realista **$40–150+/mes** por entorno y bastante más complejidad operativa. **No lo recomiendo para arrancar.**

### Recomendación de nube

- **Arranca en VPS (Hetzner/DigitalOcean) con Docker** si quieres margen y controlar costo con 1–5 clientes: ~$6–15/mes por agencia, todo incluido salvo Cloudinary.
- **Si prefieres cero-ops y velocidad**, Vercel + Neon + Cloudinary con free tiers para validar, subiendo a planes pagos cuando facture.
- **Imágenes:** Cloudinary está bien; si el volumen crece y el costo pesa, evalúa **Cloudflare R2 + Images** (egress $0).

### Ambientes recomendados (mínimo viable)

- **dev** local (Docker Postgres + Cloudinary dev).
- **staging** (1 deploy compartido para probar antes de tocar clientes).
- **production** (por agencia en Modelo A, o único en Modelo B).

---

## 5. Plan de acción priorizado

### 🔴 Fase 0 — Antes de vender a nadie (bloqueantes de prod)

1. **Migrar SQLite → Postgres** (`@payloadcms/db-postgres`) + activar **migraciones** versionadas.
2. **Quitar el fetch-to-self**: usar la **Local API** de Payload en Server Components.
3. **Fijar Next a versión estable** (salir de canary).
4. `PAYLOAD_SECRET` fuerte y por entorno; quitar el fallback inseguro.
5. Quitar `dump.rdb`; limpiar artefactos; `.gitignore` correcto.
6. **Backups automáticos** de Postgres + prueba de restore.

### 🟡 Fase 1 — Listo para el primer cliente

7. **Roles/acceso** en Payload (admin de agencia vs superadmin); `access` de escritura por colección.
8. Evitar doble optimización de imágenes (loader Cloudinary / prefijo por tenant).
9. **CI/CD** (GitHub Actions: build + migraciones + deploy).
10. **Sentry** + uptime monitor + logs.
11. Sacar el _seeding_ del `onInit` a un script/comando de setup.

### 🟢 Fase 2 — Escalar a más agencias

12. Plantilla de aprovisionamiento (script que levanta una instancia nueva: BD + env + dominio + carpeta Cloudinary).
13. Cuando duela operar N instancias (~10–15), evaluar migración a **multi-tenant** (plugin de multi-tenancy de Payload) con scope por `tenant` y subdominios.
14. CDN/ISR afinado, caché, y panel de facturación si es SaaS.

---

### Resumen de una línea

La base (imágenes en Cloudinary) ya es correcta; los tres cambios que separan esto de "producto vendible" son **Postgres**, **quitar el fetch-to-self** y **salir de Next canary**. Arranca con **instancia-por-agencia en un VPS barato** y evoluciona a multi-tenant cuando el número de clientes lo justifique.
