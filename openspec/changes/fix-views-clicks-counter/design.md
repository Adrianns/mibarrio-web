## Context

El sistema de analytics para proveedores tiene la estructura de datos lista (columnas `view_count`, `contact_click_count` en `mb_providers` y tabla `mb_contact_clicks`), pero las funciones RPC que incrementan los contadores nunca fueron creadas en la base de datos.

El frontend llama a `mb_increment_provider_view` y `mb_log_contact_click` pero estas funciones no existen, causando errores silenciosos.

Adicionalmente, los clicks en Instagram y Facebook se registran como tipo genérico "social" en lugar del tipo específico.

## Goals / Non-Goals

**Goals:**
- Crear las funciones RPC faltantes en la base de datos
- Corregir el tracking de tipos de contacto específicos (instagram, facebook)
- Los contadores deben funcionar correctamente después del fix

**Non-Goals:**
- Deduplicación de vistas (evitar múltiples conteos del mismo usuario) - futuro enhancement
- Rate limiting para prevenir inflado artificial - futuro enhancement
- Historial temporal de vistas/clicks - futuro enhancement

## Decisions

### 1. Usar migración SQL directa
**Decisión**: Crear las funciones RPC mediante una migración SQL aplicada directamente.
**Rationale**: Es la forma estándar de modificar la base de datos en este proyecto.

### 2. Mantener la firma existente de las funciones
**Decisión**: Usar exactamente los nombres de parámetros que el frontend ya espera.
**Rationale**: Evita cambios en el frontend más allá de los tipos de contacto.

### 3. Tipos de contacto específicos
**Decisión**: Usar 'instagram' y 'facebook' como contact_type en lugar de 'social'.
**Rationale**: Permite analytics más granulares y coincide con el schema de la tabla.

## Risks / Trade-offs

- **[Sin deduplicación]** → Aceptable para MVP, se puede agregar después
- **[Fire-and-forget sin retry]** → Bajo riesgo, las vistas perdidas no son críticas
