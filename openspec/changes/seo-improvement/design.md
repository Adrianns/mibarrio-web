## Context

Mi Barrio es una app SvelteKit que lista proveedores de servicios locales. Actualmente tiene:
- Títulos de página básicos con `<svelte:head>`
- robots.txt que permite todo
- Meta descriptions solo en algunas páginas (homepage, detail pages)
- Sin sitemap, sin OpenGraph, sin datos estructurados

La app usa Supabase para datos, con proveedores almacenados en tabla `providers`.

## Goals / Non-Goals

**Goals:**
- Aparecer en resultados de Google para búsquedas de servicios locales
- Mostrar previews atractivos al compartir en redes sociales
- Implementación simple usando características nativas de SvelteKit
- Código reutilizable para mantener consistencia

**Non-Goals:**
- SEO avanzado (hreflang, AMP, etc.)
- PWA/manifest.json (fuera de alcance)
- Optimización de imágenes (separate concern)
- Analytics de SEO

## Decisions

### 1. Componente SEO centralizado vs meta tags distribuidos
**Decisión**: Crear componente `<SEO>` reutilizable en `/src/lib/components/SEO.svelte`

**Alternativas consideradas:**
- Meta tags en cada página individualmente → Inconsistente, difícil mantener
- Librería externa (svelte-meta-tags) → Dependencia innecesaria para algo simple

**Razón**: Un componente propio es más simple, sin dependencias, y se adapta exactamente a nuestras necesidades.

### 2. Sitemap estático vs dinámico
**Decisión**: Sitemap dinámico como endpoint SvelteKit en `/src/routes/sitemap.xml/+server.ts`

**Alternativas consideradas:**
- Sitemap estático en /static → No incluye proveedores dinámicos
- Generado en build time → Requiere rebuild para nuevos proveedores

**Razón**: Los proveedores cambian frecuentemente. Un endpoint dinámico siempre está actualizado.

### 3. Ubicación de JSON-LD
**Decisión**: Incluir JSON-LD dentro del componente `<SEO>` usando `<svelte:head>`

**Alternativas consideradas:**
- Archivos JSON separados → Más complejo, no necesario
- Script tags manuales en cada página → Inconsistente

**Razón**: Centralizado en el componente SEO mantiene todo junto y fácil de mantener.

### 4. Imagen OG por defecto
**Decisión**: Usar imagen estática en `/static/og-image.png` (1200x630px)

**Alternativas consideradas:**
- Generación dinámica de imágenes → Complejidad innecesaria para MVP
- Sin imagen → Mal preview en redes sociales

**Razón**: Una imagen genérica de marca es suficiente para empezar. Se puede mejorar después.

## Risks / Trade-offs

**[Sitemap grande]** → Si hay miles de proveedores, el sitemap podría ser lento. Mitigation: Agregar cache headers y considerar paginación si crece mucho.

**[Meta descriptions vacías]** → Algunos proveedores no tienen descripción. Mitigation: Fallback a descripción genérica basada en categoría.

**[Cache de Google]** → Cambios en meta tags tardan en reflejarse. Mitigation: Usar Google Search Console para solicitar reindexación.

## File Structure

```
src/
├── lib/
│   ├── components/
│   │   └── SEO.svelte          # Componente principal
│   └── seo/
│       ├── schemas.ts          # JSON-LD schema builders
│       └── constants.ts        # Defaults (site name, default image, etc.)
├── routes/
│   └── sitemap.xml/
│       └── +server.ts          # Endpoint dinámico
static/
└── og-image.png                # Imagen OG por defecto (1200x630)
```
