## Why

El contador de vistas y clicks de los proveedores no está funcionando porque las funciones RPC (`mb_increment_provider_view` y `mb_log_contact_click`) no existen en la base de datos. Además, los clicks en Instagram y Facebook se registran como tipo genérico "social" en lugar del tipo específico.

## What Changes

- Crear las funciones RPC faltantes para incrementar vistas y registrar clicks
- Corregir el tipo de contacto para Instagram y Facebook (usar 'instagram'/'facebook' en lugar de 'social')
- Agregar manejo de errores en las llamadas RPC del frontend

## Capabilities

### New Capabilities
- None (this is a bug fix for existing functionality)

### Modified Capabilities
- `provider-analytics`: Fix RPC functions and contact type tracking to work correctly

## Impact

- **Database**: Crear funciones RPC `mb_increment_provider_view` y `mb_log_contact_click`
- **Frontend**: Modificar `/src/routes/directorio/[id]/+page.svelte` para usar tipos de contacto específicos (instagram, facebook)
- **Data**: Los contadores comenzarán a funcionar correctamente después del fix
