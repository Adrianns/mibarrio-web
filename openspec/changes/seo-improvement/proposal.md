## Why

Mi Barrio necesita aparecer en Google cuando los usuarios busquen servicios locales. Actualmente la app tiene SEO mínimo: solo títulos de página y un robots.txt básico. Faltan elementos críticos como sitemap, meta tags sociales, y datos estructurados que Google usa para mostrar resultados enriquecidos.

## What Changes

- Agregar sitemap.xml dinámico que incluya todas las páginas y proveedores
- Implementar meta tags OpenGraph para compartir en redes sociales
- Agregar Twitter Cards para previews en Twitter/X
- Incluir canonical tags para evitar contenido duplicado
- Agregar datos estructurados JSON-LD (LocalBusiness para proveedores, Organization para el sitio)
- Crear componente SEO reutilizable para consistencia
- Mejorar meta descriptions en todas las páginas

## Capabilities

### New Capabilities
- `seo-meta`: Componente y utilidades para manejo centralizado de meta tags (OG, Twitter, canonical)
- `sitemap`: Endpoint dinámico /sitemap.xml que lista todas las páginas y proveedores
- `structured-data`: JSON-LD schemas para LocalBusiness, Organization, y BreadcrumbList

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **Código**: Nuevos archivos en `/src/lib/seo/`, modificaciones a layouts y páginas
- **Rutas**: Nueva ruta `/sitemap.xml`
- **Dependencias**: Ninguna nueva (uso de svelte:head nativo)
- **Base de datos**: Query adicional para listar proveedores públicos en sitemap
